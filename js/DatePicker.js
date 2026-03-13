import CalendarRenderer from "./CalendarRenderer.js";
import Navigation from "./Navigation.js";
import Positioning from "./Positioning.js";
import DateUtils from "./DateUtils.js";

export default class DatePicker {
    constructor(inputSelector, pickerSelector, options = {}) {
        if (typeof inputSelector !== "string" || !inputSelector.trim()) {
            throw new TypeError("DatePicker: inputSelector must be a non-empty CSS selector string.");
        }

        if (typeof pickerSelector !== "string" || !pickerSelector.trim()) {
            throw new TypeError("DatePicker: pickerSelector must be a non-empty CSS selector string.");
        }

        this.input = document.querySelector(inputSelector);
        if (!this.input) {
            throw new Error(`DatePicker: input element not found for selector "${inputSelector}".`);
        }

        if (this.input.tagName !== "INPUT") {
            throw new Error(`DatePicker: selector "${inputSelector}" must target an <input> element.`);
        }

        this.input.setAttribute("aria-haspopup", "dialog");
        this.input.setAttribute("aria-expanded", "false");

        this.container = document.querySelector(pickerSelector);
        if (!this.container) {
            throw new Error(`DatePicker: picker container not found for selector "${pickerSelector}".`);
        }

        if (!this.container.querySelector("#calendar, .calendar-root")) {
            throw new Error("DatePicker: picker container must include an element matching \"#calendar\" or \".calendar-root\".");
        }

        if (typeof DatePicker._instanceCount !== "number") {
            DatePicker._instanceCount = 0;
        }

        if (!this.container.id) {
            DatePicker._instanceCount += 1;
            this.container.id = `datepicker-dialog-${DatePicker._instanceCount}`;
        }

        this.input.setAttribute("aria-controls", this.container.id);

        this.container.setAttribute("role", "dialog");
        this.container.setAttribute("aria-modal", "true");

        this.currentDate = new Date();
        this.selectedDate = null;

        const mergedOptions = {
            minDate: null,
            maxDate: null,
            disabledDates: [],
            highlightedDates: [],
            onSelect: null,
            firstDayOfWeek: 1,
            locale: "en-US",
            ...options
        };

        this.options = {
            ...mergedOptions,
            minDate: this.normalizeDateValue(mergedOptions.minDate),
            maxDate: this.normalizeDateValue(mergedOptions.maxDate),
            disabledDates: this.normalizeDateList(mergedOptions.disabledDates),
            highlightedDates: this.normalizeDateList(mergedOptions.highlightedDates)
        };

        this.renderer = new CalendarRenderer(this);
        this.navigation = new Navigation(this);
        this.positioning = new Positioning(this);
        this.calendarElement = this.renderer.calendarElement;

        this.initialize();
    }

    normalizeDateValue(value) {
        if (!value) return null;

        if (value instanceof Date) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(year, month - 1, day);
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return null;

        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    normalizeDateList(list) {
        if (!Array.isArray(list)) return [];

        return list
            .map((value) => {
                if (value instanceof Date) {
                    return DateUtils.toLocalISO(value);
                }

                if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return value;
                }

                const parsed = new Date(value);
                if (Number.isNaN(parsed.getTime())) return null;

                return DateUtils.toLocalISO(parsed);
            })
            .filter(Boolean);
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
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.renderCalendar("grow-from-center");
                this.positioning.positionPicker();
                return;
            }

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
        let newDate;
        const jsDay = cellDate.getDay();
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

        if (this.calendarElement) {
            const focused = this.calendarElement.querySelector("[tabindex='0']");
            if (focused) focused.setAttribute("tabindex", "-1");
        }

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

        if (typeof this.options.onSelect === "function") {
            this.options.onSelect(new Date(this.selectedDate));
        }

        this.close();
    }

    destroy() {
        this.positioning.destroy();
    }
}

