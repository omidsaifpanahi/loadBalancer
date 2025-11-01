// file_path: logic.js
let isLoggedIn = false;
let currentStrategy = '';

async function checkAuth() {
  try {
    const res = await fetch('/admin/status');
    const data = await res.json();
    isLoggedIn = data.isLoggedIn;

    document.getElementById('loading').style.display = 'none';

    if (isLoggedIn) {
      showDashboard();
      loadData();
      setInterval(loadData, 5000); // هر 5 ثانیه رفرش
    } else {
      showLogin();
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
}

async function login() {
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      isLoggedIn = true;
      showDashboard();
      loadData();
      setInterval(loadData, 5000);
    } else {
      errorDiv.textContent = 'رمز عبور اشتباه است';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'خطا در ورود';
    errorDiv.style.display = 'block';
  }
}

async function logout() {
  await fetch('/admin/logout', { method: 'POST' });
  isLoggedIn = false;
  showLogin();
}

async function loadData() {
  try {
    const res = await fetch('/admin/servers');
    const data = await res.json();

    currentStrategy = data.currentStrategy;

    // Update stats
    document.getElementById('stats-container').innerHTML = `
      <div class="stat-box">
      <div class="stat-label">سرورهای فعال</div>
  <div class="stat-value">${data.totalServers}</div>
</div>
  <div class="stat-box">
    <div class="stat-label">کل کاربران</div>
    <div class="stat-value">${data.totalPeers}</div>
  </div>
  <div class="stat-box">
    <div class="stat-label">کل اتاق‌ها</div>
    <div class="stat-value">${data.totalRooms}</div>
  </div>
  <div class="stat-box">
    <div class="stat-label">درخواست‌ها</div>
    <div class="stat-value">${Object.values(data.stats).reduce((a,b) => a+b, 0)}</div>
  </div>
      `;

    // Update current strategy
    document.getElementById('current-strategy').textContent = translateStrategy(currentStrategy);
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.strategy === currentStrategy);
    });

    // Update server list
    const serverList = document.getElementById('server-list');
    if (data.servers.length === 0) {
      serverList.innerHTML = '<p style="text-align:center;color:#999;">هیچ سروری فعال نیست</p>';
    } else {
      serverList.innerHTML = data.servers.map(server => `
  <div class="server-item">
      <div class="server-info">
      <div class="server-name">🖥️ ${server.id}</div>
  <div class="server-details">
    ${server.url} |
    کاربران: ${server.totalPeers} |
    اتاق‌ها: ${server.roomCount} |
    آخرین سیگنال: ${Math.floor(server.timeSinceHeartbeat / 1000)}s ago
  </div>
</div>
  <div class="server-status status-online">آنلاین</div>
</div>
  `).join('');
    }
  } catch (err) {
    console.error('Load data failed:', err);
  }
}

async function setStrategy(strategy) {
  try {
    const res = await fetch('/admin/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy })
    });

    if (res.ok) {
      showAlert('استراتژی با موفقیت تغییر کرد', 'success');
      loadData();
    } else {
      showAlert('خطا در تغییر استراتژی', 'error');
    }
  } catch (err) {
    showAlert('خطا در تغییر استراتژی', 'error');
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alert-box');
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  setTimeout(() => alertBox.style.display = 'none', 3000);
}

function translateStrategy(strategy) {
  const translations = {
    'leastPeers': 'کمترین کاربر',
    'leastRooms': 'کمترین اتاق',
    'roundRobin': 'نوبتی',
    'random': 'تصادفی',
    'fillToCapacity': 'پر کردن سرور تا ظرفیت'
  };
  return translations[strategy] || strategy;
}

// Start
checkAuth();

// Enter key for login
document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });
  }
});