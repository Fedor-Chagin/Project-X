const teachers = [
    { id: 1, name: "Иванов Иван Иванович", pos: "Профессор", faculty: "ИТ", duration: 60, busy: ["10:00"] },
    { id: 2, name: "Петрова Анна Сергеевна", pos: "Доцент", faculty: "ФизМат", duration: 30, busy: ["09:30", "11:00"] },
    { id: 3, name: "Сидоров Олег Петрович", pos: "Декан", faculty: "ИТ", duration: 45, busy: [] }
];

// 1. Отрисовка преподавателей на странице teachers.html
const grid = document.getElementById('teachers-grid');
if (grid) {
    teachers.forEach(t => {
        grid.innerHTML += `
            <div class="teacher-card">
                <img src="" alt="Photo">
                <h3>${t.name}</h3>
                <p><strong>${t.pos}</strong></p>
                <p>${t.faculty}</p>
            </div>
        `;
    });
}

// 2. Логика записи на главной
const tSelect = document.getElementById('teacher-select');
const dInput = document.getElementById('date-input');
const tMenu = document.getElementById('time-menu');
const slotsCont = document.getElementById('slots-container');

if (tSelect) {
    // Наполняем select
    teachers.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        tSelect.appendChild(opt);
    });

    // При изменении даты или учителя
    [tSelect, dInput].forEach(el => el.addEventListener('change', () => {
        if (tSelect.value && dInput.value) {
            renderSlots(tSelect.value);
        }
    }));
}

function renderSlots(teacherId) {
    const teacher = teachers.find(t => t.id == teacherId);
    slotsCont.innerHTML = '';
    tMenu.classList.remove('hidden');

    let startTime = 9 * 60; // 09:00 в минутах
    const endTime = 14 * 60;  // 14:00

    while (startTime < endTime) {
        const h = Math.floor(startTime / 60).toString().padStart(2, '0');
        const m = (startTime % 60).toString().padStart(2, '0');
        const timeStr = `${h}:${m}`;

        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.textContent = timeStr;

        if (teacher.busy.includes(timeStr)) {
            slot.classList.add('busy');
        } else {
            slot.onclick = () => alert(`Вы записаны к ${teacher.name} на ${timeStr}`);
        }

        slotsCont.appendChild(slot);
        startTime += teacher.duration; // Добавляем шаг (30, 45 или 60 мин)
    }
}