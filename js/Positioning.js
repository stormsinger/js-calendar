export default class Positioning {
    constructor(dp) {
        this.dp = dp;
    }

    positionPicker() {
        const inputRect = this.dp.input.getBoundingClientRect();
        const picker = this.dp.container;

        picker.classList.remove("datepicker-top", "datepicker-bottom");

        picker.style.visibility = "hidden";
        picker.style.display = "block";

        const pickerHeight = picker.offsetHeight;

        picker.style.visibility = "";
        picker.style.display = "";

        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;

        picker.style.left = `${inputRect.left + window.scrollX}px`;

        if (spaceBelow >= pickerHeight) {
            picker.classList.add("datepicker-bottom");
            picker.style.top = `${inputRect.bottom + window.scrollY}px`;
        } else {
            picker.classList.add("datepicker-top");
            picker.style.top = `${inputRect.top - pickerHeight + window.scrollY}px`;
        }
    }

    enableAutoRepositioning() {
        const reposition = () => {
            if (this.dp.container.classList.contains("open")) {
                this.positionPicker();
            }
        };

        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
    }
}