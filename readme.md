# 简介

- 简易websocket封装

# 后端

- 使用net或者http模块进行通信

````javascript
    var http = require('http').createServer()
    var Server = require('node-websocket')(http)
    Server.on('connection', function(socket) {
        socket.on('data', function(msg) {
            socket.sendOthers({
                msg: 'hello and there is a message from ' + socket.id + ': ' + msg.PayloadData
            })
        })
    })
    http.listen(8080)
````
# 前端

- 使用html5 WebSocket原生对象进行连接
````javascript
    var ws = new WebSocket('ws:localhost:8080')
    ws.onmessage = function(msg) {
        console.log(msg)
    }
````
    