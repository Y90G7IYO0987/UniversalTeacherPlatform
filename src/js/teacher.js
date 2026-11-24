/**
 * Логика панели учителя (teacher.html).
 */

// Проверка авторизации (защита от прямого входа по ссылке)
if (localStorage.getItem('isTeacher') !== 'true') {
    alert('Доступ запрещен. Введите код школы на главной странице.');
    window.location.href = 'index.html';
}

const API_URL = 'http://localhost:5000/api';
const lessonsList = document.getElementById('teacherLessonsList');
const mySubjectsList = document.getElementById('mySubjectsList');
const menuScreen = document.getElementById('menuScreen');
const lessonsScreen = document.getElementById('lessonsScreen');
const lessonsTitle = document.getElementById('lessonsTitle');
const searchInput = document.getElementById('searchInput');

const modal = document.getElementById('createModal');
const newSubjectSelect = document.getElementById('newSubject');

let allLessons = []; 

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    generateGrades();
    loadMySubjects();
    loadAllLessons(); 
    startLiveClock();
});

/**
 * Запускает живые часы в шапке.
 */
function startLiveClock() {
    const clock = document.getElementById('liveClock');
    if (!clock) return;
    
    setInterval(() => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('ru-RU');
    }, 1000);
}

/**
 * Переключает отображение на экран со списком уроков.
 */
function showLessonsScreen() {
    menuScreen.classList.remove('active');
    lessonsScreen.classList.add('active');
    window.scrollTo(0, 0);
}

/**
 * Переключает отображение на главное меню.
 */
function showMenuScreen() {
    lessonsScreen.classList.remove('active');
    menuScreen.classList.add('active');
    lessonsTitle.textContent = "Все уроки";
    searchInput.value = ''; 
    renderLessons(allLessons); 
}

/**
 * Загружает список предметов и заполняет список на главной и в модалке.
 */
async function loadMySubjects() {
    try {
        const schoolId = localStorage.getItem('schoolId') || 1;
        const response = await fetch(`${API_URL}/Subjects?school=${schoolId}`);
        const data = await response.json();

        const subjects = data.subjects || [];
        mySubjectsList.innerHTML = '';
        newSubjectSelect.innerHTML = '';
        
        if (subjects.length === 0) {
            mySubjectsList.innerHTML = '<li class="teacher-item" style="color: var(--text-muted);">Предметов пока нет</li>';
            newSubjectSelect.innerHTML = '<option value="">Нет предметов</option>';
            return;
        }

        subjects.forEach(sub => {
            mySubjectsList.innerHTML += `
                <li class="teacher-item">
                    <a href="javascript:void(0)" onclick="filterBySubject('${sub.name}')">${sub.name}</a>
                </li>
            `;
            newSubjectSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
        });
    } catch (e) {
        console.error("Ошибка загрузки предметов:", e);
    }
}

/**
 * Загружает все уроки из базы данных.
 */
async function loadAllLessons() {
    try {
        const schoolId = localStorage.getItem('schoolId') || 1;
        const response = await fetch(`${API_URL}/Lessons?school=${schoolId}`);
        const data = await response.json();
        
        allLessons = data.lessons; 
        renderLessons(allLessons);
        updateLessonCounter(allLessons.length);
        
        const updateTime = document.getElementById('lastUpdate');
        if (updateTime) {
            updateTime.textContent = `Последнее обновление: ${new Date().toLocaleTimeString('ru-RU')}`;
        }
    } catch (e) {
        console.error("Ошибка загрузки уроков:", e);
    }
}

/**
 * Отрисовывает карточки уроков на экране.
 * @param {Array} lessonsToRender - Массив уроков для отображения.
 */
