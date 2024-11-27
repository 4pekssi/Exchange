// seed.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Определение __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Подключение к базе данных
const db = new sqlite3.Database(path.join(__dirname, 'kinotheater.db'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite.');
    }
});

// Определение массива фильмов для добавления
const movies = [
    {
        title: 'Драйв',
        rating: 7.3,
        description: 'Молчаливый водитель спасает девушку от гангстеров. Неонуар с Райаном Гослингом и пульсирующим саундтреком',
        release_date: '2024-11-15',
        category: 'криминал, драма, триллер',
        pushkin_card_payment: 1,
        age_rating: "18+",
        image: '600x400.jpg'
    },
    // Добавьте другие фильмы по необходимости
];

// Создание таблицы movies, если её нет
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
        // Заполнение таблицы фильмами
        seedMovies();
    }
});

// Функция для заполнения таблицы фильмами
function seedMovies() {
    const stmt = db.prepare(`INSERT INTO movies 
        (title, rating, description, release_date, category, pushkin_card_payment, age_rating, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

    movies.forEach(movie => {
        stmt.run(
            movie.title,
            movie.rating,
            movie.description,
            movie.release_date,
            movie.category,
            movie.pushkin_card_payment,
            movie.age_rating,
            movie.image
        );
    });

    stmt.finalize((err) => {
        if (err) {
            console.error('Ошибка при заполнении таблицы movies:', err.message);
        } else {
            console.log('Данные успешно добавлены в таблицу movies.');
        }
        db.close();
    });
}

db.run('DROP TABLE IF EXISTS movies', (err) => {
    if (err) {
        console.error('Ошибка при удалении таблицы movies:', err.message);
    } else {
        console.log('Таблица movies удалена.');
        // Создание таблицы и заполнение данными
        createMoviesTable();
    }
}); 