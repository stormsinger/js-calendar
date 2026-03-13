DatePicker
- Accessible, keyboard‑navigable, framework‑agnostic JavaScript DatePicker.

![DatePicker screenshot](./pics/demo.jpg)

🔗 Live demo: https://stormsinger.github.io/js-calendar/
🔗 Repository: https://github.com/stormsinger/js-calendar


Features
- ARIA dialog + ARIA grid
- Full keyboard navigation
- Modular architecture
- Localization
- ISO Week numbers
- Min/max dates
- Disabled dates
- Highlighted dates
- No dependencies
- Dynamic positioning
- Smooth month transitions
- Clean CSS separation

Folder Structure
    /calendar
        /css
            datepicker.css
            calendar.css
            navigation.css
            animations.css
        /js
            DatePicker.js
            CalendarRenderer.js
            Navigation.js
            Positioning.js
            DateUtils.js

Installation:
Include the CSS files in your HTML:
    <link rel="stylesheet" href="css/datepicker.css">
    <link rel="stylesheet" href="css/calendar.css">
    <link rel="stylesheet" href="css/navigation.css">
    <link rel="stylesheet" href="css/animations.css">
Add the HTML structure:
    <input id="date-input" type="text" readonly>
    <div id="picker-container" class="datepicker">
        <div id="calendar"></div>
    </div>
Usage:
    <script type="module">
        import DatePicker from "./js/DatePicker.js";
        const picker = new DatePicker("#input", "#container", {
            locale: "en-US",
            firstDayOfWeek: 1
        });
    </script>

API Options:
    Option: inputSelector
        Type: string
        Default: required
        Description: CSS selector for the input element that triggers the DatePicker.
    Option: containerSelector
        Type: string
        Default: required
        Description: CSS selector for the container where the calendar will be rendered.
    Option: locale
        Type: string
        Default: "en-US"
        Description: Controls localization (month names, weekday names, first day of week).
    Option: firstDayOfWeek
        Type: number
        Default: 1
        Description: Sets the first day of the week (0 = Sunday, 1 = Monday).
    Option: minDate
        Type: Date or null
        Default: null
        Description: The earliest selectable date.
    Option: maxDate
        Type: Date or null
        Default: null
        Description: The latest selectable date.
    Option: disabledDates
        Type: array of Date
        Default: []
        Description: Dates that cannot be selected.
    Option: highlightedDates
        Type: array of Date
        Default: []
        Description: Dates that are visually highlighted in the calendar.
    Option: onSelect
        Type: function(date)
        Default: null
        Description: Callback function fired when the user selects a date.

Examples

Basic usage
A simple DatePicker attached to an input and container

    <input id="basic-input" type="text" readonly>

    <div id="basic-container" class="datepicker">
        <div id="calendar"></div>
    </div>

    <script type="module">
        import DatePicker from "./js/DatePicker.js";

        new DatePicker("#basic-input", "#basic-container");
    </script>

Min and max selectable dates
Restricts the calendar so the user can only choose dates within a defined range

    <input id="range-input" type="text" readonly>

    <div id="range-container" class="datepicker">
        <div id="calendar"></div>
    </div>

    <script type="module">
        import DatePicker from "./js/DatePicker.js";

        new DatePicker("#range-input", "#range-container", {
            minDate: new Date(2024, 0, 1),
            maxDate: new Date(2024, 11, 31)
        });
    </script>

Disabled dates
Specific dates cannot be selected. They appear visually disabled in the calendar

    <input id="disabled-input" type="text" readonly>

    <div id="disabled-container" class="datepicker">
        <div id="calendar"></div>
    </div>

    <script type="module">
        import DatePicker from "./js/DatePicker.js";

        new DatePicker("#disabled-input", "#disabled-container", {
            disabledDates: [
                new Date(2024, 2, 15),
                new Date(2024, 2, 16),
                new Date(2024, 2, 20)
            ]
        });
    </script>

Highlighted dates
Highlights specific dates without disabling them

    <input id="highlight-input" type="text" readonly>

    <div id="highlight-container" class="datepicker">
        <div id="calendar"></div>
    </div>

    <script type="module">
        import DatePicker from "./js/DatePicker.js";

        new DatePicker("#highlight-input", "#highlight-container", {
            highlightedDates: [
                new Date(2024, 5, 10),
                new Date(2024, 5, 12)
            ]
        });
    </script>

Locale and first day of week
Changes language and week layout.

    <input id="date-input" type="text" readonly>

    <div id="picker-container" class="datepicker">
        <div id="calendar"></div>
    </div>

    <script type="module">
        import DatePicker from "./js/DatePicker.js";

        new DatePicker("#date-input", "#picker-container", {
            locale: "lt-LT",
            firstDayOfWeek: 1
        });
    </script>

Browser Support
The component works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
No experimental APIs or polyfills are required.

License
MIT License — free to use, modify, and integrate into personal or commercial projects.
