'use strict'
const crypto = require('crypto')
const events = require('events')
const dataFrame = require('./data-frame')
const uuid = require('./uuid')

function sha1(str, digest) {
    if(typeof str !== 'string' && !(str instanceof String)) {
        try{
            str = str.toString()
        } catch(e) {
            throw 'parmars 1 should be string'
        }
    }
    return crypto.createHash('sha1').update(str).digest(digest || '')
}

function Socket() {
    events.EventEmitter.call(this)
    this.initialize.apply(this, arguments)
}

Socket.prototype = events.EventEmitter.prototype

Socket.prototype.initialize = function(socket, connections, hasUpgrade) {
    this.id = this._randomId()
    this.socket = socket
    this._connections = connections
    this._hasUpgrade = hasUpgrade || false

    socket.on('data', this._ondata.bind(this))
    socket.on('close', this._close.bind(this))
}
Socket.prototype.sendOthers = function(msg) {
    this.sendAll(msg, this.id)
}
Socket.prototype.sendAll = function(msg, escapeId) {
    for (const key in this._connections) {
        if (key !== escapeId) {
            this._connections[key].send(msg)
        }
    }
}
Socket.prototype.send = function(str, FIN, Opcode) {
    (typeof str !== 'string' && !(str instanceof String)) && (str = JSON.stringify(str))
    const sendMsg = dataFrame.encodeDataFrame({
        FIN: FIN || 1,
        Opcode: Opcode || 1,
        PayloadData: str
    })
    this.socket.write(sendMsg)
}
Socket.prototype.end = function() {
    this.send('connection is end', 1, 8)
}

Socket.prototype.receive = function(cb) {
    this.on('data', cb)
}
Socket.prototype._ondata = function(request) {
    if (!this._hasUpgrade) {
        const req = this._parseRequest(request)
        this.upgradeToWebSocket(req)
        this._hasUpgrade = true
    } else {
        const data = dataFrame.decodeDataFrame(request)
        if (data.Opcode === 8) {
            return this._close()
        }
        this.emit('data', data)
    }
}
Socket.prototype.upgradeToWebSocket = function(req) {
    const socket = this.socket
    if (!req['Sec-WebSocket-Key'])
        return this._close()
    const key = sha1(req['Sec-WebSocket-Key'] + uuid, 'base64')
    socket.write('HTTP/1.1 101 Switching Protocols\r\n')
    socket.write('Upgrade: websocket\r\n');
    socket.write('Connection: Upgrade\r\n');
    socket.write(`Sec-WebSocket-Accept: ${key}\r\n`)
    socket.write('\r\n')
}
Socket.prototype._close = function() {
    this.socket.end()
    this.emit('close', this.id)
}

Socket.prototype._parseRequest = function(request) {
    return request.toString().split('\r\n').slice(1).map(function(item) {
        const tmp = item.match(/(.+?)\s*:\s*(.+)/)
        if(tmp)
            return {
                [tmp[1]]: tmp[2]
            }
    }).reduce(function(prev, next) {
        return Object.assign(prev, next)
    })
}
Socket.prototype._randomId = function() {
    return sha1(Date.now() + Math.random(), 'base64')
}

module.exports = Socket