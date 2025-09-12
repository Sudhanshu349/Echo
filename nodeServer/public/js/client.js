const socket = io('https://echo-1-hygq.onrender.com');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const fileInput = document.getElementById('fileInp'); // 📂 file input

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

const name = prompt("Enter your name:");
const room = prompt("Enter room name to join:");
socket.emit('join-room', { name, room });

socket.on('user-joined', name => {
    append(`${name} joined the room`, 'right');
});

socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on('receive-file', data => {
    if (data.fileType.startsWith("image/")) {
        append(`${data.name}: <br><img src="${data.file}" width="200"/>`, "left", true);
    } else {
        append(`${data.name}: <a href="${data.file}" download="${data.fileName}">Download ${data.fileName}</a>`, "left", true);
    }
});

socket.on('user-left', name => {
    append(`${name} left the room`, 'right');
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.trim() !== "") {
        append(`You: ${message}`, 'right');
        socket.emit('send-message', { message });
        messageInput.value = '';
    }
});

fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        socket.emit("send-file", {
            name,
            fileName: file.name,
            fileType: file.type,
            file: evt.target.result, 
        });

        if (file.type.startsWith("image/")) {
            append(`You: <br><img src="${evt.target.result}" width="200"/>`, "right", true);
        } else {
            append(`You: <a href="${evt.target.result}" download="${file.name}">Download ${file.name}</a>`, "right", true);
        }
    };
    reader.readAsDataURL(file);
});
