# 简介

- 简易websocket封装

# 后端

- 使用net或者http模块进行通信

````javascript
    var http = require('http').createServer()
    var Server = require('node-websocket')(http)
    Server.on('connection', function(socket) {
        socket.on('data', function(msg) {
            socket.send({
                msg: 'hello' + msg.PayloadData
            })
            console.log(msg)
        })
    })

````