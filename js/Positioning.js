export default class Positioning {
    constructor(dp) {
        this.dp = dp;
        this._scrollHandler = null;
        this._resizeHandler = null;
    }

    positionPicker() {
        const inputRect = this.dp.input.getBoundingClientRect();

        // Guard: skip if input is not visible/attached
        if (inputRect.width === 0 && inputRect.height === 0) return;

        const picker = this.dp.container;

        picker.classList.remove("datepicker-top", "datepicker-bottom");

        // Measure picker at full visibility to get accurate dimensions
        const prevVisibility = picker.style.visibility;
        const prevDisplay = picker.style.display;
        picker.style.visibility = "hidden";
        picker.style.display = "block";

        const pickerHeight = picker.offsetHeight;
        const pickerWidth = picker.offsetWidth;

        picker.style.visibility = prevVisibility;
        picker.style.display = prevDisplay;

        const viewportWidth  = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;

        // Vertical: prefer below, fall back to above, then whichever has more space
        let top;
        if (spaceBelow >= pickerHeight) {
            picker.classList.add("datepicker-bottom");
            top = inputRect.bottom + scrollY;
        } else if (spaceAbove >= pickerHeight) {
            picker.classList.add("datepicker-top");
            top = inputRect.top - pickerHeight + scrollY;
        } else if (spaceBelow >= spaceAbove) {
            picker.classList.add("datepicker-bottom");
            top = inputRect.bottom + scrollY;
        } else {
            picker.classList.add("datepicker-top");
            top = Math.max(scrollY, inputRect.top - pickerHeight + scrollY);
        }

        // Horizontal: align to input left, then clamp to viewport
        let left = inputRect.left + scrollX;
        const rightEdge = left + pickerWidth;
        if (rightEdge > viewportWidth + scrollX) {
            left = Math.max(scrollX, viewportWidth + scrollX - pickerWidth);
        }

        picker.style.top  = `${top}px`;
        picker.style.left = `${left}px`;
    }

    enableAutoRepositioning() {
        let rafPending = false;

        this._scrollHandler = () => {
            if (!this.dp.container.classList.contains("open")) return;
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                rafPending = false;
                if (this.dp.container.classList.contains("open")) {
                    this.positionPicker();
                }
            });
        };

        this._resizeHandler = () => {
            if (this.dp.container.classList.contains("open")) {
                this.positionPicker();
            }
        };

        window.addEventListener("scroll", this._scrollHandler, true);
        window.addEventListener("resize", this._resizeHandler);
    }

    destroy() {
        if (this._scrollHandler) {
            window.removeEventListener("scroll", this._scrollHandler, true);
            this._scrollHandler = null;
        }
        if (this._resizeHandler) {
            window.removeEventListener("resize", this._resizeHandler);
            this._resizeHandler = null;
        }
    }
}