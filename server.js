const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });
const clients = new Map();
const http = require('http');
const url = require('url');

// Обробка підключення
server.on('connection', (ws, req) => {
    const clientId = req.url.split('=')[1]; // Отримуємо ID клієнта з URL (наприклад: ws://localhost:8080/?id=123)
    clients.add(clientId, ws);
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

const httpServer = http.createServer((req, res) => {
    // Визначаємо URL і метод запиту
    const parsedUrl = url.parse(req.url, true);

    try {
        // Обробка маршруту
        if (parsedUrl.pathname === '/disconnect' && req.method === 'GET') {
            handleDisconnect(req, res);
        }
    } catch (err) {
        // Загальна обробка помилок на сервері
        console.error('Серверна помилка:', err);
        handleInternalServerError(res); // Повертаємо помилку 500
    }
})

//
function handleDisconnect(req, res) {
    const clientId = req.query.id; // Очікуємо, що ID клієнта буде передано як параметр

    if (clients.has(clientId)) {
        const ws = clients.get(clientId);
        ws.close(); // Закриваємо WebSocket-з'єднання
        clients.delete(clientId); // Видаляємо зі списку клієнтів
        console.log(`Клієнт ${clientId} відключився`);
        res.status(200).send('Відключення виконано успішно');
    } else {
        res.status(404).send('Клієнт не знайдений');
    }
}

// Обробка помилки 500 (внутрішня помилка сервера)
function handleInternalServerError(res) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Внутрішня помилка сервера' }));
}
