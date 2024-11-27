// app.js

import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';


const app = express();
const port = 3000;

// Определение __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка сессий
app.use(session({
  secret: 'ваш_секретный_ключ', // Рекомендуется хранить в переменных окружения
  resave: false,
  saveUninitialized: true
}));

// Middleware для обработки данных формы
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Подключение статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация базы данных SQLite
const db = new sqlite3.Database(path.join(__dirname, 'kinotheater.db'), (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
  } else {
    console.log('Подключено к базе данных SQLite.');
  }
});

// Создание таблицы users
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`, (err) => {
  if (err) {
    console.error('Ошибка при создании таблицы users:', err.message);
  } else {
    console.log('Таблица users готова.');
  }
});

// Создание таблицы movies
db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    rating REAL,
    description TEXT,
    release_date TEXT,
    category TEXT,
    pushkin_card_payment INTEGER,
    age_rating TEXT,
    image TEXT
)`, (err) => {
    if (err) {
        console.error('Ошибка при создании таблицы movies:', err.message);
    } else {
        console.log('Таблица movies готова.');
    }
});

// Остальной код маршрутов...

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

app.get('/movies', (req, res) => {
  const date = req.query.date;
  if (!date) {
      return res.status(400).json({ error: 'Дата не указана' });
  }

  const sql = 'SELECT * FROM movies WHERE release_date = ?';
  db.all(sql, [date], (err, rows) => {
      if (err) {
          console.error('Ошибка при получении фильмов:', err.message);
          return res.status(500).json({ error: 'Ошибка сервера' });
      }
      res.json(rows);
  });
});

// Маршрут для получения всех фильмов
app.get('/all-movies', (req, res) => {
  const sql = 'SELECT * FROM movies';
  db.all(sql, [], (err, rows) => {
      if (err) {
          console.error('Ошибка при получении фильмов:', err.message);
          return res.status(500).json({ error: 'Ошибка сервера' });
      }
      res.json(rows);
  });
});

// Маршрут для получения информации о конкретном фильме
app.get('/movie/:id', (req, res) => {
  const movieId = req.params.id;
  const sql = 'SELECT * FROM movies WHERE id = ?';
  db.get(sql, [movieId], (err, row) => {
      if (err) {
          console.error('Ошибка при получении фильма:', err.message);
          return res.status(500).json({ error: 'Ошибка сервера' });
      }
      if (!row) {
          return res.status(404).json({ error: 'Фильм не найден' });
      }
      res.json(row);
  });
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Маршрут для обработки регистрации пользователей
app.post('/register', (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Проверка наличия всех полей
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
  }

  // Проверка совпадения паролей
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Пароли не совпадают.' });
  }

  // Проверка сложности пароля
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  // Хеширование пароля
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Ошибка хеширования пароля:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }

    // Сохранение пользователя в базе данных
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Имя пользователя уже занято.' });
        }
        console.error('Ошибка при добавлении пользователя в базу данных:', err);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
      }

      // Регистрация прошла успешно
      res.json({ message: 'Регистрация успешна!' });
    });
  });
});

// Функция для проверки сложности пароля
function validatePassword(password) {
  const minLength = 6;
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);

  if (password.length < minLength) {
    return 'Пароль должен быть не менее ' + minLength + ' символов.';
  }
  if (!hasLetters || !hasNumbers) {
    return 'Пароль должен содержать буквы и цифры.';
  }
  return '';
}

// Маршрут для отображения страницы входа (уже есть)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Маршрут для обработки входа пользователя
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Проверка наличия имени пользователя и пароля
  if (!username || !password) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны для заполнения.' });
  }

  // Поиск пользователя в базе данных
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }

    if (!user) {
      // Пользователь не найден
      return res.status(400).json({ error: 'Неверное имя пользователя или пароль.' });
    }

    // Проверка пароля
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Ошибка при сравнении паролей:', err);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
      }

      if (result) {
        // Пароль верный, устанавливаем сессию
        req.session.userId = user.id;
        res.json({ message: 'Вход выполнен успешно!' });
      } else {
        // Неверный пароль
        res.status(400).json({ error: 'Неверное имя пользователя или пароль.' });
      }
    });
  });
});