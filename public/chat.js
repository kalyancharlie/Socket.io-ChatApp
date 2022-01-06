// Client to Server Socket Connection
const PORT = 3000;
const socket = io.connect(`http://localhost:${PORT}`);

// DOM Elements
const outputDiv = document.getElementById("output");
const feedbackDiv = document.getElementById("feedback");
const handleInput = document.getElementById("handle");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");

// Events
sendBtn.addEventListener("click", () => {
    const handle = handleInput.value;
    const message = messageInput.value;
    console.log(handle, message);

    if (!handle || !message) {
        return;
    }

    socket.emit("chat", { handle, message, isTyping: false });
    messageInput.value = "";
});

var id = null;

// Typing True Emitter
const typingTrueEmitter = () => {
    if (id) {
        clearTimeout(id)
    }
    const handle = handleInput.value;
    socket.emit("typing", { handle, isTyping: true });
};
// Typing False Emitter
const typingFalseEmitter = () => {
    const handle = handleInput.value;
    socket.emit("typing", { handle, isTyping: false });
};

messageInput.addEventListener("keypress", typingTrueEmitter);

messageInput.addEventListener("keyup", () => {
    if(id) {
        clearTimeout(id)
    }
    id = setTimeout(() => {
        typingFalseEmitter();
    }, 2000)
});

// Socket Listener
socket.on("chat", (data) => {
    console.log(socket.id)
    if(!data.isTyping) {
        feedbackDiv.innerHTML = "";
    }
    outputDiv.innerHTML += `<p><strong>${data.handle}:</strong>${data.message}</p>`;
    console.log("Client Side Received Data", data);
});

// Typing Listener
socket.on("typing", (data) => {
    if (data.isTyping) {
        feedbackDiv.innerHTML = `<p><em>${data.handle} is typing a message...</em></p>`;
    } else {
        feedbackDiv.innerHTML = "";
    }
});
