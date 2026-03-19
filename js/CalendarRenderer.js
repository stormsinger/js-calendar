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

        const rotatedDays = DateUtils.getRotatedWeekdayNames(
            this.dp.options.locale,
            this.dp.options.firstDayOfWeek
        );

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

    createDayCell(year, month, dayNumber, daysInMonth, prevMonthDays, renderState) {
        const td = document.createElement("td");
        td.setAttribute("role", "gridcell");
        td.setAttribute("tabindex", "-1");
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

        const iso = DateUtils.toLocalISO(cellDate);

        td.dataset.iso = iso;

        if (iso === renderState.todayIso) {
            td.classList.add("today");
            td.setAttribute("tabindex", "0");
        }

        let isDisabled = false;

        if (renderState.minDate && cellDate < renderState.minDate) isDisabled = true;
        if (renderState.maxDate && cellDate > renderState.maxDate) isDisabled = true;

        if (this.dp.disabledDateSet.has(iso)) {
            isDisabled = true;
        }

        td.setAttribute("aria-selected", "false");  

        if (isDisabled) {
            td.classList.add("disabled");
            td.dataset.disabled = "true";
            td.setAttribute("aria-disabled", "true");
            td.setAttribute("tabindex", "-1");
          }

        if (this.dp.highlightedDateSet.has(iso)) {
            td.classList.add("highlighted");
        }

        if (!isDisabled && iso === renderState.selectedIso) {
            td.classList.add("selected");
            td.setAttribute("aria-selected", "true");
            td.setAttribute("tabindex", "0");
        }

        return td;
    }



    fillCalendarDays(tbody) {
        const year = this.dp.currentDate.getFullYear();
        const month = this.dp.currentDate.getMonth();
        const renderState = {
            minDate: this.dp.options.minDate,
            maxDate: this.dp.options.maxDate,
            selectedIso: this.dp.selectedDate ? DateUtils.toLocalISO(this.dp.selectedDate) : null,
            todayIso: DateUtils.toLocalISO(new Date())
        };

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
                    prevMonthDays,
                    renderState
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