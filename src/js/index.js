/**
 * Логика страницы входа (index.html).
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Обработка входа учителя по коду школы.
 */
document.getElementById('loginBtn').addEventListener('click', async () => {
    const code = document.getElementById('schoolCodeInput').value.trim();
    
    if (!code) {
        alert('Введите код школы');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/Auth/verify-teacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('schoolId', data.schoolId);
            localStorage.setItem('schoolName', data.schoolName);
            localStorage.setItem('isTeacher', 'true');
            
            window.location.href = 'teacher.html';
        } else {
            alert(data.error || 'Неверный код школы');
        }
    } catch (e) {
        alert('Ошибка соединения. Проверьте, запущен ли сервер.');
        console.error(e);
    }
});

/**
 * Переход в режим ученика (очищает флаг учителя).
 */
document.getElementById('studentLoginBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('isTeacher');
    window.location.href = 'student.html';
});