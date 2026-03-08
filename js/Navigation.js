import DomUtils from "./DomUtils.js";

export default class Navigation {
    constructor(dp) {
        this.dp = dp;
    }

    createYearNavigation() {
        const date = this.dp.currentDate;

        const navTop = document.createElement('nav');
        navTop.classList.add('nav-top');

        const btnPrevYear = document.createElement('button');
        btnPrevYear.textContent = '<<';

        const labelYear = document.createElement('a');
        labelYear.textContent = `${date.getFullYear()}`;

        const btnNextYear = document.createElement('button');
        btnNextYear.textContent = '>>';

        navTop.append(btnPrevYear, labelYear, btnNextYear);
        this.dp.calendarRoot.append(navTop);

        return { btnPrevYear, btnNextYear };
    }

    createMonthNavigation() {
        const date = this.dp.currentDate;

        const navBottom = document.createElement('nav');
        navBottom.classList.add('nav-bottom');

        const btnPrevMonth = document.createElement('button');
        btnPrevMonth.textContent = '<';

        const labelMonth = document.createElement('a');
        labelMonth.textContent = `${this.dp.monthNames[date.getMonth()]}`;

        const btnNextMonth = document.createElement('button');
        btnNextMonth.textContent = '>';

        const btnToday = document.createElement('button');
        btnToday.textContent = 'Today';

        navBottom.append(btnPrevMonth, labelMonth, btnNextMonth, btnToday);
        this.dp.calendarRoot.append(navBottom);

        return { btnPrevMonth, btnNextMonth, btnToday };
    }

    attachYearNavigationEvents(btnPrevYear, btnNextYear) {
        btnPrevYear.addEventListener("click", () => {
            this.dp.currentDate.setFullYear(this.dp.currentDate.getFullYear() - 1);
            this.dp.renderCalendar("month-slide-right");
            this.dp.positioning.positionPicker();
        });

        btnNextYear.addEventListener("click", () => {
            this.dp.currentDate.setFullYear(this.dp.currentDate.getFullYear() + 1);
            this.dp.renderCalendar("month-slide-left");
            this.dp.positioning.positionPicker();
        });
    }

    attachMonthNavigationEvents(btnPrevMonth, btnNextMonth) {
        btnPrevMonth.addEventListener("click", () => {
            this.dp.currentDate.setMonth(this.dp.currentDate.getMonth() - 1);
            this.dp.renderCalendar("month-slide-right");
            this.dp.positioning.positionPicker();
        });

        btnNextMonth.addEventListener("click", () => {
            this.dp.currentDate.setMonth(this.dp.currentDate.getMonth() + 1);
            this.dp.renderCalendar("month-slide-left");
            this.dp.positioning.positionPicker();
        });
    }

    attachTodayEvent(btnToday) {
        btnToday.addEventListener("click", () => {
            const today = new Date();
            this.dp.currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            this.dp.renderCalendar("grow-from-center");
            this.dp.positioning.positionPicker();
        });
    }

    attachNavigationEvents(btnPrevYear, btnNextYear, btnPrevMonth, btnNextMonth, btnToday) {
        this.attachYearNavigationEvents(btnPrevYear, btnNextYear);
        this.attachMonthNavigationEvents(btnPrevMonth, btnNextMonth);
        this.attachTodayEvent(btnToday);
    }
}