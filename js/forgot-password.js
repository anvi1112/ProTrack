let verifiedEmail = '';

function verifyEmail() {
  const email = document.getElementById('resetEmail').value.trim();

  if (!email) {
    showMessage('resetMsg1', 'Please enter your email!', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email);

  if (!user) {
    showMessage('resetMsg1', 'No account found with this email!', 'error');
    return;
  }

  verifiedEmail = email;
  showMessage('resetMsg1', 'Email verified! Set your new password below.', 'success');

  setTimeout(() => {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
  }, 1000);
}

function resetPassword() {
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmNewPassword').value.trim();

  if (!newPassword || !confirmPassword) {
    showMessage('resetMsg2', 'Please fill in both fields!', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage('resetMsg2', 'Passwords do not match!', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showMessage('resetMsg2', 'Password must be at least 6 characters!', 'error');
    return;
  }

  // Update password in users array
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users = users.map(u => {
    if (u.email === verifiedEmail) {
      u.password = newPassword;
    }
    return u;
  });

  localStorage.setItem('users', JSON.stringify(users));

  showMessage('resetMsg2', 'Password reset successful! Redirecting to login...', 'success');

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
}