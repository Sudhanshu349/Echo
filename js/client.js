const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');

const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
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

socket.on('user-left', name => {
    append(`${name} left the room`, 'right');
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send-message', { message });
    messageInput.value = '';
});