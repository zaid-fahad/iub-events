// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
  // Add a container for the calendar
  const calendarContainer = document.createElement('div');
  calendarContainer.id = 'calendar';
  calendarContainer.style.maxWidth = '800px';
  calendarContainer.style.margin = '0 auto';
  document.body.appendChild(calendarContainer);

  // Load FullCalendar's CSS and JS dynamically
  loadFullCalendar();

  // Initialize the calendar after loading FullCalendar
  loadICalEvents('https://calendar.google.com/calendar/ical/c_q5s4j97isu0jprs9nkelo27ak8%40group.calendar.google.com/public/basic.ics');
});

// Dynamically load FullCalendar CSS and JS
function loadFullCalendar() {
  const fullCalendarCSS = document.createElement('link');
  fullCalendarCSS.rel = 'stylesheet';
  fullCalendarCSS.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.5/main.min.css';
  document.head.appendChild(fullCalendarCSS);

  const fullCalendarJS = document.createElement('script');
  fullCalendarJS.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.5/main.min.js';
  document.head.appendChild(fullCalendarJS);
}

// Fetch iCal data and parse it
function loadICalEvents(icalUrl) {
  fetch(icalUrl)
    .then((response) => response.text())
    .then((data) => {
      const events = parseICal(data);
      renderCalendar(events);
    })
    .catch((error) => console.error('Error fetching calendar:', error));
}

// Parse the iCal data
function parseICal(icalData) {
  const events = [];
  const lines = icalData.split('\n');
  let event = null;

  lines.forEach((line) => {
    if (line.startsWith('BEGIN:VEVENT')) {
      event = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (event) {
        events.push({
          title: event.SUMMARY || 'Untitled Event',
          start: formatICalDate(event.DTSTART),
          end: formatICalDate(event.DTEND),
          description: event.DESCRIPTION || '',
          location: event.LOCATION || 'No location specified',
        });
      }
      event = null;
    } else if (event) {
      const [key, value] = line.split(':', 2);
      if (key && value) {
        event[key] = value;
      }
    }
  });

  return events;
}

// Format iCal date (e.g., 20240120T100000Z -> 2024-01-20T10:00:00)
function formatICalDate(icalDate) {
  if (!icalDate) return null;
  const date = icalDate.replace(/T/, '').replace(/Z/, '');
  return date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8) +
    'T' + date.slice(9, 11) + ':' + date.slice(11, 13) + ':' + date.slice(13, 15);
}

// Render FullCalendar with the parsed events
function renderCalendar(events) {
  const interval = setInterval(() => {
    if (typeof FullCalendar !== 'undefined') {
      clearInterval(interval);

      const calendarEl = document.getElementById('calendar');
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        events: events,
        eventClick: function (info) {
          alert(
            `Event: ${info.event.title}\n` +
            `Start: ${info.event.start}\n` +
            `End: ${info.event.end || 'N/A'}\n` +
            `Location: ${info.event.extendedProps.location}\n` +
            `Description: ${info.event.extendedProps.description}`
          );
        },
      });

      calendar.render();
    }
  }, 100);
}

