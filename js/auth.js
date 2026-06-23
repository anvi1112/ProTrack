import { db, collection, addDoc, getDocs, query, where } from './firebase-config.js';

// ===== REGISTER =====
async function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();

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

  try {
    // Check if email already exists
    const q = query(collection(db, 'users'), where('email', '==', email));
    const existing = await getDocs(q);

    if (!existing.empty) {
      showMessage('registerMsg', 'This email is already registered!', 'error');
      return;
    }

    // Save to Firebase
    await addDoc(collection(db, 'users'), {
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    });

    // Also save to localStorage for session
    localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));

    showMessage('registerMsg', 'Account created successfully! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

  } catch (error) {
    showMessage('registerMsg', 'Something went wrong! Try again.', 'error');
    console.error(error);
  }
}

// ===== LOGIN =====
async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showMessage('loginMsg', 'Please fill in all fields!', 'error');
    return;
  }

  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('password', '==', password)
    );
    const result = await getDocs(q);

    if (result.empty) {
      showMessage('loginMsg', 'Invalid email or password!', 'error');
      return;
    }

    const user = result.docs[0].data();
    localStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, email: user.email }));

    showMessage('loginMsg', 'Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

  } catch (error) {
    showMessage('loginMsg', 'Something went wrong! Try again.', 'error');
    console.error(error);
  }
}

// ===== LOGOUT =====
function logoutUser() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}

// ===== FORGOT PASSWORD =====
async function verifyEmailForReset(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const result = await getDocs(q);
  return !result.empty;
}

async function resetPasswordInDB(email, newPassword) {
  // Note: Firestore doesn't update like this directly
  // For simplicity we add a new doc with updated password
  const q = query(collection(db, 'users'), where('email', '==', email));
  const result = await getDocs(q);
  if (!result.empty) {
    const docRef = result.docs[0].ref;
    await docRef.update({ password: newPassword });
    return true;
  }
  return false;
}

// ===== SHOW MESSAGE =====
function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.color = type === 'error' ? '#c0392b' : '#5C7A4E';
  el.style.fontSize = '0.85rem';
  el.style.marginTop = '12px';
  el.style.textAlign = 'center';
}

// ===== CHECK LOGIN =====
function checkLogin() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
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
        <p>🔔 Login for a better experience!</p>
        <a href="login.html" style="background:white; color:#5C7A4E; padding:8px 16px; border-radius:20px; text-decoration:none; font-weight:600; text-align:center; font-size:0.85rem;">Login Now →</a>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 6000);
    }, 1000);
  }
  return user;
}

function getUser() {
  return JSON.parse(localStorage.getItem('loggedInUser'));
}

export { registerUser, loginUser, logoutUser, checkLogin, getUser, showMessage, verifyEmailForReset, resetPasswordInDB };