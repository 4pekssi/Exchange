document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.schedule-button');
    const today = new Date();
    const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const moviesContainer = document.getElementById('movies-container');

    buttons.forEach(button => {
        const offset = parseInt(button.dataset.offset);
        const date = new Date(today);
        date.setDate(today.getDate() + offset);

        let dayName;
        if (offset === 0) {
            dayName = 'Сегодня';
        } else if (offset === 1) {
            dayName = 'Завтра';
        } else if (offset === -1) {
            dayName = 'Вчера';
        } else if (offset > 1) {
            dayName = `+${offset} дня${offset > 4 ? 'й' : ''}`;
        } else if (offset < -1) {
            dayName = `${Math.abs(offset)} дн${Math.abs(offset) > 1 ? 'я' : 'ь'} назад`;
        }

        const dateNumber = date.getDate();
        const month = date.getMonth() + 1; // Месяцы начинаются с 0

        button.innerHTML = `<span class="day-name">${dayName}</span><span class="date-number">${dateNumber}.${month < 10 ? '0' + month : month}</span>`;
    });

    function loadMovies(date) {
        fetch(`/movies?date=${date}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                moviesContainer.innerHTML = ''; // Очистка предыдущего содержимого
                if (data.error) {
                    moviesContainer.innerHTML = `<p class="error">${data.error}</p>`;
                } else if (data.length === 0) {
                    moviesContainer.innerHTML = `<p>Фильмов на выбранную дату нет.</p>`;
                } else {
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
                moviesContainer.innerHTML = `<p class="error">Ошибка при загрузке фильмов.</p>`;
            });
    }

    // Загрузка фильмов для сегодняшней даты при загрузке страницы
    const initialDate = new Date(today);
    const formattedDate = initialDate.toISOString().split('T')[0];
    loadMovies(formattedDate);

    // Обработчик клика для кнопок
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const offset = parseInt(button.dataset.offset);
            const selectedDate = new Date(today);
            selectedDate.setDate(today.getDate() + offset);
            const year = selectedDate.getFullYear();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            loadMovies(formattedDate);
        });
    });
});
