import DomUtils from "./DomUtils.js";

export default class CalendarRenderer {
    constructor(dp) {
        this.dp = dp;
    }

    clearRoot() {
        const calendar = this.dp.container.querySelector('#calendar');
        if (calendar) calendar.replaceChildren();
    }

    createCalendarRoot() {
        const calendar = this.dp.container.querySelector('#calendar');
        this.dp.calendarRoot = document.createElement('div');
        this.dp.calendarRoot.classList.add('calendar-container');
        calendar.append(this.dp.calendarRoot);
    }

    createCalendarTable(animation) {
        const table = document.createElement("table");
        if (animation) table.classList.add(animation);

        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const emptyTh = document.createElement("th");

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
        this.dp.calendarRoot.append(table);

        return tbody;
    }

    createWeekRow(year, month, firstDayIndex, row) {
        const tr = document.createElement("tr");

        const weekCell = document.createElement("td");
        weekCell.classList.add("week-number");

        const firstDayOfWeek = new Date(year, month, 1 - firstDayIndex + row * 7);
        weekCell.textContent = this.dp.utils.getISOWeekNumber(firstDayOfWeek);

        tr.append(weekCell);
        return tr;
    }

    createDayCell(year, month, dayNumber, daysInMonth, prevMonthDays) {
        const td = document.createElement("td");
        let cellDate;

        if (dayNumber <= 0) {
            const realDay = prevMonthDays + dayNumber;
            td.textContent = realDay;
            td.classList.add("prev-month");
            cellDate = new Date(year, month - 1, realDay);
        }
        else if (dayNumber > daysInMonth) {
            const realDay = dayNumber - daysInMonth;
            td.textContent = realDay;
            td.classList.add("next-month");
            cellDate = new Date(year, month + 1, realDay);
        }
        else {
            td.textContent = dayNumber;
            td.classList.add("current-month");
            cellDate = new Date(year, month, dayNumber);
        }

        const today = new Date();
        if (
            cellDate.getFullYear() === today.getFullYear() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getDate() === today.getDate()
        ) {
            td.classList.add("today");
        }

        if (
            this.dp.selectedDate &&
            cellDate.getFullYear() === this.dp.selectedDate.getFullYear() &&
            cellDate.getMonth() === this.dp.selectedDate.getMonth() &&
            cellDate.getDate() === this.dp.selectedDate.getDate()
        ) {
            td.classList.add("selected");
        }

        td.addEventListener("click", () => {
            this.dp.selectedDate = cellDate;
            this.dp.currentDate = new Date(cellDate);
            this.dp.input.value = this.dp.utils.format(cellDate);
            this.dp.renderCalendar("grow-from-center");
            this.dp.positioning.positionPicker();
        });

        return td;
    }

    fillCalendarDays(tbody) {
        const year = this.dp.currentDate.getFullYear();
        const month = this.dp.currentDate.getMonth();

        const { daysInMonth, firstDayIndex, prevMonthDays } =
            this.dp.utils.getMonthMetrics(year, month);

        for (let row = 0; row < 6; row++) {
            const tr = this.createWeekRow(year, month, firstDayIndex, row);

            for (let col = 0; col < 7; col++) {
                const cellIndex = row * 7 + col;
                const dayNumber = cellIndex - firstDayIndex + 2;

                const td = this.createDayCell(
                    year,
                    month,
                    dayNumber,
                    daysInMonth,
                    prevMonthDays
                );

                if (col === 5 || col === 6) {
                    td.classList.add("weekend");
                }

                tr.append(td);
            }

            tbody.append(tr);
        }
    }
}