import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware для парсинга тела запроса
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'styls')));

// Настройка базы данных
const db = new sqlite3.Database('./kinotheater.db');

// Создаём таблицу пользователей
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для регистрации
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password, function(err) {
        if (err) {
            return res.status(500).send('Ошибка при регистрации пользователя');
        }
        res.redirect('/');
    });
    stmt.finalize();
});


app.get('/check-auth', (req, res) => {
    
    res.json({ loggedIn: true }); 
});


app.get('/movies', (req, res) => {
    const date = req.query.date;
    // Логика получения данных о фильмах
    db.all('SELECT * FROM movies WHERE date = ?', [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json(rows);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
