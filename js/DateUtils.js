export default {
    getMonthMetrics(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let firstDayIndex = new Date(year, month, 1).getDay();
        if (firstDayIndex === 0) firstDayIndex = 7;

        const prevMonthDays = new Date(year, month, 0).getDate();

        return { daysInMonth, firstDayIndex, prevMonthDays };
    },

    getISOWeekNumber(date) {
        const temp = new Date(date.getTime());
        temp.setHours(0, 0, 0, 0);
        temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
        const week1 = new Date(temp.getFullYear(), 0, 4);
        return 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    },

    format(date) {
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }
};