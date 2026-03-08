export default class DomUtils {
    static el(tag, className) {
        const el = document.createElement(tag);
        if (className) el.classList.add(className);
        return el;
    }
}