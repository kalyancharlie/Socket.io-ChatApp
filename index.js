const express = require('express')
const socket = require("socket.io")
const morgan = require("morgan")
const app = express()

var prevCount = 0;
var count = 0;
// Serving Files Loc
app.use(express.static('public'))

// Morgan
app.use(morgan('common'))

// Server
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

// Socket.io Setup
const io = socket(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    count += 1
    socket.on("disconnect", (socket) => {
        count -= 1
        usersCountEmitter(count)
    })
    // Chat Listener
    socket.on('chat', (data) => {
        console.log(data)
        io.sockets.emit('chat', data)
    })
    // Typing Listener
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data)
    })
    usersCountEmitter(count)
})

// Users Count Listener
const usersCountEmitter = (count) => {
    if(prevCount != count) {
        prevCount = count
        io.sockets.emit('activeUsers', count)
    }
    return
}