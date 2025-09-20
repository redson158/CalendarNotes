const calendarDays = document.getElementById('calendar-days');
const monthYear = document.getElementById('month-year');
const workspace = document.getElementById('workspace');
const resetButton = document.getElementById('reset-button');
const trashBin = document.getElementById('trash-bin');

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

let noteCounter = 1;

function isCalendarFull(){
  const dayCells = document.querySelectorAll('.calendar-day');
  for (const dayCell of dayCells) {
    const notesContainer = dayCell.querySelector('.notes-container');
    if (notesContainer && notesContainer.children.length < 3) {
      return false; // found a day with less than 3 notes
    }
  }
  return true; // all days have 3 notes
}

function createNoteElement(color) {
  const note = document.createElement('div');
  note.classList.add('note', color);
  note.id = `note-${noteCounter++}`;
  if (color === 'blue') {
    note.textContent = 'Birthday 🎂';
  } else if (color === 'yellow') {
    note.textContent = 'Appt 🩺';
  } else if (color === 'pink') {
    note.textContent = 'Event ⭐';
  }
  makeDraggable(note);
  return note;
}

// Make any note draggable and mark whether it's coming from workspace at drag time
function makeDraggable(note) {
  note.setAttribute('draggable', 'true');

  note.addEventListener('dragstart', (e) => {
    // write id and whether the element is currently inside the workspace
    e.dataTransfer.setData('text/plain', note.id);
    const fromWorkspace = !!note.closest('#workspace'); // true if parent is workspace
    e.dataTransfer.setData('from-workspace', fromWorkspace ? 'true' : 'false');
  });
}

function updateWorkspaceState() {
  const full = isCalendarFull();
  const workspaceNotes = workspace.querySelectorAll('.note');
  workspaceNotes.forEach(note => {
    if (full) {
      note.classList.add('disabled');
      note.setAttribute('draggable', 'false');
      note.style.cursor = 'not-allowed';
    } else {
      note.classList.remove('disabled');
      note.setAttribute('draggable', 'true');
      note.style.cursor = "pointer";
    }
  });
}


function colorFromElement(note) {
  if (!note) return '';
  if (note.classList.contains('blue')) return 'blue';
  if (note.classList.contains('yellow')) return 'yellow';
  if (note.classList.contains('pink')) return 'pink';
  return '';
}

// Renders the calendar days (and attaches drop handlers)
function renderCalendar(year, month) {
  calendarDays.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthYear.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // blanks before 1st
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day empty';
    calendarDays.appendChild(blank);
  }

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.setAttribute('data-day', d);

    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = d;
    dayCell.appendChild(dayNumber);

    const notesContainer = document.createElement('div');
    notesContainer.className = 'notes-container';
    dayCell.appendChild(notesContainer);

    // dragover: only allow drop if < 3 notes
    dayCell.addEventListener('dragover', (e) => {
      if (notesContainer.children.length < 3) {
        e.preventDefault(); // allow drop
        dayCell.style.cursor = 'pointer';
      } else {
        dayCell.style.cursor = 'not-allowed';
      }
    });

    dayCell.addEventListener('dragleave', () => {
      dayCell.style.cursor = '';
    });

    dayCell.addEventListener('drop', (e) => {
      e.preventDefault();
      const noteId = e.dataTransfer.getData('text/plain');
      const fromWorkspace = e.dataTransfer.getData('from-workspace') === 'true';
      const note = document.getElementById(noteId);

      if (!note) return;
      if (notesContainer.children.length >= 3) return;

      // move the dragged note into the day
      notesContainer.appendChild(note);

      // if it came from the workspace, replenish workspace with a new note of same color
      if (fromWorkspace) {
        const color = colorFromElement(note);
        if (color) {
          const newNote = createNoteElement(color);

          // Keep order blue, yellow, pink in workspace:
          if (color === 'blue') {
            const beforeNode = workspace.querySelector('.note.yellow') || workspace.querySelector('.note.pink');
            if (beforeNode) workspace.insertBefore(newNote, beforeNode);
            else workspace.appendChild(newNote);
          } else if (color === 'yellow') {
              const beforeNode = workspace.querySelector('.note.pink');
              if (beforeNode) workspace.insertBefore(newNote, beforeNode);
              else workspace.appendChild(newNote);
          } else if (color === 'pink') {
              workspace.appendChild(newNote);
          }
        }
        const full = isCalendarFull();
        if (full) {
          alert("Calendar is full! Remove notes or reset to add more.");
        }
        updateWorkspaceState();
      }
    });

    calendarDays.appendChild(dayCell);
      
  }
}

// Initialize calendar
renderCalendar(year, month);

// Build the initial workspace with three color notes
function buildInitialWorkspace() {
  workspace.innerHTML = '';
  noteCounter = 1;
  const colors = ['blue', 'yellow', 'pink'];
  colors.forEach(color => {
    workspace.appendChild(createNoteElement(color));
  });
}


// reset button behavior — clear calendar notes and rebuild workspace
resetButton.addEventListener('click', () => {
  document.querySelectorAll('.notes-container').forEach(c => c.innerHTML = '');
  buildInitialWorkspace();
  updateWorkspaceState();
});

// Trash bin behavior — remove note from DOM when dropped
trashBin.addEventListener('dragover', (e) => {
  e.preventDefault();
})

trashBin.addEventListener("drop", (e) => {
  e.preventDefault();
  const noteId = e.dataTransfer.getData('text/plain');
  const note = document.getElementById(noteId);
  const fromWorkspace = e.dataTransfer.getData('from-workspace') === 'true';
  // only delete if from calendar, not workspace
  if (fromWorkspace) return;
  if (!note) return;
  note.remove();
  updateWorkspaceState();
})

// initial workspace setup
buildInitialWorkspace();


