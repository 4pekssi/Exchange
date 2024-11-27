const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kinotheater.db');

db.serialize(() => {
    // Создание таблицы пользователей
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Создание таблицы фильмов
    db.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        rating REAL,
        description TEXT,
        release_date TEXT,
        category TEXT,
        pushkin_card_payment BOOLEAN,
        age_rating INTEGER,
        image TEXT
    )`);

    // Создание таблицы сеансов
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hall_id INTEGER,
        movie_id INTEGER,
        session_date TEXT,
        session_time TEXT,
        cost REAL,
        format TEXT,
        FOREIGN KEY(movie_id) REFERENCES movies(id)
    )`);

    // Создание таблицы бронирования
    db.run(`CREATE TABLE IF NOT EXISTS booking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        row INTEGER,
        seat INTEGER,
        seat_type TEXT,
        session_id INTEGER,
        status TEXT,
        user_id INTEGER,
        FOREIGN KEY(session_id) REFERENCES sessions(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Создание таблицы залов
    db.run(`CREATE TABLE IF NOT EXISTS hall (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        capacity INTEGER
    )`);

    // Создание таблицы меню
    db.run(`CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cost REAL,
        type TEXT
    )`);

    // Создание таблицы заказа меню
    db.run(`CREATE TABLE IF NOT EXISTS menu_order (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        menu_id INTEGER,
        quantity INTEGER
    )`);

    // Создание таблицы заказов
    db.run(`CREATE TABLE IF NOT EXISTS order_ (
        id INTEGER PRIMARY KEY AUTOINCREMENT
    )`);

    // Вставка данных в таблицу hall
    const stmt_hall = db.prepare("INSERT INTO hall (capacity) VALUES (?)");
    stmt_hall.run(100);
    stmt_hall.run(150);
    stmt_hall.run(200);
    stmt_hall.finalize();

    // Вставка данных в таблицу movies
    const stmt_movie = db.prepare(`INSERT INTO movies
        (title, rating, description, release_date, category, pushkin_card_payment, age_rating, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt_movie.run("Интерстеллар", 8.6, "Фантастический фильм о путешествии через червоточину.", "2014-11-07", "Фантастика", 1, 13, "interstellar.jpg");
    stmt_movie.run("Начало", 8.8, "Фильм о проникновении в сны людей для извлечения информации.", "2010-07-16", "Боевик", 1, 13, "inception.jpg");
    stmt_movie.run("Темный рыцарь", 9.0, "Бэтмен против Джокера в борьбе за Готэм.", "2008-07-18", "Боевик", 1, 13, "dark_knight.jpg");
    stmt_movie.finalize();

    // Вставка данных в таблицу sessions
    const stmt_session = db.prepare(`INSERT INTO sessions
        (hall_id, movie_id, session_date, session_time, cost, format)
        VALUES (?, ?, ?, ?, ?, ?)`);
    stmt_session.run(1, 1, "2024-11-05", "18:00:00", 500.00, "2D");
    stmt_session.run(1, 1, "2024-11-05", "21:00:00", 600.00, "3D");
    stmt_session.run(2, 2, "2024-11-06", "17:00:00", 450.00, "2D");
    stmt_session.run(2, 3, "2024-11-06", "20:00:00", 550.00, "IMAX");
    stmt_session.run(3, 2, "2024-11-07", "19:00:00", 500.00, "2D");
    stmt_session.run(3, 3, "2024-11-07", "22:00:00", 600.00, "3D");
    stmt_session.finalize();
});

db.close();
