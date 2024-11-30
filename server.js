const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });
const clients = new Set();

// Обробка підключення
server.on('connection', (ws) => {
    clients.add(ws);
    console.log('Користувач приєднався');

    // Сповіщення всім клієнтам про новий підключений користувач
    broadcast('Новий користувач приєднався');

    // Обробка повідомлень
    ws.on('message', (message) => {
        console.log('Отримане повідомлення:', message);
        broadcast(message);  // Ретрансляція повідомлення усім клієнтам
    });

    // Обробка відключення
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Користувач від’єднався');
        broadcast('Користувач залишив чат');
    });

    // Обробка помилок
    ws.on('error', (error) => {
        console.error('Помилка з’єднання:', error);
    });
});

// Ретрансляція повідомлення всім підключеним клієнтам
function broadcast(message) {
    for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

console.log('Сервер чату запущено на ws://localhost:3000');
