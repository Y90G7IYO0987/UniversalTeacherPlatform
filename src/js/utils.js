/**
 * Утилиты, используемые на разных страницах.
 */

/**
 * Заполняет выпадающие списки классов (5-11, А-И).
 * Автоматически находит элементы по ID: 'filterGrade' и 'newGrade'.
 */
function generateGrades() {
    const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'И'];
    const selects = [
        document.getElementById('filterGrade'),
        document.getElementById('newGrade')
    ];

    selects.forEach(select => {
        if (!select) return;
        
        // Очищаем список, сохраняя первую опцию, если это фильтр
        if (select.id === 'filterGrade') {
            select.innerHTML = '<option value="">Все классы</option>';
        } else {
            select.innerHTML = '';
        }

        // Заполняем списком
        letters.forEach(letter => {
            for (let grade = 5; grade <= 11; grade++) {
                const className = `${grade}${letter}`;
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                select.appendChild(option);
            }
        });
    });
}

window.generateGrades = generateGrades;