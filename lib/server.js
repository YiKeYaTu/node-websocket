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
    this.middleware = []
    this.middlewareCount = -1
    if (server instanceof http.Server) {
        server.on('upgrade', this._handleUpgrade.bind(this))
    }
    server.on('connection', this._handleSocketConnection.bind(this))
}
Server.prototype.use = function(middleware) {
    if (typeof middleware !== 'function')
        throw 'middleware must be a function'
    this.middleware.push(middleware)
}
Server.prototype._next = function(socket) {
    return function next() {
        const count = this.middlewareCount++
        this.middleware[count](socket, next)
    }.bind(this)
}
Server.prototype._append = function(id, ws) {
    this.connections[id] = ws
}
Server.prototype._handleUpgrade = function(req, socket, head) {
    socket.on('data', function() {})
    socket.on('close', function() {})
}
Server.prototype._handleSocketConnection = function(socket) {
    const ws = new Socket(socket, this.connections)
    this._next(ws)()
    ws.on('close', function(id) {
        delete this.connections[id]
    }.bind(this))
    this._append(ws.id, ws)
    this.emit('connection', ws)
}
module.exports = Server