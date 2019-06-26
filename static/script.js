    function restart() {
      fetch('/reboot')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          console.log(JSON.stringify(d));
          alert(d.message)
        });
    }

    function shutdown() {
      fetch('/shutdown')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          console.log(JSON.stringify(d));
          alert(d.message)
        });
    }

    function freeRam() {
      fetch('/freeram')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          console.log(JSON.stringify(d));
          alert(d.message)
        });
    }

    function refresh() {
      location.reload();
    }

    function getData() {
      fetch('/data')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          let ram = ~~(d.ram)
          let cpu = ~~(d.cpu)
          let temp = ~~(d.temperature)
          $('#ramusage').attr('aria-valuenow', ram).css('width', ram + '%').html('RAM: ' + ram + '%')
          $('#cpu').attr('aria-valuenow', cpu).css('width', cpu + '%').html('CPU: ' + cpu + '%')
          $('#raminfo').prop('title', d.memused + 'GB/' + d.memtotal + 'GB');
          if (temp < 50) {
            $('#temperature').html(temp + '&#8451;').attr("class", "badge badge-primary");
          } else if (temp >= 50 && temp <= 65) {
            $('#temperature').html(temp + '&#8451;').attr("class", "badge badge-warning");
          } else if (temp < 65) {
            $('#temperature').html(temp + '&#8451;').attr("class", "badge badge-danger");
          }
        });
    }

    function getDevice() {
      fetch('/deviceinfo')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          $('#hostname').text(d.hostname)
          $('#cpuname').text(d.cpu)
          $('#operatingsystem').text(d.os)
          $('#connectAddress').text(d.ip)
        })
    }

    function heartbeat() {
      fetch('/heartbeat')
        .then(function (response) {
          return response.json();
        })
        .then(function (d) {
          if (d.login === false) {
            window.location.href = "/login"
          }
        })
    }
    $(document).ready(function () {
      getDevice()
      getData()
      heartbeat()
      setInterval(() => {
        getData()
      }, 5000);
      setInterval(() => {
        heartbeat()
      }, 10000);
    });
