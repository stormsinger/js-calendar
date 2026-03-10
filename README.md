🔗 
Live demo: https://stormsinger.github.io/js-calendar/

DatePicker Component
A modular, dependency‑free JavaScript DatePicker component designed for clarity, maintainability, and ease of integration. The component provides a classic calendar interface with ISO week numbers, smooth month transitions, dynamic positioning, and a fully separated architecture for rendering, navigation, utilities, and styling.

Features
- Modular architecture — clean separation of concerns across five dedicated modules.
- Classic calendar behavior — month navigation, ISO week numbers, today highlighting, and day selection.
- Dynamic positioning — automatically opens above or below the input depending on viewport space.
- Smooth animations — month transitions (slideLeft, slideRight) and opening animation (growFromCenter).
- Pure JavaScript — no external libraries or frameworks required.
- CSS split by responsibility — styling organized into four focused files for easy maintenance.
- Drop‑in integration — works with any project structure or build system.

Folder Structure
/datepicker
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

Each file has a single responsibility, making the component easy to understand, extend, and debug.

Installation
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


Initialize the component:
<script type="module">
    import DatePicker from "./js/DatePicker.js";
    new DatePicker("#date-input", "#picker-container");
</script>



Architecture Overview
DatePicker.js
The main orchestrator. Manages component state, initializes modules, handles open/close logic, and triggers rendering.
CalendarRenderer.js
Responsible for generating the calendar UI: table structure, days, week numbers, and month grid.
Navigation.js
Handles month and year navigation, button creation, and event binding.
Positioning.js
Calculates the optimal placement of the calendar relative to the input and updates position on scroll/resize.
DateUtils.js
A pure utility module containing date calculations: month metrics, ISO week numbers, and formatting.

Styling
The component’s styling is split into four dedicated files:
- datepicker.css — container, positioning, shadows, open/close transitions
- calendar.css — table layout, day cells, today/selected/weekend styles
- navigation.css — top and bottom navigation bars, buttons, labels
- animations.css — month transitions and opening animation keyframes
This separation ensures clarity and makes theme customization straightforward.

Browser Support
The component works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
No experimental APIs or polyfills are required.

License
MIT License — free to use, modify, and integrate into personal or commercial projects.
