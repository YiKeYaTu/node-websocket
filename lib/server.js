'use strict'

const Socket = require('./socket')
const events = require('events')
const net = require('net')
const http = require('http')

function Server(server) {
    if(!(this instanceof Server)) 
        return new Server(server)
    this.initialize.apply(this, arguments)
}

Server.prototype = new events.EventEmitter

Server.prototype.initialize = function(server) {
    this.connections = {}
    if (server instanceof http.Server) {
        server.on('upgrade', this._handleUpgrade.bind(this))
    }
    server.on('connection', this._handleSocketConnection.bind(this))
}
// 一个请求接受到将会把该socket对象放入连接池中
Server.prototype._append = function(id, ws) {
    this.connections[id] = ws
}
Server.prototype._handleUpgrade = function(req, socket, head) {
    socket.on('data', function() {})
    socket.on('close', function() {})
}
Server.prototype._handleSocketConnection = function(socket) {
    const ws = new Socket(socket)
    ws.on('close', function(id) {
        delete this.connections[id]
    }.bind(this))
    this._append(ws.id, ws)
    this.emit('connection', ws)
}

module.exports = Server