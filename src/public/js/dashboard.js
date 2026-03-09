const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let currentShiftId = null;

const coverageLabels = {
  covered:   '✅ Covered',
  partial:   '⚠️ Partial',
  uncovered: '❌ Uncovered'
};

// Display username
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  document.getElementById('usernameDisplay').textContent = `👤 ${payload.username}`;
} catch (e) {}

// ─── UTILS ──────────────────────────────────────────────────────────────────

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

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'assignModal') currentShiftId = null;
}

// ─── ALERTS ─────────────────────────────────────────────────────────────────

async function loadAlerts() {
  try {
    const res  = await fetch('/api/shifts/alerts', { headers });
    const data = await res.json();
    const banner = document.getElementById('alertBanner');

    if (!data.length) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'block';
    document.getElementById('alertList').innerHTML = data.map(a => `
      <div class="alert-item">
        <span class="area">📍 ${a.operational_area} — ${a.start_time} to ${a.end_time}</span>
        <span class="unfilled">${a.unfilled_positions} position(s) unfilled</span>
      </div>
    `).join('');
  } catch (e) {}
}

// ─── SUMMARY ────────────────────────────────────────────────────────────────

async function loadSummary() {
  try {
    const res  = await fetch('/api/shifts/summary', { headers });
    const data = await res.json();
    const grid = document.getElementById('summaryGrid');

    if (!data.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px 0;">
          <p style="color:#bbb; font-size:15px; margin-bottom:12px;">No shifts scheduled for today.</p>
          <button class="submit-btn" style="width:auto; padding:9px 24px;"
            onclick="openNewShiftModal()">+ Create First Shift</button>
        </div>`;
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
            ? shift.employees.map(e =>
                `<div class="emp">👷 ${e.name} — ${e.position}</div>`
              ).join('')
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

// ─── ASSIGN EMPLOYEE ─────────────────────────────────────────────────────────

async function openAssignModal(shiftId, area, time) {
  currentShiftId = shiftId;
  document.getElementById('modalShiftInfo').textContent = `${area} — ${time}`;
  document.getElementById('availableList').innerHTML =
    '<p style="color:#bbb; font-size:13px; padding:12px 0;">Loading...</p>';
  document.getElementById('assignModal').classList.add('active');

  try {
    const res  = await fetch(`/api/shifts/${shiftId}/available-employees`, { headers });
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
      method: 'POST', headers,
      body: JSON.stringify({ employeeId })
    });

    if (res.ok) {
      closeModal('assignModal');
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

// ─── NEW SHIFT ───────────────────────────────────────────────────────────────

function openNewShiftModal() {
  document.getElementById('newShiftForm').reset();
  document.getElementById('shiftError').textContent = '';
  // Default date to today
  document.getElementById('shiftDate').value =
    new Date().toISOString().split('T')[0];
  document.getElementById('newShiftModal').classList.add('active');
}

async function submitNewShift(event) {
  event.preventDefault();
  document.getElementById('shiftError').textContent = '';

  const date             = document.getElementById('shiftDate').value;
  const start_time       = document.getElementById('shiftStart').value;
  const end_time         = document.getElementById('shiftEnd').value;
  const operational_area = document.getElementById('shiftArea').value;

  if (start_time >= end_time) {
    document.getElementById('shiftError').textContent =
      'End time must be after start time.';
    return;
  }

  try {
    const res = await fetch('/api/shifts', {
      method: 'POST', headers,
      body: JSON.stringify({ date, start_time, end_time, operational_area })
    });

    if (res.ok) {
      closeModal('newShiftModal');
      showToast('Shift created successfully!');
      loadSummary();
      loadAlerts();
    } else {
      const err = await res.json();
      document.getElementById('shiftError').textContent =
        err.error || 'Error creating shift.';
    }
  } catch (e) {
    document.getElementById('shiftError').textContent = 'Server error.';
  }
}

// ─── NEW EMPLOYEE ─────────────────────────────────────────────────────────────

async function openNewEmployeeModal() {
  document.getElementById('newEmployeeForm').reset();
  document.getElementById('employeeError').textContent = '';
  document.getElementById('newEmployeeModal').classList.add('active');

  const container = document.getElementById('skillCheckboxes');
  container.innerHTML = '<span style="color:#bbb; font-size:13px;">Loading skills...</span>';

  try {
    const res  = await fetch('/api/employees', { headers });
    const data = await res.json();

    // Extract unique skills from existing employees
    const skillMap = {};
    data.forEach(emp => {
      if (emp.Skills) emp.Skills.forEach(s => skillMap[s.id] = s.name);
    });

    // Fallback: use predefined list if no employees yet
    const skills = Object.keys(skillMap).length
      ? Object.entries(skillMap).map(([id, name]) => ({ id, name }))
      : [
          { id: 1, name: 'Forklift Operator' },
          { id: 2, name: 'Safety Certified' },
          { id: 3, name: 'Receiving' },
          { id: 4, name: 'Shipping' },
          { id: 5, name: 'Inventory Control' },
          { id: 6, name: 'Quality Control' },
        ];

    container.innerHTML = skills.map(s => `
      <label class="skill-checkbox">
        <input type="checkbox" name="skill" value="${s.id}" />
        ${s.name}
      </label>
    `).join('');
  } catch (e) {
    container.innerHTML = '<span style="color:#C62828; font-size:13px;">Error loading skills.</span>';
  }
}

async function submitNewEmployee(event) {
  event.preventDefault();
  document.getElementById('employeeError').textContent = '';

  const name     = document.getElementById('empName').value.trim();
  const position = document.getElementById('empPosition').value.trim();
  const checked  = document.querySelectorAll('input[name="skill"]:checked');
  const skillIds = Array.from(checked).map(cb => parseInt(cb.value));

  if (!skillIds.length) {
    document.getElementById('employeeError').textContent =
      'Please select at least one skill.';
    return;
  }

  try {
    const res = await fetch('/api/employees', {
      method: 'POST', headers,
      body: JSON.stringify({ name, position, skillIds })
    });

    if (res.ok) {
      closeModal('newEmployeeModal');
      showToast('Employee registered successfully!');
    } else {
      const err = await res.json();
      document.getElementById('employeeError').textContent =
        err.error || 'Error registering employee.';
    }
  } catch (e) {
    document.getElementById('employeeError').textContent = 'Server error.';
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────

loadAlerts();
loadSummary();