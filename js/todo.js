import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from './firebase-config.js';

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userEmail = loggedInUser ? loggedInUser.email : null;

let todos = [];
let todoDocIds = [];

// ===== DAILY RESET =====
async function checkNewDay() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('lastTodoDate');
  if (lastVisit !== today) {
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].done) {
        await deleteDoc(doc(db, 'todos', todoDocIds[i]));
      }
    }
    localStorage.setItem('lastTodoDate', today);
    await loadTodos();
  }
}

// ===== LOAD TODOS =====
async function loadTodos() {
  if (!userEmail) return;
  todos = [];
  todoDocIds = [];

  const q = query(collection(db, 'todos'), where('userEmail', '==', userEmail));
  const snapshot = await getDocs(q);

  snapshot.forEach(d => {
    todos.push(d.data());
    todoDocIds.push(d.id);
  });

  renderTodos();
}

// ===== RENDER TODOS =====
function renderTodos() {
  const list = document.getElementById('todoList');
  const emptyMsg = document.getElementById('todoEmptyMsg');
  const countEl = document.getElementById('todo-count');

  list.innerHTML = '';

  if (todos.length === 0) {
    emptyMsg.style.display = 'block';
    countEl.textContent = '0 of 0 done';
    updateTodoBanner();
    return;
  }

  emptyMsg.style.display = 'none';
  let doneCount = 0;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...todos].map((t, i) => ({ ...t, _index: i }))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  sorted.forEach(todo => {
    if (todo.done) doneCount++;
    const index = todo._index;
    const priorityEmoji = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢';

    const li = document.createElement('li');
    li.className = 'habit-item' + (todo.done ? ' done' : '');
    li.innerHTML = `
      <span class="habit-check ${todo.done ? '' : 'empty'}"
        onclick="toggleTodo(${index})">
        ${todo.done ? '✓' : '○'}
      </span>
      <span class="todo-priority">${priorityEmoji}</span>
      <span>${todo.name}</span>
      <span class="habit-delete" onclick="deleteTodo(${index})">🗑</span>
    `;
    list.appendChild(li);
  });

  countEl.textContent = `${doneCount} of ${todos.length} done`;
  updateTodoBanner();
}

// ===== ADD TODO =====
window.addTodo = async function() {
  const input = document.getElementById('todoInput');
  const priority = document.getElementById('todoPriority').value;
  const name = input.value.trim();
  if (!name || !userEmail) return;

  await addDoc(collection(db, 'todos'), { name, priority, done: false, userEmail });

  input.value = '';
  input.focus();
  showToast('Task added! 🌱');
  await loadTodos();
}

// ===== TOGGLE TODO =====
window.toggleTodo = async function(index) {
  const newDone = !todos[index].done;
  await updateDoc(doc(db, 'todos', todoDocIds[index]), { done: newDone });
  if (newDone) showToast('Task completed! 🎉');
  await loadTodos();
}

// ===== DELETE TODO =====
window.deleteTodo = async function(index) {
  await deleteDoc(doc(db, 'todos', todoDocIds[index]));
  await loadTodos();
}

// ===== BANNER =====
function updateTodoBanner() {
  const banner = document.getElementById('todoBanner');
  if (!banner) return;

  if (todos.length === 0) {
    banner.innerHTML = `<span>🔔</span><p>No tasks yet! Add your first task above 🌱</p>`;
    banner.style.display = 'flex';
  } else if (todos.every(t => t.done)) {
    banner.innerHTML = `<span>🎉</span><p>All tasks done! You're crushing it! 🔥</p>`;
    banner.style.display = 'flex';
  } else {
    const remaining = todos.filter(t => !t.done).length;
    banner.innerHTML = `<span>💪</span><p>${remaining} task${remaining > 1 ? 's' : ''} remaining 🌿</p>`;
    banner.style.display = 'flex';
  }
}

// ===== TOAST =====
function showToast(message) {
  const existing = document.getElementById('toastMsg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toastMsg';
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('toast-show'), 100);
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== ENTER KEY =====
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('todoInput');
  if (input) {
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') window.addTodo();
    });
  }
});

// ===== INIT =====
loadTodos().then(() => checkNewDay());