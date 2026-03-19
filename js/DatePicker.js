import CalendarRenderer from "./CalendarRenderer.js";
import Navigation from "./Navigation.js";
import Positioning from "./Positioning.js";
import DateUtils from "./DateUtils.js";

export default class DatePicker {
    static instances = new Set();

    static documentClickHandler = null;

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
        this.showcase = this.input.closest(".demo-showcase");

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

        this.disabledDateSet = new Set(this.options.disabledDates);
        this.highlightedDateSet = new Set(this.options.highlightedDates);

        this.renderer = new CalendarRenderer(this);
        this.navigation = new Navigation(this);
        this.positioning = new Positioning(this);
        this.calendarElement = this.renderer.calendarElement;
        this.boundHandlers = {};

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
        DatePicker.registerInstance(this);
        this.attachInputEvents();
        this.positioning.enableAutoRepositioning();
        this.container.setAttribute("tabindex", "-1");
    }

    static registerInstance(instance) {
        DatePicker.instances.add(instance);

        if (!DatePicker.documentClickHandler) {
            DatePicker.documentClickHandler = (event) => {
                DatePicker.instances.forEach((pickerInstance) => {
                    pickerInstance.handleDocumentClick(event);
                });
            };

            document.addEventListener("click", DatePicker.documentClickHandler);
        }
    }

    static unregisterInstance(instance) {
        DatePicker.instances.delete(instance);

        if (!DatePicker.instances.size && DatePicker.documentClickHandler) {
            document.removeEventListener("click", DatePicker.documentClickHandler);
            DatePicker.documentClickHandler = null;
        }
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
        if (this.showcase) {
            this.showcase.classList.add("is-picker-open");
        }
        this.container.focus();

        this.focusInitialCell();

        this.input.setAttribute("aria-expanded", "true");
    }

    isOpen() {
        return this.container.classList.contains("open");
    }

    open(animation = "grow-from-center") {
        if (this.isOpen()) {
            this.positioning.positionPicker();
            return;
        }

        this.renderCalendar(animation);
        this.positioning.positionPicker();
    }

    attachInputEvents() {
        this.boundHandlers.inputClick = () => {
            this.open("grow-from-center");
        };

        this.boundHandlers.containerKeydownCapture = (e) => {
            if (e.key === "Escape") {
                this.close();
            }
        };

        this.boundHandlers.containerKeydown = (e) => {
            if (e.key === "Tab") {
                this.trapFocus(e);
                return;
            }

            const dayCell = e.target.closest("td[data-iso]");
            if (!dayCell || !this.container.contains(dayCell)) {
                return;
            }

            const cellDate = this.getCellDate(dayCell);
            if (cellDate) {
                this.handleDayKeydown(e, cellDate);
            }
        };

        this.boundHandlers.containerClick = (e) => {
            const dayCell = e.target.closest("td[data-iso]");
            if (!dayCell || !this.container.contains(dayCell) || dayCell.dataset.disabled === "true") {
                return;
            }

            const cellDate = this.getCellDate(dayCell);
            if (cellDate) {
                this.selectDate(cellDate);
            }
        };

        this.boundHandlers.inputKeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.open("grow-from-center");
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.open("grow-from-center");
                return;
            }
        };

        this.input.addEventListener("click", this.boundHandlers.inputClick);
        this.input.addEventListener("keydown", this.boundHandlers.inputKeydown);
        this.container.addEventListener("keydown", this.boundHandlers.containerKeydownCapture, true);
        this.container.addEventListener("keydown", this.boundHandlers.containerKeydown);
        this.container.addEventListener("click", this.boundHandlers.containerClick);
    }

    handleDocumentClick(e) {
        const clickedInside = this.container.contains(e.target);
        const clickedInput = e.target === this.input;
        const isNavButton = e.target.closest(".nav-top, .nav-bottom");

        if (!clickedInside && !clickedInput && !isNavButton) {
            this.close({ restoreFocus: false });
        }
    }

    getCellDate(cell) {
        const iso = cell?.dataset?.iso;
        if (!iso) return null;

        const [year, month, day] = iso.split("-").map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    }

    isDateSelectable(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return false;
        }

        const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (this.options.minDate && normalized < this.options.minDate) {
            return false;
        }

        if (this.options.maxDate && normalized > this.options.maxDate) {
            return false;
        }

        const iso = DateUtils.toLocalISO(normalized);
        return !this.disabledDateSet.has(iso);
    }

    setFocusedCell(cell) {
        if (!this.calendarElement || !cell) return;

        this.calendarElement.querySelectorAll("[tabindex='0']")
            .forEach((el) => el.setAttribute("tabindex", "-1"));

        cell.setAttribute("tabindex", "0");
        cell.focus();
    }

    getInitialFocusableCell() {
        if (!this.calendarElement) return null;

        if (this.selectedDate && this.isDateSelectable(this.selectedDate)) {
            const selectedIso = DateUtils.toLocalISO(this.selectedDate);
            const selectedCell = this.calendarElement.querySelector(`[data-iso="${selectedIso}"]:not(.disabled)`);
            if (selectedCell) return selectedCell;
        }

        const todayCell = this.calendarElement.querySelector("td.today:not(.disabled)");
        if (todayCell) return todayCell;

        const currentMonthCell = this.calendarElement.querySelector("td.current-month:not(.disabled)");
        if (currentMonthCell) return currentMonthCell;

        return this.calendarElement.querySelector("td[data-iso]:not(.disabled)");
    }

    focusInitialCell() {
        const fallbackCell = this.getInitialFocusableCell();
        if (fallbackCell) {
            this.setFocusedCell(fallbackCell);
        }
    }

    trapFocus(e) {
        if (!this.calendarElement) return;

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
        const handledKeys = new Set([
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            "Enter",
            "Escape"
        ]);

        if (handledKeys.has(e.key)) {
            e.preventDefault();
        }

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
                if (this.isDateSelectable(cellDate)) {
                    this.selectDate(cellDate);
                }
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

    close({ restoreFocus = true } = {}) {
        if (!this.isOpen()) {
            this.input.setAttribute("aria-expanded", "false");
            return;
        }

        this.container.classList.remove("open");
        if (this.showcase) {
            this.showcase.classList.remove("is-picker-open");
        }

        if (this.calendarElement) {
            const focused = this.calendarElement.querySelector("[tabindex='0']");
            if (focused) focused.setAttribute("tabindex", "-1");
        }

        if (restoreFocus) {
            this.input.focus();
        }

        this.input.setAttribute("aria-expanded", "false");
    }

    focusDate(date) {
        this.currentDate = new Date(date);
        this.renderCalendar();

        const iso = DateUtils.toLocalISO(date);
        const cell = this.calendarElement.querySelector(`[data-iso="${iso}"]:not(.disabled)`);

        if (cell) {
            this.setFocusedCell(cell);
            return;
        }

        this.focusInitialCell();
    }

    selectDate(date) {
        if (!this.isDateSelectable(date)) {
            return;
        }

        this.selectedDate = new Date(date);
        this.currentDate = new Date(date);
        this.input.value = DateUtils.format(date);

        if (typeof this.options.onSelect === "function") {
            this.options.onSelect(new Date(this.selectedDate));
        }

        this.close();
    }

    destroy() {
        this.close({ restoreFocus: false });
        this.input.removeEventListener("click", this.boundHandlers.inputClick);
        this.input.removeEventListener("keydown", this.boundHandlers.inputKeydown);
        this.container.removeEventListener("keydown", this.boundHandlers.containerKeydownCapture, true);
        this.container.removeEventListener("keydown", this.boundHandlers.containerKeydown);
        this.container.removeEventListener("click", this.boundHandlers.containerClick);
        DatePicker.unregisterInstance(this);
        this.positioning.destroy();
    }
}

