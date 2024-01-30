const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer((req, res) => {
    res.end('Serveur WebSocket en fonctionnement');
});

// Configuration de CORS pour Socket.IO
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:8888", // Permet les requêtes depuis votre serveur web
        methods: ["GET", "POST"]
    }
});

// Stocke les utilisateurs connectés
const users = {}; // Clé: ID de socket, Valeur: Pseudo

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    socket.on('new-user', (pseudo) => {
        users[socket.id] = pseudo;
        io.emit('users-list', Object.values(users)); // Envoie la liste mise à jour à tous les clients
    });

    // Gestion des messages envoyés par les utilisateurs
    socket.on('send-message', (message) => {
        console.log('Message reçu:', message);
        // Diffuse le message à tous les autres utilisateurs
        // Pour un chat privé, vous devrez identifier le destinataire et utiliser socket.to(destSocketId).emit(...)
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
        delete users[socket.id]; // Supprime l'utilisateur déconnecté
        io.emit('users-list', Object.values(users)); // Met à jour la liste pour tous les clients
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur WebSocket écoutant sur le port ${PORT}`);
});
