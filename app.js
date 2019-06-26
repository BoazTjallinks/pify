// Start
console.log('[APP] Booting!')

// Libraries
const os = require('os');
const express = require('express')
const si = require('systeminformation')
const exec = require('child_process').exec;
const cookieParser = require('cookie-parser')
const uuid = require('uuid')
const path = require('path')
const osu = require('node-os-utils')
require('dotenv').config()

// Application
const app = express()
const cpu = osu.cpu

// Local configuration
const port = 80

// Important
let sessionKey = uuid.v4()
console.log('[APP] Session token for this restart: ' + sessionKey)

// Middleware
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.disable('x-powered-by')
app.use(cookieParser())
app.use(express.static('static'))

// Execute function
function execute(command, callback) {
  exec(command, function (error, stdout, stderr) {
    callback(stdout);
  });
}

app.get('/login', (req, res) => {
  let session = req.cookies.session
  if (session === sessionKey) {
    return res.redirect('/')
  }
  res.render('login')
})

app.post('/login', (req, res) => {
  let password = process.env.PASSWORD
  let formPassword = req.body.password
  if (password === undefined || password === "" || password === null) {
    res.render('login', {
      checkpassword: false
    })
  } else if (formPassword === undefined || formPassword === "" || formPassword === null) {
    res.render('login', {
      checkpassword: false
    })
  } else {
    if (password === formPassword) {
      res.cookie('session', sessionKey)
      res.redirect('/')
    } else {
      res.render('login', {
        checkpassword: false
      })
    }
  }

})

// Check if logged in
app.get('/heartbeat', (req, res) => {
  let session = req.cookies.session
  if (session === sessionKey) {
    res.json({
      success: true,
      login: true
    })
  } else {
    res.json({
      success: true,
      login: false
    })
  }
})

// Authentication function
function auth(req, res, next) {
  let session = req.cookies.session
  if (session !== sessionKey) {
    res.cookie('session', 'reset')
    res.redirect('/login')
  } else {
    next()
  }
}

app.get('/', auth, (req, res) => {
  res.render('index')
})

app.get('/data', auth, async (req, res) => {
  let temp = 0;
  let memtotal = 0;
  let memfree = 0;
  let memused = 0;
  let memper = 0;
  let cpudata = 0;
  try {
    await si.cpuTemperature(d => {
      temp = d.main
    })

    await si.mem(d => {
      memtotal = parseInt(d.total / 1000000000)
      memused = parseInt(d.used / 1000000000)
      memper = (100 / d.total) * d.used
    })

    await cpu.usage()
      .then(d => {
        cpudata = d
      })

    await res.json({
      success: true,
      temperature: temp,
      ram: memper,
      memtotal: memtotal,
      memused: memused,
      cpu: cpudata
    })
  } catch (e) {
    console.error(e);
    await res.json({
      success: false,
      message: "Something went wrong, check the console."
    })
  }
})

app.get('/deviceinfo', auth, async (req, res) => {
  let hostname = 'unknown'
  let cpu = 'unknown'
  let operatingsystem = 'unknown'
  let nodeIp = 'unknown'
  var ip = require('ip');

  try {
    hostname = await os.hostname()
    cpu = await os.cpus()
    operatingsystem = await os.type()
    nodeIp = await ip.address()
    await res.json({
      success: true,
      hostname: hostname,
      cpu: cpu[0].model,
      os: operatingsystem,
      ip: nodeIp
    })
  } catch (e) {
    console.error(e);
    await res.json({
      success: false,
      message: "Something went wrong, check the console."
    })
  }
})

app.get('/reboot', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Restarting, be right back.'
  })
  console.log('[APP] Rebooting, be right back.')
  try {
    execute('sudo reboot', d => {
      console.log(d)
    })
  } catch (_) {
    res.json({
      success: false,
      message: 'Something went wrong while performing this actions, try again later.'
    })
    console.log(_)
  }
})

app.get('/shutdown', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Shutting down, please manually restart the device if you want to use it again.'
  })
  console.log('[APP] Shutting down.')
  try {
    execute('sudo shutdown -h now', d => {
      console.log(d)
    })
  } catch (_) {
    res.json({
      success: false,
      message: 'Something went wrong while performing this actions, try again later.'
    })
    console.log(_)
  }
})

app.get('/freeram', auth, (req, res) => {
  try {
    console.log('[APP] Freeing Ram')
    execute('sudo echo 3 | sudo tee /proc/sys/vm/drop_caches', d => {
      console.log(d)
    })
    res.json({
      success: true,
      message: 'Freed memory.'
    })
  } catch (_) {
    res.json({
      success: false,
      message: 'Something went wrong while performing this actions, try again later.'
    })
    console.log(_)
  }
})

app.listen(port, () => console.log(`[APP] Live on port ${port}!`))
