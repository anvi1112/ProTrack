import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from './firebase-config.js';

// Get logged in user
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userEmail = loggedInUser ? loggedInUser.email : null;

let habits = [];
let habitDocIds = [];

// ===== DAILY RESET CHECK =====
async function checkNewDay() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('lastVisitDate');
  if (lastVisit !== today) {
    // Reset all habits done status
    for (let i = 0; i < habits.length; i++) {
      if (habits[i].done) {
        await updateDoc(doc(db, 'habits', habitDocIds[i]), { done: false });
      }
    }
    localStorage.setItem('lastVisitDate', today);
    await loadHabits();
  }
}

// ===== LOAD HABITS FROM FIREBASE =====
async function loadHabits() {
  if (!userEmail) return;
  habits = [];
  habitDocIds = [];

  const q = query(collection(db, 'habits'), where('userEmail', '==', userEmail));
  const snapshot = await getDocs(q);

  snapshot.forEach(d => {
    habits.push(d.data());
    habitDocIds.push(d.id);
  });

  renderHabits();
}

// ===== RENDER HABITS =====
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

// ===== ADD HABIT =====
window.addHabit = async function() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name || !userEmail) return;

  await addDoc(collection(db, 'habits'), {
    name,
    done: false,
    userEmail
  });

  input.value = '';
  input.focus();
  await loadHabits();
}

// ===== TOGGLE HABIT =====
window.toggleHabit = async function(index) {
  const docId = habitDocIds[index];
  const newDone = !habits[index].done;
  await updateDoc(doc(db, 'habits', docId), { done: newDone });
  await loadHabits();
}

// ===== DELETE HABIT =====
window.deleteHabit = async function(index) {
  const docId = habitDocIds[index];
  await deleteDoc(doc(db, 'habits', docId));
  await loadHabits();
}

// ===== REMINDER BANNER =====
function updateReminder() {
  const banner = document.getElementById('reminderBanner');
  if (!banner) return;

  if (habits.length === 0) {
    banner.innerHTML = `<span>🔔</span><p>You haven't added any habits yet! Add your first habit above 🌱</p>`;
    banner.style.display = 'flex';
  } else {
    const allDone = habits.every(h => h.done);
    const noneChecked = habits.every(h => !h.done);

    if (allDone) {
      banner.innerHTML = `<span>🎉</span><p>Amazing! You've completed all your habits for today! 🔥</p>`;
      banner.style.display = 'flex';
    } else if (noneChecked) {
      banner.innerHTML = `<span>🔔</span><p>You haven't checked off any habits today! 🌱</p>`;
      banner.style.display = 'flex';
    } else {
      banner.innerHTML = `<span>💪</span><p>Keep going! You're making progress 🌿</p>`;
      banner.style.display = 'flex';
    }
  }
}

// ===== ENTER KEY =====
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('habitInput');
  if (input) {
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') window.addHabit();
    });
  }
});

// ===== INIT =====
loadHabits().then(() => checkNewDay());