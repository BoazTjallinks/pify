# Pify
An easy to use control panel for your Raspberry PI or any other device that runs Linux*

# Setup
You'll have to make a `.env` file with the following format:
```
PASSWORD="Your Password Here"
```

It's recommend to start the script with PM2 so it will automatically reboot if the server restarts.
1. `npm i pm2 -g`
2. `sudo pm2 start app.js`
3. `sudo pm2 startup`
4. `sudo pm2 save`
Done! Now, when the device starts the panel will launch itself as well.

*= I'm not going to guarantee that the tool is gonna run on another device as it's coded for the Raspberry PI 3B+ and soon Pi 4B
