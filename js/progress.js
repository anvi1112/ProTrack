// Load data from localStorage
const habits = JSON.parse(localStorage.getItem('habits')) || [];
const goals = JSON.parse(localStorage.getItem('goals')) || [];

// Summary cards
const totalHabits = habits.length;
const doneHabits = habits.filter(h => h.done).length;
const totalGoals = goals.length;
const avgProgress = goals.length > 0
  ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
  : 0;

document.getElementById('totalHabits').textContent = totalHabits;
document.getElementById('doneHabits').textContent = doneHabits;
document.getElementById('totalGoals').textContent = totalGoals;
document.getElementById('avgProgress').textContent = avgProgress + '%';

// HABITS DOUGHNUT CHART
const habitsCtx = document.getElementById('habitsChart').getContext('2d');
new Chart(habitsCtx, {
  type: 'doughnut',
  data: {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [doneHabits, totalHabits - doneHabits],
      backgroundColor: ['#87A878', '#e0ddd6'],
      borderWidth: 0
    }]
  },
  options: {
    plugins: {
      legend: { position: 'bottom' }
    },
    cutout: '70%'
  }
});

// GOALS BAR CHART
const goalsCtx = document.getElementById('goalsChart').getContext('2d');
new Chart(goalsCtx, {
  type: 'bar',
  data: {
    labels: goals.length > 0 ? goals.map(g => g.name.substring(0, 20)) : ['No goals yet'],
    datasets: [{
      label: 'Progress %',
      data: goals.length > 0 ? goals.map(g => g.progress) : [0],
      backgroundColor: '#87A878',
      borderRadius: 8
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: val => val + '%' }
      }
    },
    plugins: { legend: { display: false } }
  }
});

// WEEKLY SCORE LINE CHART - Real tracking based on actual usage
const today = new Date();
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayIndex = today.getDay(); // 0 = Sunday, 6 = Saturday

// Get or initialize weekly score history
let weeklyScores = JSON.parse(localStorage.getItem('weeklyScores')) || {};

// Calculate today's score
const todayScore = totalHabits > 0
  ? Math.round((doneHabits / totalHabits) * 100)
  : avgProgress;

// Save today's score with today's date
const todayKey = today.toDateString();
weeklyScores[todayKey] = todayScore;
localStorage.setItem('weeklyScores', JSON.stringify(weeklyScores));

// Build last 7 days labels and data (oldest to newest)
const chartLabels = [];
const chartData = [];

for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(today.getDate() - i);
  const key = d.toDateString();
  chartLabels.push(dayNames[d.getDay()]);
  chartData.push(weeklyScores[key] !== undefined ? weeklyScores[key] : 0);
}

const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
new Chart(weeklyCtx, {
  type: 'line',
  data: {
    labels: chartLabels,
    datasets: [{
      label: 'Score %',
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
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: val => val + '%' }
      }
    },
    plugins: { legend: { display: false } }
  }
});