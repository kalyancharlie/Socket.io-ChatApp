const express = require('express')
const socket = require("socket.io")
const morgan = require("morgan")
const app = express()

// Serving Files Loc
app.use(express.static('public'))

// Morgan
app.use(morgan('dev'))

// Server
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})


// Socket.io Setup
const io = socket(server)

io.on('connection', (socket) => {
    // console.log(`Socket Connected: ${socket.id}`)
    console.log("Connected")
    // Chat Listener
    socket.on('chat', (data) => {
        console.log(socket.id)
        console.log("Server Side Received Data:", data)
        io.sockets.emit('chat', data)
    })

    // Typing Listener
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data)
    })
})
