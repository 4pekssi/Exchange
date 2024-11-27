import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// this is a top-level await
(async () => {
    try {
        // open the database
        const db = await open({
            filename: './db.db', // Убедитесь, что путь к файлу базы данных правильный
            driver: sqlite3.Database
        });

        console.log('Database connection established.');

        // Perform a simple query to check the connection
        const result = await db.get('SELECT name FROM sqlite_master WHERE type="table"');

        if (result) {
            console.log('Database connection is successful.');
            console.log('Table name:', result.name);
        } else {
            console.log('No tables found in the database.');
        }

        // Close the database connection
        await db.close();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
})();
