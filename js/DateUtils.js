export default class DateUtils {
    static formatterCache = new Map();

    static weekdayCache = new Map();

    static getFormatter(locale, options) {
        const cacheKey = `${locale}:${JSON.stringify(options)}`;

        if (!this.formatterCache.has(cacheKey)) {
            this.formatterCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
        }

        return this.formatterCache.get(cacheKey);
    }

    static formatWithOptions(date, locale, options) {
        return this.getFormatter(locale, options).format(date);
    }

    static getWeekdayNames(locale) {
        if (!this.weekdayCache.has(locale)) {
            const names = [...Array(7).keys()].map((index) =>
                this.formatWithOptions(new Date(1970, 0, 4 + index), locale, { weekday: "short" })
            );

            this.weekdayCache.set(locale, names);
        }

        return this.weekdayCache.get(locale);
    }

    static getRotatedWeekdayNames(locale, firstDayOfWeek) {
        const baseDays = this.getWeekdayNames(locale);

        return [
            ...baseDays.slice(firstDayOfWeek),
            ...baseDays.slice(0, firstDayOfWeek)
        ];
    }

    static getMonthMetrics(year, month, locale, firstDayOfWeek) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const rotatedDays = this.getRotatedWeekdayNames(locale, firstDayOfWeek);

        const firstDate = new Date(year, month, 1);
        const firstDayName = this.formatWithOptions(firstDate, locale, { weekday: "short" });

        const firstDayIndex = rotatedDays.indexOf(firstDayName);

        return { daysInMonth, firstDayIndex, prevMonthDays };
    }

    static getISOWeekNumber(date) {
        const temp = new Date(date.getTime());
        temp.setHours(0, 0, 0, 0);
        temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
        const week1 = new Date(temp.getFullYear(), 0, 4);
        return 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }
    
    static toLocalISO(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    static addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    static format(date) {
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    }

    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    static addYears(date, years) {
        const d = new Date(date);
        const month = d.getMonth();
        d.setFullYear(d.getFullYear() + years);

        if (d.getMonth() !== month) {
            d.setDate(0);
        }

        return d;
    }
};