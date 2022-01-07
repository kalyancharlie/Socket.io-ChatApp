// Client to Server Socket Connection
const socket = io.connect(`https://socketio-web-chat-app.herokuapp.com/`);

// DOM Elements
const outputDiv = document.getElementById("chat_outputs");
const feedbackDiv = document.getElementById("feedback");
const handleInput = document.getElementById("handle_input");
const messageInput = document.getElementById("message_input");
const sendBtn = document.getElementById("send_btn");
const scrollDiv = document.getElementById('chats_div')

const messageProp = {
    userId: null,
    handle: null,
    message: null,
    isTyping: false,
    userColor: "black",
    messageSentTs: null,
};


// Vars
var id = null;
var socketId = null;
const colors = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
    "#008080",
    "#e6beff",
    "#9a6324",
    "#800000",
    "#808000",
    "#000075",
    "#808080",
    "#000000",
];
var userColor = "black";
var usersList = []

// Methods
// Socket Connection Establish Check
const isSocketDisconnected = () => {
    return new Promise((res, rej) => {
        socket.on("disconnect", () => {
            res(true, socket);
        });
    });
};

const isSocketConnected = () => {
    let MAX_RETRY_COUNT = 10;
    let retryCount = 0;
    return new Promise((res, rej) => {
        const retryId = setInterval(() => {
            retryCount += 1;
            if (retryCount > MAX_RETRY_COUNT) {
                clearInterval(retryId);
                rej(`Socket not Connected`);
            }
            if (socket.connected) {
                clearInterval(retryId);
                res(socket.id);
            }
        }, 1000);
    });
};

// Typing Emitter
const typingEmitter = (event, second) => {
    if (event.keyCode == 13) {
        sendMessage();
    }
    if (id) {
        clearTimeout(id);
    }
    const handle = handleInput.value;
    if (!handle) {
        return;
    } else {
    }
    socket.emit("typing", {...messageProp, handle, isTyping: true, userId: socketId, });
    id = setTimeout(() => {
        socket.emit("typing", { ...messageProp, handle, isTyping: false, userId: socketId });
    }, 2000);
};

// Send Message
const sendMessage = () => {
    const handle = handleInput.value;
    const message = messageInput.value;

    if (!handle || !message) {
        return;
    }

    socket.emit("chat", { ...messageProp, handle, isTyping: false, userId: socketId, message, userColor: userColor, messageSentTs: Date.now()});
    messageInput.value = "";
};

// Events
// Send Message Event Listener
sendBtn.addEventListener("click", sendMessage);

// Type Event Listener
messageInput.addEventListener("keydown", typingEmitter);

// Socket Listener
socket.on("chat", (data) => {
    if (!data.isTyping) {
        feedbackDiv.innerHTML = "";
    }
    const userName = data.userId == socket.id ? "You" : data.handle
    outputDiv.innerHTML += `<p class="${(data.userId == socket.id) ? 'right': ''}"><span class="handle-name" style="color:${data.userColor};">${userName}: </span>${data.message}</p>`;
    // scrollDiv.scrollTop = scrollDiv.scrollHeight
});

// Typing Listener
socket.on("typing", (data) => {
    if (data.isTyping) {
        feedbackDiv.innerHTML = `${data.handle} is typing...`;
    } else {
        feedbackDiv.innerHTML = "";
    }
});

// Users Listener
socket.on("activeUsers", (count) => {
    const usersCount = document.getElementById('users_count')
    usersCount.textContent = count
})

// Initialization
const initialize = () => {
    isSocketConnected()
        .then((socId) => {
            socketId = socId;
            userColor = colors[Math.floor(Math.random() * (colors.length - 1))];
        })
        .catch((err) => console.log(err));

    isSocketDisconnected().then((val) => {
        console.log("Server Disconnected");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    initialize();
});
