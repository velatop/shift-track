const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

let currentShiftId = null;

const coverageLabels = {
    covered: '✅ Covered',
    partial: '⚠️ Partial',
    uncovered: '❌ Uncovered'
};

// Display username from JWT
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('usernameDisplay').textContent = `👤 ${payload.username}`;
} catch (e) { }

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

function showToast(msg, color = '#2E7D32') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = color;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

async function loadAlerts() {
    try {
        const res = await fetch('/api/shifts/alerts', { headers });
        const data = await res.json();
        if (!data.length) return;

        document.getElementById('alertBanner').style.display = 'block';
        document.getElementById('alertList').innerHTML = data.map(a => `
      <div class="alert-item">
        <span class="area">📍 ${a.operational_area} — ${a.start_time} to ${a.end_time}</span>
        <span class="unfilled">${a.unfilled_positions} position(s) unfilled</span>
      </div>
    `).join('');
    } catch (e) { }
}

async function loadSummary() {
    try {
        const res = await fetch('/api/shifts/summary', { headers });
        const data = await res.json();
        const grid = document.getElementById('summaryGrid');

        if (!data.length) {
            grid.innerHTML = '<p class="loading-text">No shifts scheduled for today.</p>';
            return;
        }

        grid.innerHTML = data.map(shift => `
      <div class="shift-card ${shift.coverage_status}">
        <div class="card-header">
          <div>
            <div class="area">📍 ${shift.operational_area}</div>
            <div class="time">🕐 ${shift.start_time} – ${shift.end_time}</div>
          </div>
          <span class="badge ${shift.coverage_status}">
            ${coverageLabels[shift.coverage_status]}
          </span>
        </div>
        <div class="assigned-list">
          ${shift.employees && shift.employees.length
                ? shift.employees.map(e => `<div class="emp">👷 ${e.name} — ${e.position}</div>`).join('')
                : '<div class="no-emp">No employees assigned yet</div>'
            }
        </div>
        <button class="assign-btn"
          onclick="openAssignModal(${shift.id}, '${shift.operational_area}', '${shift.start_time}')">
          + Assign Employee
        </button>
      </div>
    `).join('');
    } catch (e) {
        document.getElementById('summaryGrid').innerHTML =
            '<p class="loading-text">Error loading shifts.</p>';
    }
}

async function openAssignModal(shiftId, area, time) {
    currentShiftId = shiftId;
    document.getElementById('modalShiftInfo').textContent = `${area} — ${time}`;
    document.getElementById('availableList').innerHTML =
        '<p style="color:#bbb; font-size:13px;">Loading...</p>';
    document.getElementById('assignModal').classList.add('active');

    try {
        const res = await fetch(`/api/shifts/${shiftId}/available-employees`, { headers });
        const data = await res.json();
        const list = document.getElementById('availableList');

        if (!data.length) {
            list.innerHTML = '<div class="empty-state">No available employees for this shift.</div>';
            return;
        }

        list.innerHTML = data.map(emp => `
      <div class="emp-option">
        <div>
          <div class="name">${emp.name}</div>
          <div class="pos">${emp.position}</div>
        </div>
        <button onclick="assignEmployee(${emp.id})">Assign</button>
      </div>
    `).join('');
    } catch (e) {
        document.getElementById('availableList').innerHTML =
            '<div class="empty-state">Error loading employees.</div>';
    }
}

async function assignEmployee(employeeId) {
    try {
        const res = await fetch(`/api/shifts/${currentShiftId}/assign`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ employeeId })
        });

        if (res.ok) {
            closeModal();
            showToast('Employee assigned successfully!');
            loadSummary();
            loadAlerts();
        } else {
            const err = await res.json();
            showToast(err.error || 'Assignment failed', '#C62828');
        }
    } catch (e) {
        showToast('Error assigning employee', '#C62828');
    }
}

function closeModal() {
    document.getElementById('assignModal').classList.remove('active');
    currentShiftId = null;
}

loadAlerts();
loadSummary();