let goals = JSON.parse(localStorage.getItem('goals')) || [];

function saveGoals() {
  localStorage.setItem('goals', JSON.stringify(goals));
}

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
        <div class="goal-fill" id="fill-${index}" style="width:${goal.progress}%"></div>
      </div>
    `;
    list.appendChild(div);
  });
}

function addGoal() {
  const nameInput = document.getElementById('goalInput');
  const progressInput = document.getElementById('goalProgress');

  const name = nameInput.value.trim();
  let progress = parseInt(progressInput.value);

  if (!name) return;
  if (isNaN(progress) || progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  goals.push({ name, progress });
  saveGoals();
  renderGoals();

  nameInput.value = '';
  progressInput.value = '';
}

function updateProgress(index, value) {
  let progress = parseInt(value);
  if (isNaN(progress) || progress < 0) progress = 0;
  if (progress > 100) progress = 100;
  goals[index].progress = progress;
  saveGoals();
  renderGoals();
}

function deleteGoal(index) {
  goals.splice(index, 1);
  saveGoals();
  renderGoals();
}

renderGoals();