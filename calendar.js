
// start of calendar logic
const currentDate = new Date();
currentDate.setMonth(currentDate.getMonth());
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
let selectedDate = null;
const monthNames = ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"];

function renderCalendar(date, animation) {
    clearRoot();
    const calendarBox = createCalendarBox();
    createNavigation(calendarBox, date);
    const tbody = createTable(calendarBox, animation);
    fillDays(tbody, date);
    highlightToday(tbody, date);
    highlightSelected(tbody, date);
    highlightWeekends(tbody);
}
renderCalendar(currentDate, 'grow-from-center');

function clearRoot() {
    document.querySelector('#calendar').replaceChildren();
}

function createCalendarBox() {
    const Calendar = document.querySelector('#calendar');
    const box = document.createElement('div');
    box.classList.add('calendar-container');
    Calendar.append(box);
    return box;
}

function createNavigation(calendarBox, date) {
    const navTop = document.createElement('nav');
    navTop.classList.add('nav-top');

    const previousYear = document.createElement('button');
    previousYear.textContent = '<<';

    const elementYear = document.createElement('a');
    elementYear.textContent = `${date.getFullYear()}`;

    const nextYear = document.createElement('button');
    nextYear.textContent = '>>';
    navTop.append(previousYear, elementYear, nextYear);
    calendarBox.append(navTop);

    const navBottom = document.createElement('nav');
    navBottom.classList.add('nav-bottom');

    const previousMonth = document.createElement('button');
    previousMonth.textContent = '<';

    const paragraph = document.createElement('a');
    paragraph.textContent = `${monthNames[date.getMonth()]}`;

    const nextMonth = document.createElement('button');
    nextMonth.textContent = '>';

    const goToTodayBtn = document.createElement('button');
    goToTodayBtn.textContent = 'Today';

    navBottom.append(previousMonth, paragraph, nextMonth, goToTodayBtn);
    calendarBox.append(navBottom);

    attachNavigationEvents(previousYear, nextYear, previousMonth, nextMonth, goToTodayBtn);
}

function createTable(calendarBox, animation) {
    const table = document.createElement('table');
    if (animation) table.classList.add(animation);
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    emptyTh.textContent = 'Week';
    emptyTh.classList.add('week-number');
    headerRow.append(emptyTh);
    ['P','A','T','K','Pn','Š','S'].forEach(d => {
        const th = document.createElement('th');
        th.textContent = d;
        headerRow.append(th);
    });

    thead.append(headerRow);
    table.append(thead, tbody);
    calendarBox.append(table);

    tbody.addEventListener('click', (event) => {
        const cell = event.target;
        if (cell.tagName !== 'TD') return;

        const dayNumber = Number(cell.textContent);
        if (!dayNumber) return;

        const activeDay = document.querySelector('.active-day');
        if (activeDay) activeDay.classList.remove('active-day');

        cell.classList.add('active-day');

        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);

        onDaySelect(selectedDate);
    });

    return tbody;
}

function attachNavigationEvents(prevY, nextY, prevM, nextM, goToTodayBtn) {
    prevY.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar(currentDate, 'month-slide-right');
    });

    nextY.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar(currentDate, 'month-slide-left');
    });

    prevM.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate, 'month-slide-right');
    });

    nextM.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate, 'month-slide-left');
    });

    goToTodayBtn.addEventListener('click', () => {
        goToToday();
    });
}

function fillDays(tbody, date) {
    const firstDayIndex = getFirstDayIndex(date);
    const prevMonth = new Date();
    prevMonth.setMonth(currentDate.getMonth() - 1);
    const previousMonthDays = getDaysInMonth(prevMonth);
    const currentDaysInMonth = getDaysInMonth(date);
    const weeks = getWeeksInMonth(firstDayIndex, currentDaysInMonth);

    createEmptyRows(tbody, weeks);
    pupulatePrevMonthDays(tbody, firstDayIndex, previousMonthDays);
    populateCurrentMonthDays(tbody, firstDayIndex, currentDaysInMonth);
    pupulateNextMonthDays(tbody, firstDayIndex, currentDaysInMonth);
}

