import CalendarRenderer from "./CalendarRenderer.js";
import Navigation from "./Navigation.js";
import Positioning from "./Positioning.js";
import DateUtils from "./DateUtils.js";

export default class DatePicker {
    constructor(inputSelector, pickerSelector, options = {}) {
        this.input = document.querySelector(inputSelector);
        this.container = document.querySelector(pickerSelector);

        this.currentDate = new Date();
        this.selectedDate = null;

        this.options = {
            minDate: null,
            maxDate: null,
            firstDayOfWeek: 1,
            locale: 'lt-LT',
            ...options
        };

        this.monthNames = Array.from({ length: 12 }, (_, i) =>
            new Intl.DateTimeFormat(this.options.locale, { month: "long" }).format(new Date(2024, i, 2))
        );

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

    renderCalendar(animation, newDate = null) {
        if (newDate) {
            this.currentDate = newDate;
        }

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

const dp = new DatePicker("#date-input", "#picker-container", {
    minDate: '2026-03-03',
    maxDate: '2026-03-24',
    disabledDates: ['2026-03-15', '2026-03-18'],
    highlightedDates: ['2026-03-10', '2026-03-20'],
    firstDayOfWeek: 1,
    locale: 'lt-LT'
});

