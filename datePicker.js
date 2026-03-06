const dateInput = document.querySelector("#date-input");
const datepicker = document.querySelector("#datepicker");

datepicker.addEventListener("click", (e) => {
    e.stopPropagation();
});

dateInput.addEventListener("click", (e) => {
    e.stopPropagation();
    datepicker.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    const insidePicker = datepicker.contains(e.target);
    const insideInput = dateInput.contains(e.target);

    if (!insidePicker && !insideInput) {
        datepicker.classList.add("hidden");
    }
});

function onDaySelect(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    dateInput.value = `${y}-${m}-${d}`;   // įrašo datą į input
    datepicker.classList.add("hidden");   // uždaro DatePicker
}