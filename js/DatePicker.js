import CalendarRenderer from "./CalendarRenderer.js";
import Navigation from "./Navigation.js";
import Positioning from "./Positioning.js";
import DateUtils from "./DateUtils.js";

export default class DatePicker {
    constructor(inputSelector, pickerSelector) {
        this.input = document.querySelector(inputSelector);
        this.container = document.querySelector(pickerSelector);

        this.currentDate = new Date();
        this.selectedDate = null;

        this.monthNames = [
            "Sausis","Vasaris","Kovas","Balandis","Gegužė","Birželis",
            "Liepa","Rugpjūtis","Rugsėjis","Spalis","Lapkritis","Gruodis"
        ];

        this.utils = DateUtils;
        this.renderer = new CalendarRenderer(this);
        this.navigation = new Navigation(this);
        this.positioning = new Positioning(this);

        this.initialize();
    }

    initialize() {
        this.attachInputEvents();
        this.positioning.enableAutoRepositioning();
    }

    renderCalendar(animation) {
        this.renderer.clearRoot();
        this.renderer.createCalendarRoot();

        const { btnPrevYear, btnNextYear } = this.navigation.createYearNavigation();
        const { btnPrevMonth, btnNextMonth, btnToday } = this.navigation.createMonthNavigation();

        this.navigation.attachNavigationEvents(
            btnPrevYear,
            btnNextYear,
            btnPrevMonth,
            btnNextMonth,
            btnToday
        );

        const tbody = this.renderer.createCalendarTable(animation);
        this.renderer.fillCalendarDays(tbody);

        this.container.classList.add("open");
    }

    attachInputEvents() {
        this.input.addEventListener("click", () => {
            this.renderCalendar("grow-from-center");
            this.positioning.positionPicker();
        });

        document.addEventListener("click", (e) => {
            const clickedInside = this.container.contains(e.target);
            const clickedInput = e.target === this.input;
            const isNavButton = e.target.closest(".nav-top, .nav-bottom");

            if (!clickedInside && !clickedInput && !isNavButton) {
                this.container.classList.remove("open");
            }
        });
    }
}

new DatePicker("#date-input", "#picker-container");
