/**
 * Логика панели ученика (student.html).
 */

const API_URL = 'http://localhost:5000/api';
const lessonsList = document.getElementById('studentLessonsList');
const filterSubject = document.getElementById('filterSubject');
const filterGrade = document.getElementById('filterGrade');

// Инициализация страницы
document.addEventListener('DOMContentLoaded', async () => {
    generateGrades();
    startLiveClock();
    
    try {
        // Загрузка предметов для фильтра
        const resSub = await fetch(`${API_URL}/Subjects?school=1`);
        const dataSub = await resSub.json();
        
        dataSub.subjects.forEach(sub => {
            filterSubject.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
        });

        loadLessons();
    } catch (e) {
        console.error("Ошибка загрузки предметов", e);
    }
});

filterSubject.addEventListener('change', loadLessons);
filterGrade.addEventListener('change', loadLessons);

/**
 * Загружает уроки с учетом выбранных фильтров.
 */
async function loadLessons() {
    const subject = filterSubject.value;
    const grade = filterGrade.value;
    
    let url = `${API_URL}/Lessons?school=1`;
    if (subject) url += `&subject=${subject}`;
    if (grade) url += `&grade=${grade}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        lessonsList.innerHTML = ''; 
        updateAnalytics(data.lessons);

        if (data.lessons.length === 0) {
            lessonsList.innerHTML = '<li class="last-lesson">Уроков по этому фильтру нет</li>';
            return;
        }

        data.lessons.forEach(lesson => {
            lessonsList.innerHTML += `
                <li class="last-lesson">
                    ${lesson.date} <a href="#">${lesson.subject}:</a> ${lesson.title} (${lesson.grade})
                    <a href="${lesson.link}" target="_blank" class="btn-primary" style="padding: 5px 10px; font-size: 12px; margin-left: 10px;">ОТКРЫТЬ</a>
                </li>
            `;
        });
    } catch (e) {
        console.error("Ошибка загрузки уроков", e);
    }
}

/**
 * Считает и выводит самый популярный предмет.
 * @param {Array} lessons - Массив уроков.
 */
function updateAnalytics(lessons) {
    const topEl = document.getElementById('topSubject');
    if (!topEl || lessons.length === 0) return;

    const subjectCounts = {};
    lessons.forEach(l => {
        subjectCounts[l.subject] = (subjectCounts[l.subject] || 0) + 1;
    });

    let topSubject = "Нет данных";
    let maxCount = 0;
    for (const [subject, count] of Object.entries(subjectCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topSubject = `${subject} (${count} уроков)`;
        }
    }
    topEl.textContent = topSubject;
}

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

document.getElementById('LeaveButton').addEventListener('click', () => {
    window.location.href = 'index.html';
});