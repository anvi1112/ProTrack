import { db, collection, getDocs, query, where } from './firebase-config.js';

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userEmail = loggedInUser ? loggedInUser.email : null;

async function loadProgress() {
  if (!userEmail) return;

  // ===== LOAD ALL DATA FROM FIREBASE =====
  const habitsSnap = await getDocs(query(collection(db, 'habits'), where('userEmail', '==', userEmail)));
  const habits = [];
  habitsSnap.forEach(d => habits.push(d.data()));

  const goalsSnap = await getDocs(query(collection(db, 'goals'), where('userEmail', '==', userEmail)));
  const goals = [];
  goalsSnap.forEach(d => goals.push(d.data()));

  const todosSnap = await getDocs(query(collection(db, 'todos'), where('userEmail', '==', userEmail)));
  const todos = [];
  todosSnap.forEach(d => todos.push(d.data()));

  // ===== CALCULATIONS =====
  const totalHabits = habits.length;
  const doneHabits = habits.filter(h => h.done).length;
  const habitScore = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

  const totalGoals = goals.length;
  const avgGoalProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;

  const totalTodos = todos.length;
  const doneTodos = todos.filter(t => t.done).length;
  const todoScore = totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0;

  // Overall = average of habits + goals + todos
  const overallScore = Math.round((habitScore + avgGoalProgress + todoScore) / 3);

  // ===== UPDATE SUMMARY CARDS =====
  document.getElementById('totalHabits').textContent = totalHabits;
  document.getElementById('doneHabits').textContent = doneHabits;
  document.getElementById('totalGoals').textContent = totalGoals;
  document.getElementById('avgProgress').textContent = avgGoalProgress + '%';
  document.getElementById('totalTodos').textContent = totalTodos;
  document.getElementById('doneTodos').textContent = doneTodos;

  // ===== HABITS DOUGHNUT CHART =====
  const habitsCtx = document.getElementById('habitsChart').getContext('2d');
  new Chart(habitsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [doneHabits, Math.max(0, totalHabits - doneHabits)],
        backgroundColor: ['#87A878', '#e0ddd6'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      cutout: '70%'
    }
  });

  // ===== GOALS BAR CHART =====
  const goalsCtx = document.getElementById('goalsChart').getContext('2d');
  new Chart(goalsCtx, {
    type: 'bar',
    data: {
      labels: goals.length > 0 ? goals.map(g => g.name.substring(0, 15)) : ['No goals yet'],
      datasets: [{
        label: 'Progress %',
        data: goals.length > 0 ? goals.map(g => g.progress) : [0],
        backgroundColor: '#87A878',
        borderRadius: 8
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: val => val + '%' } }
      },
      plugins: { legend: { display: false } }
    }
  });

  // ===== WEEKLY SCORE LINE CHART =====
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let weeklyScores = JSON.parse(localStorage.getItem('weeklyScores')) || {};
  weeklyScores[today.toDateString()] = overallScore;
  localStorage.setItem('weeklyScores', JSON.stringify(weeklyScores));

  const chartLabels = [];
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    chartLabels.push(dayNames[d.getDay()]);
    chartData.push(weeklyScores[d.toDateString()] || 0);
  }

  const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
  new Chart(weeklyCtx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Overall Score %',
        data: chartData,
        borderColor: '#87A878',
        backgroundColor: 'rgba(135, 168, 120, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#5C7A4E',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: val => val + '%' } }
      },
      plugins: { legend: { display: false } }
    }
  });

  // ===== TODOS DOUGHNUT CHART =====
  const todosCtx = document.getElementById('todosChart').getContext('2d');
  new Chart(todosCtx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [doneTodos, Math.max(0, totalTodos - doneTodos)],
        backgroundColor: ['#5C7A4E', '#e0ddd6'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      cutout: '70%'
    }
  });

  // ===== OVERALL BREAKDOWN BAR CHART =====
  const overallCtx = document.getElementById('overallChart').getContext('2d');
  new Chart(overallCtx, {
    type: 'bar',
    data: {
      labels: ['Habits Score', 'Goals Progress', 'Tasks Score', 'Overall Score'],
      datasets: [{
        data: [habitScore, avgGoalProgress, todoScore, overallScore],
        backgroundColor: ['#87A878', '#5C7A4E', '#C9A84C', '#3D5C35'],
        borderRadius: 8
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: val => val + '%' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

loadProgress();