function renderLessons(lessonsToRender) {
    lessonsList.innerHTML = '';
    
    if (lessonsToRender.length === 0) {
        lessonsList.innerHTML = `
            <li class="last-lesson" style="flex-direction: column; text-align: center; padding: 40px; border-style: dashed;">
                <span style="color: var(--text-muted);">Ничего не найдено.</span>
                <span style="color: var(--text-muted); font-size: 12px;">Попробуйте изменить запрос.</span>
            </li>
        `;
        return;
    }

    lessonsToRender.forEach(lesson => {
        const key = lesson.deleteKey || 'empty';
        lessonsList.innerHTML += `
            <li class="last-lesson">
                ${lesson.date} <a href="#">${lesson.subject}:</a> ${lesson.title} (${lesson.grade})
                <button onclick="deleteLesson(${lesson.id}, '${key}')" style="color:var(--danger); cursor:pointer; background:none; border:none;">✕</button>
            </li>
        `;
    });
}

/**
 * Фильтрует список уроков по выбранному предмету.
 * @param {string} subjectName - Название предмета.
 */
function filterBySubject(subjectName) {
    showLessonsScreen();
    lessonsTitle.textContent = `Уроки по предмету: ${subjectName}`;
    const filtered = allLessons.filter(l => l.subject === subjectName);
    renderLessons(filtered);
}

document.getElementById('allLessonsBtn').addEventListener('click', () => {
    showLessonsScreen();
    lessonsTitle.textContent = "Все уроки";
    renderLessons(allLessons);
});

/**
 * Умный поиск по названию, предмету или классу.
 */
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        if (lessonsScreen.classList.contains('active')) {
            renderLessons(allLessons);
        }
        return;
    }

    if (!lessonsScreen.classList.contains('active')) {
        showLessonsScreen();
        lessonsTitle.textContent = `Результаты поиска: "${query}"`;
    }

    const filtered = allLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(query) || 
        lesson.subject.toLowerCase().includes(query) ||
        lesson.grade.toLowerCase().includes(query)
    );

    renderLessons(filtered);
});

/**
 * Обновляет счетчик записей в шапке.
 * @param {number} count - Количество уроков.
 */
function updateLessonCounter(count) {
    document.getElementById('lessonCounter').textContent = `${count} записей`;
}

// Открытие модального окна для создания урока
document.getElementById('CreateTeacherItems').addEventListener('click', () => {
    document.getElementById('newTitle').value = '';
    document.getElementById('newGrade').value = '';
    document.getElementById('newLink').value = '';
    document.getElementById('newDate').value = '';
    modal.classList.add('active');
});

// Закрытие модального окна
document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.classList.remove('active'); 
});

/**
 * Сохранение нового урока.
 */
document.getElementById('saveLessonBtn').addEventListener('click', async () => {
    const title = document.getElementById('newTitle').value.trim();
    const grade = document.getElementById('newGrade').value;
    const link = document.getElementById('newLink').value.trim();
    const subjectId = document.getElementById('newSubject').value;
    const dateInput = document.getElementById('newDate').value;

    if (!title || !grade || !link) {
        alert('Заполните все поля!');
        return;
    }

    let formattedDate = "";
    if (dateInput) {
        const [year, month, day] = dateInput.split('-');
        formattedDate = `${day}.${month}.${year}`;
    }

    try {
        const schoolId = localStorage.getItem('schoolId') || 1;
        const response = await fetch(`${API_URL}/Lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: title, 
                grade: grade, 
                link: link, 
                subjectId: parseInt(subjectId), 
                schoolId: parseInt(schoolId),
                date: formattedDate
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Урок создан! Ключ для удаления: ' + data.deleteKey);
            modal.classList.remove('active');
            loadAllLessons();
        } else {
            alert('Ошибка создания: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (e) {
        alert('Ошибка сервера при создании');
    }
});

/**
 * Удаление урока по ID и ключу.
 * @param {number} id - ID урока.
 * @param {string} key - Ключ удаления.
 */
async function deleteLesson(id, key) {
    if (!key || key === 'empty') {
        alert('У этого урока нет ключа удаления!');
        return;
    }

    const userKey = prompt('Введите ключ удаления:');
    if (!userKey) return;
    if (userKey !== key) { 
        alert('Неверный ключ!'); 
        return; 
    }

    const response = await fetch(`${API_URL}/Lessons/${id}?key=${userKey}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Урок удален!');
        loadAllLessons();
    } else {
        alert('Ошибка сервера!');
    }
}

document.getElementById('backToMenuBtn').addEventListener('click', showMenuScreen);
document.getElementById('LeaveButton').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});