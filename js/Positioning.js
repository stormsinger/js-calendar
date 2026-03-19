export default class Positioning {
    static instances = new Set();

    static rafPending = false;

    static scrollHandler = null;

    static resizeHandler = null;

    constructor(dp) {
        this.dp = dp;
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
        const offsetParent = picker.offsetParent;

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

        if (offsetParent && offsetParent !== document.body && offsetParent !== document.documentElement) {
            const parentRect = offsetParent.getBoundingClientRect();
            const parentTop = parentRect.top + scrollY - offsetParent.clientTop;
            const parentLeft = parentRect.left + scrollX - offsetParent.clientLeft;

            top -= parentTop;
            left -= parentLeft;
        }

        picker.style.top  = `${top}px`;
        picker.style.left = `${left}px`;
    }

    enableAutoRepositioning() {
        Positioning.instances.add(this);

        if (!Positioning.scrollHandler) {
            Positioning.scrollHandler = () => {
                if (Positioning.rafPending) return;

                Positioning.rafPending = true;
                requestAnimationFrame(() => {
                    Positioning.rafPending = false;

                    Positioning.instances.forEach((instance) => {
                        if (instance.dp.isOpen()) {
                            instance.positionPicker();
                        }
                    });
                });
            };

            window.addEventListener("scroll", Positioning.scrollHandler, true);
        }

        if (!Positioning.resizeHandler) {
            Positioning.resizeHandler = () => {
                Positioning.instances.forEach((instance) => {
                    if (instance.dp.isOpen()) {
                        instance.positionPicker();
                    }
                });
            };

            window.addEventListener("resize", Positioning.resizeHandler);
        }
    }

    destroy() {
        Positioning.instances.delete(this);

        if (!Positioning.instances.size && Positioning.scrollHandler) {
            window.removeEventListener("scroll", Positioning.scrollHandler, true);
            Positioning.scrollHandler = null;
        }

        if (!Positioning.instances.size && Positioning.resizeHandler) {
            window.removeEventListener("resize", Positioning.resizeHandler);
            Positioning.resizeHandler = null;
        }
    }
}