const dateInput = document.querySelector("#date-input");
const datepicker = document.querySelector("#datepicker");

function positionDatePicker(input, picker) {
    const rect = input.getBoundingClientRect();
    const pickerRect = picker.getBoundingClientRect();

    picker.classList.remove("datepicker-top", "datepicker-bottom");

    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;

    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < pickerRect.height + 10) {
        top = rect.top - pickerRect.height + window.scrollY;
        picker.classList.add("datepicker-top");
    } else {
        picker.classList.add("datepicker-bottom");
    }

    const spaceRight = window.innerWidth - rect.left;
    if (spaceRight < pickerRect.width) {
        left = rect.right - pickerRect.width + window.scrollX;
    }

    picker.style.top = top + "px";
    picker.style.left = left + "px";
}

datepicker.addEventListener("click", (e) => {
    e.stopPropagation();
});

dateInput.addEventListener("click", (e) => {
    e.stopPropagation();
    datepicker.classList.add("visible");
    datepicker.classList.remove("hidden");
    requestAnimationFrame(() => {
        positionDatePicker(dateInput, datepicker);
    });
});

document.addEventListener("click", (e) => {
    if (!datepicker.contains(e.target) && !dateInput.contains(e.target)) {
        datepicker.classList.remove("visible");
        datepicker.classList.add("hidden");
    }
});


function onDaySelect(date, tdElement) {
    document.querySelectorAll("#calendar td").forEach(td => td.classList.remove("selected"));
    tdElement.classList.add("selected");

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    dateInput.value = `${y}-${m}-${d}`;   
    datepicker.classList.add("hidden");  
    datepicker.classList.remove("visible");
}

