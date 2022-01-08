// Client to Server Socket Connection
const socket = io.connect(`https://socketio-web-chat-app.herokuapp.com/`);

// DOM Elements
const outputDiv = document.getElementById("chat_outputs");
const feedbackDiv = document.getElementById("feedback");
const handleInput = document.getElementById("handle_input");
const messageInput = document.getElementById("message_input");
const sendBtn = document.getElementById("send_btn");
const scrollDiv = document.getElementById("chats_div");
const chat_outputs = document.getElementById("chat_outputs");
const scrollBtn = document.getElementById("unread_msgs_div");
const unreadMsgCountDiv = document.getElementById("uread_msgs_count");

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
var usersList = [];
var isScrolled = false;
var unSeenMsgsCount = 0;
var lastMsgSentUser = {
    handle: null,
    count: 0,
};

// Methods
// Socket Connection Establish Check
const isSocketDisconnected = () => {
    return new Promise((res, rej) => {
        socket.on("disconnect", () => {
            res(true, socket);
        });
    });
};

// Socket Connection Check
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
    socket.emit("typing", {
        ...messageProp,
        handle,
        isTyping: true,
        userId: socketId,
    });
    id = setTimeout(() => {
        socket.emit("typing", {
            ...messageProp,
            handle,
            isTyping: false,
            userId: socketId,
        });
    }, 1000);
};

// Send Message
const sendMessage = () => {
    const handle = handleInput.value;
    const message = messageInput.value;

    if (!handle || !message) {
        return;
    }
    let meessageTs = new Date();
    let formattedTime = meessageTs.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });
    socket.emit("chat", {
        ...messageProp,
        handle,
        isTyping: false,
        userId: socketId,
        message,
        userColor: userColor,
        messageSentTs: formattedTime,
    });
    messageInput.value = "";
};

// Update Button Visiblity
const toggleScrollBtn = (status) => {
    if (status.toUpperCase() == "SHOW") {
        // scrollBtn.style.display = "flex";
        scrollBtn.classList.remove("hidden");
    } else {
        // scrollBtn.style.display = "none";
        scrollBtn.classList.add("hidden");
        unreadMsgCountDiv.classList.add("hidden");
    }
    if (unSeenMsgsCount > 0) {
        // unreadMsgCountDiv.style.display = "flex";
        unreadMsgCountDiv.classList.remove("hidden");
    } else {
        // unreadMsgCountDiv.style.display = "none";
        unreadMsgCountDiv.classList.add("hidden");
    }
};

// Message Element Creator
const createMessageElement = (parentNode, messageSender, data) => {
    const messageContainerEle = document.createElement("div");
    messageContainerEle.classList.add("message-container");
    if (data.userId == socket.id) {
        messageContainerEle.style.marginLeft = "auto";
    } else {
        messageContainerEle.style.marginRight = "auto";
    }

    const messageSenderEle = document.createElement("div");
    messageSenderEle.textContent = messageSender;
    messageSenderEle.style.color = data.userColor;
    messageSenderEle.classList.add("message-sender");

    const messageContentEle = document.createElement("div");
    messageContentEle.textContent = data.message;
    messageContentEle.classList.add("message-content");

    const messageTimeEle = document.createElement("div");
    messageTimeEle.textContent = data.messageSentTs;
    messageTimeEle.classList.add("message-time");

    let arr = [];
    if (data.userId == socket.id || lastMsgSentUser.count > 1) {
        arr = [messageContentEle, messageTimeEle];
    } else {
        arr = [messageSenderEle, messageContentEle, messageTimeEle];
    }
    arr.forEach((ele) => messageContainerEle.appendChild(ele));
    parentNode.appendChild(messageContainerEle);
};

// Update Chat
const updateChat = (data) => {
    const isCurrentUser = data.userId == socket.id;
    const userName = isCurrentUser ? "You" : data.handle;
    createMessageElement(outputDiv, userName, data);
};

// Events
// Send Message Event Listener
sendBtn.addEventListener("click", sendMessage);

// Type Event Listener
messageInput.addEventListener("keydown", typingEmitter);

// Scroll Listener
scrollDiv.addEventListener("scroll", () => {
    isScrolled = true;
    let isAtEnd =
        Math.abs(
            scrollDiv.scrollHeight -
                Math.ceil(scrollDiv.offsetHeight) -
                Math.ceil(scrollDiv.scrollTop)
        ) <= 3;
    if (isAtEnd) {
        unSeenMsgsCount = 0;
        toggleScrollBtn("HIDE");
    } else {
        toggleScrollBtn("SHOW");
    }
});

// Scroll Button Listener
scrollBtn.addEventListener("click", () => {
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
});

// Socket Listener
socket.on("chat", (data) => {
    if (!data.isTyping) {
        feedbackDiv.innerHTML = "";
    }

    let isScrollToBottom = true;
    let isAtMiddle =
        Math.abs(
            scrollDiv.scrollHeight -
                Math.ceil(scrollDiv.offsetHeight) -
                Math.ceil(scrollDiv.scrollTop)
        ) >= 2;
    if ((scrollDiv.scrollTop == 0 && isScrolled) || isAtMiddle) {
        isScrollToBottom = false;
        unSeenMsgsCount += 1;
        unreadMsgCountDiv.innerText = unSeenMsgsCount;
        if (isScrolled) {
            toggleScrollBtn("SHOW");
        }
    }
    const isCurrentUser = data.userId == socket.id;
    if (!isCurrentUser) {
        if (lastMsgSentUser.handle != null) {
            if (lastMsgSentUser.handle != data.userId) {
                lastMsgSentUser.handle = data.userId;
                lastMsgSentUser.count = 1;
            } else {
                lastMsgSentUser.handle = data.userId;
                lastMsgSentUser.count += 1;
            }
        } else {
            lastMsgSentUser.handle = data.userId;
            lastMsgSentUser.count = 1;
        }
    } else {
        lastMsgSentUser.handle = data.userId;
        lastMsgSentUser.count = 1;
    }
    updateChat(data);
    if (isScrollToBottom || isCurrentUser) {
        scrollDiv.scrollTop = scrollDiv.scrollHeight;
        unSeenMsgsCount = 0;
        toggleScrollBtn("HIDE");
        unreadMsgCountDiv.innerText = unSeenMsgsCount;
    }
});

// Typing Listener
socket.on("typing", (data) => {
    let prevTypingStatus = feedbackDiv.textContent;
    if (data.isTyping) {
        if (prevTypingStatus != `${data.handle} is typing...`) {
            feedbackDiv.innerHTML = `${data.handle} is typing...`;
        }
    } else {
        feedbackDiv.innerHTML = "";
    }
});

// Users Listener
socket.on("activeUsers", (count) => {
    const usersCount = document.getElementById("users_count");
    usersCount.textContent = count;
});

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
