document.addEventListener('DOMContentLoaded', function() {
    const pseudo = sessionStorage.getItem('pseudo'); 
    if (!pseudo) {
        window.location.href = 'index.html';
        return;
    }

    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        socket.emit('new-user', pseudo);
    });

    socket.on('users-list', (users) => {
        displayUsers(users);
    });

    socket.on('message', (message) => {
        displayMessage(message);
        if (message.from !== pseudo) {
            showNotification(message.from);
        }
    });

    function showNotification(fromUser) {
        const notificationElement = document.getElementById(`notif-${fromUser}`);
        if (notificationElement) {
            notificationElement.style.display = 'inline';
        }
    }

    function displayUsers(users) {
        const usersPanel = document.getElementById('users-panel');
        usersPanel.innerHTML = '<h2>Contacts</h2>';
        users.forEach(user => {
            if (user !== pseudo) {
                const userDiv = document.createElement('div');
                userDiv.textContent = user;
                userDiv.classList.add('user');
                userDiv.onclick = function() {
                    createConversationPanel(user);
                };
                usersPanel.appendChild(userDiv);
            }
        });
    }

    function createConversationPanel(userName) {
        activeConversationUser = userName;
        const conversationPanel = document.getElementById('conversation-panel');
        conversationPanel.innerHTML = `<h2>Conversation avec ${userName}</h2>`;
        const messageList = document.createElement('ul');
        messageList.id = 'message-list';
        conversationPanel.appendChild(messageList);

        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Écrivez un message...';
        messageInput.id = 'message-input';

        const sendMessageButton = document.createElement('button');
        sendMessageButton.textContent = 'Envoyer';
        sendMessageButton.onclick = function() {
            sendMessage(userName, messageInput.value);
            messageInput.value = '';

            // Réinitialiser la notification (correction : ajouté ici)
            const notificationElement = document.getElementById(`notif-${userName}`);
            if (notificationElement) {
                notificationElement.style.display = 'none';
            }
        };

        conversationPanel.appendChild(messageInput);
        conversationPanel.appendChild(sendMessageButton);
    }

    function sendMessage(to, text) {
        if (text.trim()) {
            const message = { from: pseudo, to: to, text: text };
            socket.emit('send-message', message);
        }
    }

    function displayMessage(message) {
        if ((message.to === pseudo || message.from === pseudo) && (message.from === activeConversationUser || message.to === activeConversationUser)) {
            const messageList = document.getElementById('message-list');
            if (messageList) {
                const messageItem = document.createElement('li');
                messageItem.textContent = `${message.from}: ${message.text}`;
                messageList.appendChild(messageItem);
            }
        }
    }
});