function getFirstDayIndex(date) {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getWeeksInMonth(firstDayIndex, daysInMonth) {
    return Math.floor((firstDayIndex + daysInMonth - 1) / 7 + 1);
}

function createEmptyRows(tbody, rows) {
    for (let i = 0; i < 6; i++) {
        const tr = document.createElement('tr');
        tr.classList.add('calendar-row');
        const weekNumberCell = document.createElement('td');
        weekNumberCell.classList.add('week-number');
        weekNumberCell.textContent = ''; 
        tr.append(weekNumberCell);

        for (let j = 0; j < 7; j++) {
            const td = document.createElement('td');
            tr.append(td);
        }
        tbody.append(tr);
    }
}

function pupulatePrevMonthDays(tbody, firstDayIndex, previousMonthDays) {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevYear = prevMonth.getFullYear();
    const prevMonthIndex = prevMonth.getMonth();

    for (let i = 1 - firstDayIndex; i <= 0; i++) {
        const realDay = previousMonthDays + i;
        const realDate = new Date(prevYear, prevMonthIndex, realDay);
        fillDay(tbody, firstDayIndex, i, realDate);
    }
}

function populateCurrentMonthDays(tbody, firstDayIndex, daysInMonth) {
    for (let i = 1; i <= daysInMonth; i++) {
        const realDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        fillDay(tbody, firstDayIndex, i, realDate);
    }
}

function pupulateNextMonthDays(tbody, firstDayIndex, daysInMonth) {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextYear = nextMonth.getFullYear();
    const nextMonthIndex = nextMonth.getMonth();

    for (let i = daysInMonth + 1; i <= 42 - firstDayIndex; i++) {
        const realDay = i - daysInMonth;
        const realDate = new Date(nextYear, nextMonthIndex, realDay);
        fillDay(tbody, firstDayIndex, i, realDate);
    }
}

function fillDay(tbody, firstDayIndex, clindex, realDate) {
    const calendarWeek = tbody.querySelectorAll('tr');
    const rowIndex = weekOfMonth(firstDayIndex, clindex);
    const row = calendarWeek[rowIndex];
    const cells = row.querySelectorAll('td');


    if (cells[0].textContent === '') {
        const weekDayIndex = realDate.getDay() === 0 ? 6 : realDate.getDay() - 1;
        const mondayDate = new Date(realDate);
        mondayDate.setDate(realDate.getDate() - weekDayIndex);
        // cells[0].classList.add('week-column');
        cells[0].textContent = getISOWeekNumber(mondayDate);
    }


    const cellIndex = (firstDayIndex + clindex - 1) % 7 + 1;
    cells[cellIndex].textContent = realDate.getDate();
    if(realDate.getMonth() !== currentDate.getMonth()) {
        cells[cellIndex].classList.add('not-current-month');
    }
    if (
        selectedDate && 
        selectedDate.getDate() === realDate.getDate() && 
        selectedDate.getMonth() === realDate.getMonth() && 
        selectedDate.getFullYear() === realDate.getFullYear()
    ) {
        cells[cellIndex].classList.add('active-day');
    }
}

function highlightToday(tbody,date) {
    const today = new Date();
    if (today.getMonth() !== date.getMonth() || today.getFullYear() !== date.getFullYear()) return;

    const firstDayIndex = getFirstDayIndex(date);
    styleDay(tbody, today.getDate(), firstDayIndex, 'today');
}

//there is bug with this function, when you select a day and then switch month, sometimes different day will be highlighted in the new month if it exists  
function highlightSelected(tbody, date) {
    if (!selectedDate) return;
    if (selectedDate.getMonth() !== date.getMonth() || selectedDate.getFullYear() !== date.getFullYear()) return;

    const firstDayIndex = getFirstDayIndex(date);
    styleDay(tbody, selectedDate.getDate(), firstDayIndex, 'active-day');
}

function highlightWeekends(tbody) {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        row.children[6].classList.add('weekend');
        row.children[7].classList.add('weekend');
    });
}



function weekOfMonth(firstDayIndex, dayNumber) {
    return Math.floor((firstDayIndex + dayNumber - 1) / 7);
}


function styleDay(tbody, dayNumber, firstDayOfMonthIndex, style) {
    const rows = tbody.querySelectorAll('tr');
    const rowIndex = weekOfMonth(firstDayOfMonthIndex, dayNumber);
    const row = rows[rowIndex];
    const cells = row.querySelectorAll('td');
    const cellIndex = (firstDayOfMonthIndex + dayNumber - 1) % 7;
    cells[cellIndex+1].classList.add(style);
}

function getISOWeekNumber(date) {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);

    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));

    const week1 = new Date(temp.getFullYear(), 0, 4);

    return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000
        - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function goToToday() {
    todayDate = new Date();          
    todayDate.setMonth(todayDate.getMonth());
    currentDate.setFullYear(todayDate.getFullYear());
    currentDate.setMonth(todayDate.getMonth());
    renderCalendar(todayDate, 'grow-from-center');                 
}