import DateUtils from "./DateUtils.js";

export default class CalendarRenderer {
    constructor(dp) {
        this.dp = dp;
    }

    getCalendarHost() {
        return this.dp.container.querySelector("#calendar, .calendar-root");
    }

    clearRoot() {
        const calendar = this.getCalendarHost();
        if (calendar) calendar.replaceChildren();
    }

    createCalendarRoot() {
        const calendar = this.getCalendarHost();
        this.dp.calendarRoot = document.createElement("div");
        this.dp.calendarRoot.classList.add("calendar-container");
        calendar.append(this.dp.calendarRoot);
    }

    createCalendarTable(animation) {
        const table = document.createElement("table");
        table.setAttribute("role", "grid");
        this.calendarElement = table;
        if (animation) table.classList.add(animation);

        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        headerRow.setAttribute("role", "row");
        const emptyTh = document.createElement("th");

        const weekLabel = {
            "lt-LT": "Sav.",
            "en-US": "Wk",
            "fr-FR": "Sem.",
            "de-DE": "KW",
            "es-ES": "Sem.",
            "it-IT": "Sett.",
            "pl-PL": "Tydz.",
            "sv-SE": "v.",
            "da-DK": "uge",
            "fi-FI": "vk"
        }[this.dp.options.locale] || "Wk";

        emptyTh.textContent = weekLabel;

        emptyTh.classList.add("week-number");
        headerRow.append(emptyTh);

        const baseDays = [...Array(7).keys()].map(i =>
            new Intl.DateTimeFormat(this.dp.options.locale, { weekday: "short" })
                .format(new Date(1970, 0, 4 + i)) 
        );

        const rotatedDays = [
            ...baseDays.slice(this.dp.options.firstDayOfWeek),
            ...baseDays.slice(0, this.dp.options.firstDayOfWeek)
        ];

        rotatedDays.forEach(d => {
            const th = document.createElement("th");
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
        tr.setAttribute("role", "row");
        
        const weekCell = document.createElement("td");
        weekCell.classList.add("week-number");
        weekCell.setAttribute("role", "rowheader");

        const rowStartDate = new Date(year, month, 1 - firstDayIndex + row * 7);
        weekCell.textContent = DateUtils.getISOWeekNumber(rowStartDate);

        tr.append(weekCell);
        return tr;
    }

    createDayCell(year, month, dayNumber, daysInMonth, prevMonthDays) {
        const td = document.createElement("td");
        td.setAttribute("role", "gridcell");
        td.setAttribute("tabindex", "-1");
        let cellDate;

        td.addEventListener("keydown", (e) => {
            this.dp.handleDayKeydown(e, cellDate);
        });

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

        const iso = DateUtils.toLocalISO(cellDate);
        const todayIso = DateUtils.toLocalISO(new Date());

        td.dataset.iso = iso;

        if (iso === todayIso) {
            td.classList.add("today");
            td.setAttribute("tabindex", "0");
        }
        
        const min = this.dp.options.minDate ? new Date(this.dp.options.minDate) : null;
        const max = this.dp.options.maxDate ? new Date(this.dp.options.maxDate) : null;

        let isDisabled = false;

        if (min && cellDate < min) isDisabled = true;
        if (max && cellDate > max) isDisabled = true;

        if (this.dp.options.disabledDates?.includes(iso)) {
            isDisabled = true;
        }

        td.setAttribute("aria-selected", "false");  

        if (isDisabled) {
            td.classList.add("disabled");
            td.dataset.disabled = "true";
            td.setAttribute("aria-disabled", "true");
            td.setAttribute("tabindex", "-1");
          }

        if (this.dp.options.highlightedDates?.includes(iso)) {
            td.classList.add("highlighted");
        }

        if (this.dp.selectedDate) {
            const selectedIso = DateUtils.toLocalISO(this.dp.selectedDate);
            if (iso === selectedIso) {
                td.classList.add("selected");
                td.setAttribute("aria-selected", "true");
                td.setAttribute("tabindex", "0");
            }
        }

        td.addEventListener("click", () => {
            this.dp.selectDate(cellDate);
        });

        return td;
    }



    fillCalendarDays(tbody) {
        const year = this.dp.currentDate.getFullYear();
        const month = this.dp.currentDate.getMonth();

        const { daysInMonth, firstDayIndex, prevMonthDays } =
            DateUtils.getMonthMetrics(
                year, 
                month, 
                this.dp.options.locale, 
                this.dp.options.firstDayOfWeek
            );

        const saturday = (6 - this.dp.options.firstDayOfWeek + 7) % 7;
        const sunday   = (7 - this.dp.options.firstDayOfWeek) % 7;
        const weekendCols = new Set([saturday, sunday]);

        for (let row = 0; row < 6; row++) {
            const tr = this.createWeekRow(year, month, firstDayIndex, row);

            for (let col = 0; col < 7; col++) {
                const cellIndex = row * 7 + col;
                const dayNumber = cellIndex - firstDayIndex + 1;

                const td = this.createDayCell(
                    year,
                    month,
                    dayNumber,
                    daysInMonth,
                    prevMonthDays
                );

                if (weekendCols.has(col)) {
                    td.classList.add("weekend");
                }


                tr.append(td);
            }

            tbody.append(tr);
        }
    }
}