const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/poll', function (req, res) {
    // handle connection timeout
    let timeout = false;
    let timer = setTimeout(function () {
        timeout = true;
        client.close();
        res.send({
            error: 'Connection time out'
        });
    }, 1000);
    // connect to PLC
    client.connectTCP("192.168.0.10", {
            port: 502
        })
        .then(function () {
            if (timeout)
                return;
            clearTimeout(timer);
            client.setID(1);
            client.setTimeout(1000);
            console.log("Poll Connected");
            read(res); // read registers
        })
        .catch(function (e) {
            if (timeout)
                return;
            res.send({
                error: e.message
            });
        });
})

app.post('/write', function (req, res) {
    let val = parseInt(req.body.value);
    if (isNaN(val)) {
        res.send({
            error: 'Invalid value. Accepts 0 or 1.'
        });
    } else {
        // handle connection timeout
        let timeout = false;
        let timer = setTimeout(function () {
            timeout = true;
            client.close();
            res.send({
                error: 'Connection time out'
            });
        }, 1000);
        // connect to PLC
        client.connectTCP("192.168.0.10", {
                port: 502
            })
            .then(function () {
                if (timeout)
                    return;
                clearTimeout(timer);
                client.setID(1);
                client.setTimeout(1000);
                console.log("Write Connected");
                // write to register #3
                client.writeRegister(2, val)
                    .then(function () {
                        read(res); // read registers
                    })
                    .catch(function (e) {
                        close();
                        res.send({
                            error: e.message
                        });
                    })
            })
            .catch(function (e) {
                if (timeout)
                    return;
                res.send({
                    error: e.message
                });
            });
    }
});

app.listen(3000, function () {
    console.log('Modbus test app listening on port 3000.')
});

function read(res) {
    client.readHoldingRegisters(0, 3)
        .then(function (d) {
            console.log(d)
            res.send({
                result: d.data
            });
        })
        .catch(function (e) {
            res.send({
                error: e.message
            });
        })
        .then(close);
}

function close() {
    client.close();
}