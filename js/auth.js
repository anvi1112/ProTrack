// ===== REGISTER FUNCTION =====
function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();

  // Basic validation
  if (!name || !email || !password || !confirm) {
    showMessage('registerMsg', 'Please fill in all fields!', 'error');
    return;
  }

  if (password !== confirm) {
    showMessage('registerMsg', 'Passwords do not match!', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('registerMsg', 'Password must be at least 6 characters!', 'error');
    return;
  }

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const exists = users.find(u => u.email === email);

  if (exists) {
    showMessage('registerMsg', 'This email is already registered!', 'error');
    return;
  }

  // Save new user
  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));

  showMessage('registerMsg', 'Account created successfully! Redirecting...', 'success');

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
}

// ===== LOGIN FUNCTION =====
function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showMessage('loginMsg', 'Please fill in all fields!', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showMessage('loginMsg', 'Invalid email or password!', 'error');
    return;
  }

  // Save logged in user session
  localStorage.setItem('loggedInUser', JSON.stringify(user));

  showMessage('loginMsg', 'Login successful! Redirecting...', 'success');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
}

// ===== LOGOUT FUNCTION =====
function logoutUser() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}

// ===== SHOW MESSAGE HELPER =====
function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.color = type === 'error' ? '#c0392b' : '#5C7A4E';
  el.style.fontSize = '0.85rem';
  el.style.marginTop = '12px';
  el.style.textAlign = 'center';
}

// ===== PROTECT PAGES =====
// Call this on dashboard, habits, goals, progress pages
function checkLogin() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    // Don't redirect — just show nudge notification
    setTimeout(() => {
      const existing = document.getElementById('loginNudge');
      if (existing) return;

      const toast = document.createElement('div');
      toast.id = 'loginNudge';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: #5C7A4E;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 0.9rem;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 280px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      toast.innerHTML = `
        <p>🔔 Login for a better experience and to save your data!</p>
        <a href="login.html" style="background:white; color:#5C7A4E; padding:8px 16px; border-radius:20px; text-decoration:none; font-weight:600; text-align:center; font-size:0.85rem;">Login Now →</a>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 6000);
    }, 1000);
  }
  return user;
}

// ===== GET LOGGED IN USER =====
function getUser() {
  return JSON.parse(localStorage.getItem('loggedInUser'));
}