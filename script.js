// Данные преподавателей
const teachers = [
    { id: 1, name: "Иванов Иван Иванович", pos: "Профессор", faculty: "ИТ", duration: 60, busy: ["10:00"] },
    { id: 2, name: "Петрова Анна Сергеевна", pos: "Доцент", faculty: "ФизМат", duration: 30, busy: ["09:30", "11:00"] },
    { id: 3, name: "Сидоров Олег Петрович", pos: "Декан", faculty: "ИТ", duration: 45, busy: [] }
];

// ========== РАБОТА С LOCALSTORAGE ==========
// Сохранить запись
function saveBooking(teacherId, teacherName, date, time) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push({ 
        id: Date.now(),
        teacherId: teacherId,
        teacherName: teacherName, 
        date: date, 
        time: time,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    console.log("✅ Запись сохранена:", { teacherName, date, time });
}

// Получить все записи
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Удалить запись
function deleteBooking(bookingId) {
    let bookings = getBookings();
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    console.log("❌ Запись удалена, ID:", bookingId);
    
    // Если мы на странице "Мои записи" — обновляем список
    if (window.location.pathname.includes('my-bookings.html')) {
        displayBookings();
    }
}

// Очистить все записи (для отладки)
function clearAllBookings() {
    localStorage.removeItem('bookings');
    console.log("🗑 Все записи удалены");
    if (window.location.pathname.includes('my-bookings.html')) {
        displayBookings();
    }
}

// ========== СТРАНИЦА "МОИ ЗАПИСИ" ==========
function displayBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    
    const bookings = getBookings();
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📭 У вас пока нет записей</p>
                <a href="index.html" class="button">Записаться на консультацию</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>👨‍🏫 ${booking.teacherName}</h3>
            <p>📅 Дата: ${booking.date}</p>
            <p>⏰ Время: ${booking.time}</p>
            <p>🕐 Записано: ${new Date(booking.createdAt).toLocaleString()}</p>
            <button onclick="deleteBooking(${booking.id})">❌ Отменить запись</button>
        </div>
    `).join('');
    
    // Добавляем кнопку очистки всех записей
    container.innerHTML += `
        <button onclick="clearAllBookings()" class="clear-all">🗑 Очистить все записи</button>
    `;
}

// ========== СТРАНИЦА ПРЕПОДАВАТЕЛЕЙ ==========
const grid = document.getElementById('teachers-grid');
if (grid) {
    teachers.forEach(t => {
        const bookingCount = getBookings().filter(b => b.teacherId == t.id).length;
        grid.innerHTML += `
            <div class="teacher-card">
                <div class="teacher-avatar"></div>
                <h3>${t.name}</h3>
                <p><strong>${t.pos}</strong></p>
                <p>Факультет: ${t.faculty}</p>
                <p>⏱ Длительность: ${t.duration} мин</p>
                <p class="booking-count">📋 Записей: ${bookingCount}</p>
            </div>
        `;
    });
}

// ========== СТРАНИЦА ЗАПИСИ ==========
const tSelect = document.getElementById('teacher-select');
const dInput = document.getElementById('date-input');
const tMenu = document.getElementById('time-menu');
const slotsCont = document.getElementById('slots-container');

if (tSelect) {
    // Заполняем выпадающий список
    teachers.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.name} (${t.pos})`;
        tSelect.appendChild(opt);
    });

    if (dInput) {
        dInput.addEventListener('change', updateSlots);
        // Устанавливаем минимальную дату = сегодня
        const today = new Date().toISOString().split('T')[0];
        dInput.min = today;
    }
    tSelect.addEventListener('change', updateSlots);
}

function updateSlots() {
    if (tSelect.value && dInput.value) {
        renderSlots(tSelect.value);
    }
}

function renderSlots(teacherId) {
    const teacher = teachers.find(t => t.id == teacherId);
    if (!teacher) return;
    
    slotsCont.innerHTML = '';
    tMenu.classList.remove('hidden');

    let startTime = 9 * 60; // 09:00
    const endTime = 17 * 60;  // 17:00

    while (startTime < endTime) {
        const h = Math.floor(startTime / 60).toString().padStart(2, '0');
        const m = (startTime % 60).toString().padStart(2, '0');
        const timeStr = `${h}:${m}`;

        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.textContent = timeStr;

        // Проверяем, занят ли слот
        const isBusy = teacher.busy.includes(timeStr);
        const isAlreadyBooked = getBookings().some(b => 
            b.teacherId == teacherId && b.date === dInput.value && b.time === timeStr
        );

        if (isBusy || isAlreadyBooked) {
            slot.classList.add('busy');
            slot.title = isBusy ? "Это время занято преподавателем" : "Вы уже записаны на это время";
        } else {
            slot.onclick = () => {
                saveBooking(teacher.id, teacher.name, dInput.value, timeStr);
                alert(`✅ Вы записаны к ${teacher.name} на ${dInput.value} в ${timeStr}`);
                renderSlots(teacherId); // Обновляем список слотов
            };
        }

        slotsCont.appendChild(slot);
        startTime += teacher.duration;
    }
}

// Если мы на странице моих записей — показываем их
if (window.location.pathname.includes('my-bookings.html')) {
    displayBookings();
}

// Выводим в консоль информацию о хранилище
console.log("📦 LocalStorage готов. Записей в базе:", getBookings().length);
