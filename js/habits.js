// Load habits from localStorage
let habits = JSON.parse(localStorage.getItem('habits')) || [];

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// ===== DAILY RESET CHECK =====
function checkNewDay() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('lastVisitDate');

  if (lastVisit !== today) {
    habits.forEach(habit => habit.done = false);
    saveHabits();
    localStorage.setItem('lastVisitDate', today);
  }
}

checkNewDay();

function renderHabits() {
  const list = document.getElementById('habitList');
  const emptyMsg = document.getElementById('emptyMsg');
  const countEl = document.getElementById('habit-count');

  list.innerHTML = '';

  if (habits.length === 0) {
    emptyMsg.style.display = 'block';
    countEl.textContent = '0 of 0 done';
    updateReminder();
    return;
  }

  emptyMsg.style.display = 'none';

  let doneCount = 0;

  habits.forEach((habit, index) => {
    if (habit.done) doneCount++;

    const li = document.createElement('li');
    li.className = 'habit-item' + (habit.done ? ' done' : '');
    li.innerHTML = `
      <span class="habit-check ${habit.done ? '' : 'empty'}" 
        onclick="toggleHabit(${index})">
        ${habit.done ? '✓' : '○'}
      </span>
      <span>${habit.name}</span>
      <span class="habit-delete" onclick="deleteHabit(${index})">🗑</span>
    `;
    list.appendChild(li);
  });

  countEl.textContent = `${doneCount} of ${habits.length} done`;
  updateReminder();
}

function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;

  habits.push({ name: name, done: false });
  saveHabits();
  renderHabits();
  input.value = '';
  input.focus();
}

function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  saveHabits();
  renderHabits();
}

function deleteHabit(index) {
  habits.splice(index, 1);
  saveHabits();
  renderHabits();
}

// ===== REMINDER BANNER LOGIC =====
function updateReminder() {
  const banner = document.getElementById('reminderBanner');
  if (!banner) return;

  if (habits.length === 0) {
    banner.innerHTML = `<span>🔔</span><p>You haven't added any habits yet! Add your first habit above to start building consistency 🌱</p>`;
    banner.style.display = 'flex';
  } else {
    const allDone = habits.every(h => h.done);
    const noneChecked = habits.every(h => !h.done);

    if (allDone) {
      banner.innerHTML = `<span>🎉</span><p>Amazing! You've completed all your habits for today. Keep up the streak! 🔥</p>`;
      banner.style.display = 'flex';
    } else if (noneChecked) {
      banner.innerHTML = `<span>🔔</span><p>You haven't checked off any habits today! Mark them done as you complete them 🌱</p>`;
      banner.style.display = 'flex';
    } else {
      banner.innerHTML = `<span>💪</span><p>You're making progress! Keep checking off your habits as you go 🌿</p>`;
      banner.style.display = 'flex';
    }
  }
}

// Allow pressing Enter to add habit
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('habitInput');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addHabit();
      }
    });
  }
});

// Run on page load
renderHabits();