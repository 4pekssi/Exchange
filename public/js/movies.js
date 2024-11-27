    // public/js/movies.js

    document.addEventListener('DOMContentLoaded', function() {
        const moviesContainer = document.getElementById('movies-container');

        fetch('/all-movies')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сетевая ошибка');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    moviesContainer.innerHTML = '<p>Фильмы не найдены.</p>';
                } else {
                    moviesContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых фильмов
                    data.forEach(movie => {
                        const movieElement = document.createElement('div');
                        movieElement.classList.add('movie');

                        movieElement.innerHTML = `
                            <img src="/img/${movie.image}" alt="${movie.title}">
                            <div class="movie-content">
                                <h2>${movie.title}</h2>
                                <p>${movie.description}</p>
                                <p>Рейтинг: ${movie.rating}</p>
                                <p>Дата выхода: ${movie.release_date}</p>
                                <p>Категория: ${movie.category}</p>
                                <p>Возрастное ограничение: ${movie.age_rating}</p>
                            </div>
                        `;

                        moviesContainer.appendChild(movieElement);
                    });
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке фильмов:', error);
                moviesContainer.innerHTML = '<p>Ошибка при загрузке фильмов.</p>';
            });
    });