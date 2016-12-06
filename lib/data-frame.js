'use strict'
function decodeDataFrame(e){
    var i = 0, j, s, frame = {
        FIN: e[i] >> 7,
        Opcode: e[i++] & 15,
        Mask: e[i] >> 7,
        PayloadLength: e[i++] & 0x7F
    }
    if(frame.PayloadLength == 126)
        frame.length = (e[i++] << 8) + e[i++]
    if(frame.PayloadLength == 127)
        i += 4,
    frame.length = (e[i++]<<24)+(e[i++]<<16)+(e[i++]<<8)+e[i++]
    if(frame.Mask){
        frame.MaskingKey = [e[i++],e[i++],e[i++], e[i++]]
        for(j = 0, s = []; j < frame.PayloadLength; j ++)
          s.push(e[i+j]^frame.MaskingKey[j%4])
    } else s = e.slice(i,frame.PayloadLength)
    s = new Buffer(s)
    if(frame.Opcode === 1)
        s = s.toString()
    frame.PayloadData = s
    return frame
}

function encodeDataFrame(e){
    var s=[], o = new Buffer(e.PayloadData), l = o.length
    s.push((e.FIN<<7) + e.Opcode)
    if(l < 126) 
        s.push(l)
    else if(l < 0x10000) 
        s.push(126,(l&0xFF00)>>2, l&0xFF)
    else s.push(
        127, 
        0,0,0,0,
        (l&0xFF000000)>>6,(l&0xFF0000)>>4,(l&0xFF00)>>2,l&0xFF
    )
    return Buffer.concat([new Buffer(s),o])
}
module.exports = {
    decodeDataFrame,
    encodeDataFrame,
}