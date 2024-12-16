const socket = new WebSocket('ws://localhost:3000');

// Останнє повідомлення, яке отримано
let lastMessageTime = Date.now();

socket.onmessage = (event) => {
    const chat = document.getElementById('chat');
    const newMessage = document.createElement('div');
    newMessage.innerText = event.data;

    // Виведення нового повідомлення в чат
    chat.appendChild(newMessage);
    chat.scrollTop = chat.scrollHeight;

    // Перевірка, чи повідомлення нове, і якщо користувач неактивний, показати сповіщення
    if (Date.now() - lastMessageTime > 5000) { // Якщо повідомлення не приходило більше 5 секунд
        showNotification(event.data);
    }

    // Оновлюємо час останнього повідомлення
    lastMessageTime = Date.now();
};

// Відправка повідомлення на сервер
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.send(message);
    messageInput.value = '';  // очищуємо поле вводу
}

// Відключення користувача від чату
function handleDisconnect() {
    const clientId = Math.random().toString(36).substring(2, 10); // Генеруємо унікальний ID клієнта
    fetch(`/disconnect?id=${clientId}`, {
        method: 'GET',
    })
        .then((response) => {
            if (response.ok) {
                socket.close();
                alert('Ви відключились від чату');
            } else {
                alert('Помилка відключення');
            }
        })
        .catch((error) => {
            console.error('Помилка запиту:', error);
        });
}

// Функція для показу сповіщення для користувачів, які неактивні
function showNotification(message) {
    if (Notification.permission === "granted") {
        const notification = new Notification("Нове повідомлення!", {
            body: message,
            icon: "https://via.placeholder.com/50"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                const notification = new Notification("Нове повідомлення!", {
                    body: message,
                    icon: "https://via.placeholder.com/50"
                });
            }
        });
    }
}

// Попросити користувача дозволити сповіщення
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}
