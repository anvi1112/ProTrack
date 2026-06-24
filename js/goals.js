import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from './firebase-config.js';

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userEmail = loggedInUser ? loggedInUser.email : null;

let goals = [];
let goalDocIds = [];

// ===== LOAD GOALS =====
async function loadGoals() {
  if (!userEmail) return;
  goals = [];
  goalDocIds = [];

  const q = query(collection(db, 'goals'), where('userEmail', '==', userEmail));
  const snapshot = await getDocs(q);

  snapshot.forEach(d => {
    goals.push(d.data());
    goalDocIds.push(d.id);
  });

  renderGoals();
}

// ===== RENDER GOALS =====
function renderGoals() {
  const list = document.getElementById('goalList');
  const emptyMsg = document.getElementById('goalEmptyMsg');
  const countEl = document.getElementById('goal-count');

  list.innerHTML = '';

  if (goals.length === 0) {
    emptyMsg.style.display = 'block';
    countEl.textContent = '0 goals';
    return;
  }

  emptyMsg.style.display = 'none';
  countEl.textContent = `${goals.length} goal${goals.length > 1 ? 's' : ''}`;

  goals.forEach((goal, index) => {
    const div = document.createElement('div');
    div.className = 'goal-item-full';
    div.innerHTML = `
      <div class="goal-info">
        <p>${goal.name}</p>
        <div style="display:flex; align-items:center; gap:12px;">
          <input
            type="number"
            value="${goal.progress}"
            min="0" max="100"
            onchange="updateProgress(${index}, this.value)"
            class="progress-input"
          />
          <span class="goal-percent">${goal.progress}%</span>
          <span class="habit-delete" onclick="deleteGoal(${index})">🗑</span>
        </div>
      </div>
      <div class="goal-bar" style="margin-top:10px;">
        <div class="goal-fill" style="width:${goal.progress}%"></div>
      </div>
    `;
    list.appendChild(div);
  });
}

// ===== ADD GOAL =====
window.addGoal = async function() {
  const nameInput = document.getElementById('goalInput');
  const progressInput = document.getElementById('goalProgress');

  const name = nameInput.value.trim();
  let progress = parseInt(progressInput.value);

  if (!name || !userEmail) return;
  if (isNaN(progress) || progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  await addDoc(collection(db, 'goals'), { name, progress, userEmail });

  nameInput.value = '';
  progressInput.value = '';
  await loadGoals();
}

// ===== UPDATE PROGRESS =====
window.updateProgress = async function(index, value) {
  let progress = parseInt(value);
  if (isNaN(progress) || progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  await updateDoc(doc(db, 'goals', goalDocIds[index]), { progress });
  await loadGoals();
}

// ===== DELETE GOAL =====
window.deleteGoal = async function(index) {
  await deleteDoc(doc(db, 'goals', goalDocIds[index]));
  await loadGoals();
}

// ===== INIT =====
loadGoals();