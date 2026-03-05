
// start of calendar logic
const currentDate = new Date();
currentDate.setMonth(currentDate.getMonth());
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
let selectedDate = null;
const monthNames = ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"];

function renderCalendar(date) {
    clearRoot();
    const calendarBox = createCalendarBox();
    createNavigation(calendarBox, date);
    const tbody = createTable(calendarBox);
    fillDays(tbody, date);
    highlightToday(tbody, date);
    highlightSelected(tbody, date);
    highlightWeekends(tbody);
}
renderCalendar(currentDate);

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

    navBottom.append(previousMonth, paragraph, nextMonth);
    calendarBox.append(navBottom);

    attachNavigationEvents(previousYear, nextYear, previousMonth, nextMonth);
}

function createTable(calendarBox) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
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
    });

    return tbody;
}

function attachNavigationEvents(prevY, nextY, prevM, nextM) {
    prevY.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar(currentDate);
    });

    nextY.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar(currentDate);
    });

    prevM.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextM.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
}

function fillDays(tbody, date) {
    const firstDayIndex = getFirstDayIndex(date);
    const daysInMonth = getDaysInMonth(date);
    const weeks = getWeeksInMonth(firstDayIndex, daysInMonth);

    createEmptyRows(tbody, weeks);
    populateDays(tbody, firstDayIndex, daysInMonth);
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
    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');

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

function populateDays(tbody,firstDayIndex, daysInMonth) {
    for (let i = 1; i <= daysInMonth; i++) {
        fillDay(tbody, firstDayIndex, i);
    }
}

function highlightToday(tbody,date) {
    const today = new Date();
    if (today.getMonth() !== date.getMonth() || today.getFullYear() !== date.getFullYear()) return;

    const firstDayIndex = getFirstDayIndex(date);
    styleDay(tbody, today.getDate(), firstDayIndex, 'today');
}

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

function sevenDays(rows, tableBody) {
    for (let i = 0; i < rows; i++) {
        const newLine = document.createElement('tr');


        tableBody.append(newLine);
      
        for (let i = 0; i <= 6; i++) {
            const emptyCell = document.createElement('td');
            emptyCell.textContent = '';
            emptyCell.style.width = "20px";
            emptyCell.style.height = "20px";
            newLine.append(emptyCell);
        }
    }
}

function fillCalendar(firstDayIndex, daysOfMonthCount) {
    for (let i = firstDayIndex; i < firstDayIndex + daysOfMonthCount; i++) {
        fillDay(firstDayIndex, i - firstDayIndex + 1);
    }
}

function fillDay(tbody, firstDayIndex, dayNumber)  {
    const calendarWeek = tbody.querySelectorAll('tr');
    const rowIndex = weekOfMonth(firstDayIndex, dayNumber);
    const row = calendarWeek[rowIndex];
    const cells = row.querySelectorAll('td');
    

    if (cells[0].textContent === '') {
        const weekdayIndex = (firstDayIndex + dayNumber - 1) % 7;

        const mondayDayNumber = dayNumber - weekdayIndex;

        const mondayDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            mondayDayNumber
        );

        cells[0].textContent = getISOWeekNumber(mondayDate);
    }


    const cellIndex = (firstDayIndex + dayNumber - 1) % 7 + 1;
    cells[cellIndex].textContent = dayNumber;
    if (
        selectedDate && 
        selectedDate.getDate() === dayNumber && 
        selectedDate.getMonth() === currentDate.getMonth() && 
        selectedDate.getFullYear() === currentDate.getFullYear()
    ) {
        cells[cellIndex].classList.add('active-day');
    }
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

    // Thursday in current week decides the year.
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));

    const week1 = new Date(temp.getFullYear(), 0, 4);

    return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000
        - 3 + ((week1.getDay() + 6) % 7)) / 7);
}