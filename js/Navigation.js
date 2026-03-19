import DateUtils from "./DateUtils.js";

export default class Navigation {
    constructor(dp) {
        this.dp = dp;
    }

    createYearNavigation() {
        const date = this.dp.currentDate;

        const navTop = document.createElement("nav");
        navTop.classList.add("nav-top");

        const btnPrevYear = document.createElement("button");
        btnPrevYear.setAttribute("tabindex", "-1");
        btnPrevYear.textContent = "<<";

        const labelYear = document.createElement("a");
        labelYear.setAttribute("tabindex", "-1");
        const formattedYear = DateUtils.formatWithOptions(date, this.dp.options.locale, {
            year: "numeric"
        });

        labelYear.textContent = `${formattedYear}`;

        const btnNextYear = document.createElement("button");
        btnNextYear.setAttribute("tabindex", "-1");
        btnNextYear.textContent = ">>";

        navTop.append(btnPrevYear, labelYear, btnNextYear);
        this.dp.calendarRoot.append(navTop);

        return { btnPrevYear, btnNextYear };
    }

    createMonthNavigation() {
        const date = this.dp.currentDate;

        const navBottom = document.createElement("nav");
        navBottom.classList.add("nav-bottom");

        const btnPrevMonth = document.createElement("button");
        btnPrevMonth.setAttribute("tabindex", "-1");
        btnPrevMonth.textContent = "<";

        const labelMonth = document.createElement("a");
        labelMonth.setAttribute("tabindex", "-1");
        const formattedMonth = DateUtils.formatWithOptions(date, this.dp.options.locale, {
            month: "long"
        });

        labelMonth.textContent = `${formattedMonth}`;

        const btnNextMonth = document.createElement("button");
        btnNextMonth.setAttribute("tabindex", "-1");
        btnNextMonth.textContent = ">";

        const btnToday = document.createElement("button");
        btnToday.setAttribute("tabindex", "-1");
        const today = new Date();
        const formattedToday = DateUtils.formatWithOptions(today, this.dp.options.locale, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        btnToday.textContent = `${formattedToday}`;

        navBottom.append(btnPrevMonth, labelMonth, btnNextMonth, btnToday);
        this.dp.calendarRoot.append(navBottom);

        return { btnPrevMonth, btnNextMonth, btnToday };
    }

    attachYearNavigationEvents(btnPrevYear, btnNextYear) {
        btnPrevYear.addEventListener("click", () => {
            const d = new Date(this.dp.currentDate);
            d.setFullYear(d.getFullYear() - 1);
            this.dp.renderCalendar("month-slide-left", d);
            this.dp.positioning.positionPicker();
        });

        btnNextYear.addEventListener("click", () => {
            const d = new Date(this.dp.currentDate);
            d.setFullYear(d.getFullYear() + 1);
            this.dp.renderCalendar("month-slide-right", d);
            this.dp.positioning.positionPicker();
        });
    }

    attachMonthNavigationEvents(btnPrevMonth, btnNextMonth) {
        btnPrevMonth.addEventListener("click", () => {
            const d = new Date(this.dp.currentDate);
            d.setMonth(d.getMonth() - 1);
            this.dp.renderCalendar("month-slide-left", d);
            this.dp.positioning.positionPicker();
        });

        btnNextMonth.addEventListener("click", () => {
            const d = new Date(this.dp.currentDate);
            d.setMonth(d.getMonth() + 1);
            this.dp.renderCalendar("month-slide-right", d);
            this.dp.positioning.positionPicker();
        });
    }

    attachTodayEvent(btnToday) {
        btnToday.addEventListener("click", () => {
            const today = new Date();
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            this.dp.renderCalendar("grow-from-center", d);
            this.dp.positioning.positionPicker();
        });
    }

    attachNavigationEvents(btnPrevYear, btnNextYear, btnPrevMonth, btnNextMonth, btnToday) {
        this.attachYearNavigationEvents(btnPrevYear, btnNextYear);
        this.attachMonthNavigationEvents(btnPrevMonth, btnNextMonth);
        this.attachTodayEvent(btnToday);
    }
}