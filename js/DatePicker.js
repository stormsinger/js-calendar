import CalendarRenderer from "./CalendarRenderer.js";
import Navigation from "./Navigation.js";
import Positioning from "./Positioning.js";
import DateUtils from "./DateUtils.js";

export default class DatePicker {
    constructor(inputSelector, pickerSelector, options = {}) {
        this.input = document.querySelector(inputSelector);
        this.input.setAttribute("aria-haspopup", "dialog");
        this.input.setAttribute("aria-expanded", "false");
        this.input.setAttribute("aria-controls", "datepicker-dialog");

        this.container = document.querySelector(pickerSelector);
        this.container.setAttribute("role", "dialog");
        this.container.setAttribute("aria-modal", "true");
        this.container.setAttribute("id", "datepicker-dialog");

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

        //this.utils = DateUtils;
        this.renderer = new CalendarRenderer(this);
        this.navigation = new Navigation(this);
        this.positioning = new Positioning(this);
        this.calendarElement = this.renderer.calendarElement

        this.initialize();
    }

    initialize() {
        this.attachInputEvents();
        this.positioning.enableAutoRepositioning();
        this.container.setAttribute("tabindex", "-1");
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
        this.calendarElement = this.renderer.calendarElement;

        this.container.classList.add("open");
        this.container.focus();

        if (this.selectedDate) {
            const iso = DateUtils.toLocalISO(this.selectedDate);
            const cell = this.calendarElement.querySelector(`[data-iso="${iso}"]`);
            if (cell) {
                cell.setAttribute("tabindex", "0");
                cell.focus();
            }
        }

        this.input.setAttribute("aria-expanded", "true");
    }

    attachInputEvents() {
        this.input.addEventListener("click", () => {
            this.renderCalendar("grow-from-center");
            this.calendarElement = this.renderer.calendarElement;
            this.positioning.positionPicker();
        });

        this.container.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.close();
            }
        }, true);

        this.container.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                this.trapFocus(e);
            }
        });

        document.addEventListener("click", (e) => {
            const clickedInside = this.container.contains(e.target);
            const clickedInput = e.target === this.input;
            const isNavButton = e.target.closest(".nav-top, .nav-bottom");

            if (!clickedInside && !clickedInput && !isNavButton) {
                this.close();
            }
        });

        this.input.addEventListener("keydown", (e) => {
            // Enter arba Space
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.renderCalendar("grow-from-center");
                this.positioning.positionPicker();
                return;
            }

            // ArrowDown (su arba be Alt)
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.renderCalendar("grow-from-center");
                this.positioning.positionPicker();
                return;
            }
        });
    }

    trapFocus(e) {
        const focusable = this.calendarElement.querySelectorAll('[tabindex="0"], button');
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    handleDayKeydown(e, cellDate) {
        let newDate = null;
        const jsDay = cellDate.getDay(); // 0–6
        const weekDay = (jsDay === 0 ? 7 : jsDay);

        switch (e.key) {
            case "ArrowLeft":
                newDate = DateUtils.addDays(cellDate, -1);
                break;
            case "ArrowRight":
                newDate = DateUtils.addDays(cellDate, 1);
                break;
            case "ArrowUp":
                newDate = DateUtils.addDays(cellDate, -7);
                break;
            case "ArrowDown":
                newDate = DateUtils.addDays(cellDate, 7);
                break;
            case "PageUp":
                if (e.shiftKey) {
                    newDate = DateUtils.addYears(cellDate, -1);
                } else {
                    newDate = DateUtils.addMonths(cellDate, -1);
                }
                break;

            case "PageDown":
                if (e.shiftKey) {
                    newDate = DateUtils.addYears(cellDate, 1);
                } else {
                    newDate = DateUtils.addMonths(cellDate, 1);
                }
                break;
            case "Home":
                newDate = DateUtils.addDays(cellDate, -(weekDay - 1));
                break;

            case "End":
                newDate = DateUtils.addDays(cellDate, 7 - weekDay);
                break;

            case "Enter":
                this.selectDate(cellDate);
                return;
            case "Escape":
                this.close();
                return;
            default:
                return;
        }

        if (newDate) {
            this.focusDate(newDate);
        }
    }

    close() {
        this.container.classList.remove("open");

        // nuimti fokusą nuo bet kurio td
        if (this.calendarElement) {
            const focused = this.calendarElement.querySelector("[tabindex='0']");
            if (focused) focused.setAttribute("tabindex", "-1");
        }

        // grąžinti fokusą į input
        this.input.focus();
        this.input.setAttribute("aria-expanded", "false");
    }

    focusDate(date) {
        this.currentDate = new Date(date);
        this.renderCalendar(); 

        // PO renderCalendar() atsinaujina renderer.calendarElement
        this.calendarElement = this.renderer.calendarElement;

        const iso = DateUtils.toLocalISO(date);
        const cell = this.calendarElement.querySelector(`[data-iso="${iso}"]`);

        if (cell) {
            this.calendarElement.querySelectorAll("[tabindex='0']")
                .forEach(el => el.setAttribute("tabindex", "-1"));

            cell.setAttribute("tabindex", "0");
            cell.focus();
        }
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.currentDate = new Date(date);
        this.input.value = DateUtils.format(date);
        this.close();
    }
}

const dp = new DatePicker("#date-input", "#picker-container", {
    minDate: '2026-03-03',
    maxDate: '2026-04-04',
    disabledDates: ['2026-03-15', '2026-03-18'],
    highlightedDates: ['2026-03-11', '2026-03-20'],
    firstDayOfWeek: 1,
    locale: 'lt-LT'
});

