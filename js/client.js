const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const fileInput = document.getElementById('fileInp'); // 📂 file input

// ✅ Fix: support text & HTML
const append = (message, position, isHTML = false) => {
    const messageElement = document.createElement('div');
    if (isHTML) {
        messageElement.innerHTML = message;
    } else {
        messageElement.innerText = message;
    }
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);
};

// Ask user name + room
const name = prompt("Enter your name:");
const room = prompt("Enter room name to join:");
socket.emit('join-room', { name, room });

// User joined
socket.on('user-joined', name => {
    append(`${name} joined the room`, 'right');
});

// Receive text message
socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

// ✅ Receive file
socket.on('receive-file', data => {
    if (data.fileType.startsWith("image/")) {
        append(`${data.name}: <br><img src="${data.file}" width="200"/>`, "left", true);
    } else {
        append(`${data.name}: <a href="${data.file}" download="${data.fileName}">Download ${data.fileName}</a>`, "left", true);
    }
});

// User left
socket.on('user-left', name => {
    append(`${name} left the room`, 'right');
});

// Send text message
form.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.trim() !== "") {
        append(`You: ${message}`, 'right');
        socket.emit('send-message', { message });
        messageInput.value = '';
    }
});

// ✅ Send file
fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        socket.emit("send-file", {
            name,
            fileName: file.name,
            fileType: file.type,
            file: evt.target.result, // base64
        });

        // Show file immediately in sender’s chat
        if (file.type.startsWith("image/")) {
            append(`You: <br><img src="${evt.target.result}" width="200"/>`, "right", true);
        } else {
            append(`You: <a href="${evt.target.result}" download="${file.name}">Download ${file.name}</a>`, "right", true);
        }
    };
    reader.readAsDataURL(file);
});
