// MedRecall - Medicine Inventory Management & Expiry Dashboard
// script.js

// Hardcoded demo credentials for login
const DEMO_EMAIL = 'admin@medrecall.com';
const DEMO_PASSWORD = 'MedRecall123';

// Storage keys
const STORAGE_KEY_AUTH = 'medrecall_logged_in';
const STORAGE_KEY_MEDICINES = 'medrecall_medicines';

// State variables
let medicines = [];
let editingMedicineId = null;

// DOM Elements - Login
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const passwordToggleIcon = document.getElementById('passwordToggleIcon');
const loginAlert = document.getElementById('loginAlert');
const loginAlertText = document.getElementById('loginAlertText');
const btnFillDemoCredentials = document.getElementById('btnFillDemoCredentials');
const btnLogout = document.getElementById('btnLogout');
const currentDateDisplay = document.getElementById('currentDateDisplay');

// DOM Elements - Metric Cards
const metricTotal = document.getElementById('metricTotal');
const metricExpired = document.getElementById('metricExpired');
const metricExpiringSoon = document.getElementById('metricExpiringSoon');
const metricSafe = document.getElementById('metricSafe');

// DOM Elements - Medicine Form
const medicineForm = document.getElementById('medicineForm');
const medicineIdInput = document.getElementById('medicineId');
const medicineNameInput = document.getElementById('medicineName');
const batchNumberInput = document.getElementById('batchNumber');
const medicineCategoryInput = document.getElementById('medicineCategory');
const medicineQuantityInput = document.getElementById('medicineQuantity');
const expiryDateInput = document.getElementById('expiryDate');
const medicineNotesInput = document.getElementById('medicineNotes');
const formHeaderTitle = document.getElementById('formHeaderTitle');
const formModeBadge = document.getElementById('formModeBadge');
const btnSubmitMedicine = document.getElementById('btnSubmitMedicine');
const btnSubmitText = document.getElementById('btnSubmitText');
const btnSubmitIcon = document.getElementById('btnSubmitIcon');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnClearForm = document.getElementById('btnClearForm');
const formAlert = document.getElementById('formAlert');
const formAlertText = document.getElementById('formAlertText');

// DOM Elements - Table & Filters
const medicineTableBody = document.getElementById('medicineTableBody');
const tableRecordCount = document.getElementById('tableRecordCount');
const filterSummaryText = document.getElementById('filterSummaryText');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateSubtitle = document.getElementById('emptyStateSubtitle');
const btnEmptyStateAction = document.getElementById('btnEmptyStateAction');

const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');

const btnLoadSampleData = document.getElementById('btnLoadSampleData');
const apiSpinner = document.getElementById('apiSpinner');
const apiIcon = document.getElementById('apiIcon');
const btnExportCSV = document.getElementById('btnExportCSV');
const btnClearAll = document.getElementById('btnClearAll');

// Bootstrap Toast
const toastElement = document.getElementById('liveToast');
const toastMessage = document.getElementById('toastMessage');
let toastInstance = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (toastElement && window.bootstrap) {
    toastInstance = new bootstrap.Toast(toastElement, { delay: 3000 });
  }

  // Display today's date in navbar
  if (currentDateDisplay) {
    const today = new Date();
    currentDateDisplay.textContent = today.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Register events
  setupEvents();

  // Check login status
  checkLogin();
});

// Check if user is logged in
function checkLogin() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';

  if (isLoggedIn) {
    loginView.classList.add('d-none');
    dashboardView.classList.remove('d-none');
    medicines = loadMedicines();
    updateDashboard();
    renderTable();
  } else {
    loginView.classList.remove('d-none');
    dashboardView.classList.add('d-none');
  }
}

// Handle login submission
function handleLogin(e) {
  e.preventDefault();

  const email = loginEmailInput.value.trim().toLowerCase();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    loginAlertText.textContent = 'Please enter your email and password.';
    loginAlert.classList.remove('d-none');
    return;
  }

  if (email === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
    loginAlert.classList.add('d-none');
    localStorage.setItem(STORAGE_KEY_AUTH, 'true');

    loginView.classList.add('d-none');
    dashboardView.classList.remove('d-none');
    loginForm.reset();

    medicines = loadMedicines();
    updateDashboard();
    renderTable();

    showNotification('Logged in successfully', 'success');
  } else {
    loginAlertText.textContent = 'Invalid credentials. Please use demo credentials.';
    loginAlert.classList.remove('d-none');
  }
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem(STORAGE_KEY_AUTH);
  cancelEdit();
  dashboardView.classList.add('d-none');
  loginView.classList.remove('d-none');
  loginEmailInput.focus();
  showNotification('Logged out', 'info');
}

// Toggle password visibility
function togglePassword() {
  const isPass = loginPasswordInput.type === 'password';
  loginPasswordInput.type = isPass ? 'text' : 'password';
  passwordToggleIcon.className = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
}

// Auto-fill demo credentials
function fillDemoCredentials() {
  loginEmailInput.value = DEMO_EMAIL;
  loginPasswordInput.value = DEMO_PASSWORD;
  loginAlert.classList.add('d-none');
  showNotification('Demo credentials filled', 'info');
}

// Calculate days remaining between expiry date and today
function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;

  // Split string to avoid timezone parsing issues
  const parts = expiryDateStr.split('-');
  if (parts.length !== 3) return 0;

  const expYear = parseInt(parts[0], 10);
  const expMonth = parseInt(parts[1], 10) - 1;
  const expDay = parseInt(parts[2], 10);

  const expiryDate = new Date(expYear, expMonth, expDay, 0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = expiryDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Get status classification based on days left
function getExpiryStatus(days) {
  if (days < 0) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      badgeClass: 'badge-expired',
      rowClass: 'row-expired'
    };
  } else if (days <= 30) {
    return {
      status: 'EXPIRING_SOON',
      label: 'Expiring Soon',
      badgeClass: 'badge-expiring',
      rowClass: 'row-expiring-soon'
    };
  } else {
    return {
      status: 'SAFE',
      label: 'Safe',
      badgeClass: 'badge-safe',
      rowClass: ''
    };
  }
}

// Helper to format relative date strings
function getRelativeDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Load medicines from localStorage
function loadMedicines() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEDICINES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading from localStorage', err);
    return [];
  }
}

// Save medicines to localStorage
function saveMedicines(list) {
  try {
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

// Update metric counters on dashboard
function updateDashboard() {
  let total = medicines.length;
  let expired = 0;
  let expiringSoon = 0;
  let safe = 0;

  medicines.forEach(med => {
    const days = calculateDaysRemaining(med.expiryDate);
    const classification = getExpiryStatus(days);

    if (classification.status === 'EXPIRED') {
      expired++;
    } else if (classification.status === 'EXPIRING_SOON') {
      expiringSoon++;
    } else {
      safe++;
    }
  });

  metricTotal.textContent = total;
  metricExpired.textContent = expired;
  metricExpiringSoon.textContent = expiringSoon;
  metricSafe.textContent = safe;
}

// Filter medicines by search input, status, and category
function filterMedicines() {
  const search = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const category = categoryFilter.value;

  return medicines.filter(med => {
    const matchSearch = !search || med.name.toLowerCase().includes(search);
    const days = calculateDaysRemaining(med.expiryDate);
    const matchStatus = status === 'ALL' || getExpiryStatus(days).status === status;
    const matchCategory = category === 'ALL' || med.category === category;

    return matchSearch && matchStatus && matchCategory;
  });
}

// Simple HTML escaping helper to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Render medicine table rows
function renderTable() {
  medicineTableBody.innerHTML = '';
  const filtered = filterMedicines();

  tableRecordCount.textContent = `${filtered.length} Record${filtered.length === 1 ? '' : 's'}`;

  const hasFilter = searchInput.value.trim() !== '' || statusFilter.value !== 'ALL' || categoryFilter.value !== 'ALL';
  if (hasFilter) {
    filterSummaryText.textContent = `Filtered ${filtered.length} of ${medicines.length} total`;
    btnClearSearch.classList.remove('d-none');
  } else {
    filterSummaryText.textContent = `Showing all ${medicines.length} records`;
    btnClearSearch.classList.add('d-none');
  }

  // Handle empty state
  if (filtered.length === 0) {
    emptyState.classList.remove('d-none');
    if (medicines.length === 0) {
      emptyStateTitle.textContent = 'Inventory is Empty';
      emptyStateSubtitle.textContent = 'Add a medicine record or click Load Sample Data.';
      btnEmptyStateAction.classList.remove('d-none');
    } else {
      emptyStateTitle.textContent = 'No matching medicines found';
      emptyStateSubtitle.textContent = 'Try adjusting your search or filter options.';
      btnEmptyStateAction.classList.add('d-none');
    }
    return;
  }

  emptyState.classList.add('d-none');

  filtered.forEach((med, i) => {
    const days = calculateDaysRemaining(med.expiryDate);
    const expiry = getExpiryStatus(days);

    let daysText = '';
    if (days < 0) {
      daysText = `<span class="text-danger fw-semibold">${Math.abs(days)} days ago</span>`;
    } else if (days === 0) {
      daysText = `<span class="badge bg-danger">Today</span>`;
    } else {
      daysText = `<span>${days} days</span>`;
    }

    const tr = document.createElement('tr');
    if (expiry.rowClass) {
      tr.className = expiry.rowClass;
    }

    tr.innerHTML = `
      <td class="ps-3 text-muted small">${i + 1}</td>
      <td>
        <div class="fw-semibold">${escapeHtml(med.name)}</div>
        ${med.notes ? `<div class="text-muted small">${escapeHtml(med.notes)}</div>` : ''}
      </td>
      <td><span class="badge bg-light text-dark border">${escapeHtml(med.category)}</span></td>
      <td><code>${escapeHtml(med.batch)}</code></td>
      <td>${med.quantity}</td>
      <td class="small">${escapeHtml(med.expiryDate)}</td>
      <td class="small">${daysText}</td>
      <td><span class="badge ${expiry.badgeClass}">${expiry.label}</span></td>
      <td class="text-end pe-3">
        <button type="button" class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${med.id}" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${med.id}" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    medicineTableBody.appendChild(tr);
  });
}

// Validate medicine form input
function validateForm(name, batch, category, quantity, expiryDate) {
  if (!name) return 'Please enter medicine name.';
  if (!batch) return 'Please enter batch number.';
  if (!category) return 'Please select a category.';
  if (isNaN(quantity) || quantity <= 0) return 'Quantity must be a positive number.';
  if (!expiryDate) return 'Please select an expiry date.';
  return null;
}

// Handle Add / Edit submit
function handleMedicineSubmit(e) {
  e.preventDefault();

  const name = medicineNameInput.value.trim();
  const batch = batchNumberInput.value.trim().toUpperCase();
  const category = medicineCategoryInput.value;
  const quantity = parseInt(medicineQuantityInput.value, 10);
  const expiryDate = expiryDateInput.value;
  const notes = medicineNotesInput.value.trim();

  const error = validateForm(name, batch, category, quantity, expiryDate);
  if (error) {
    formAlertText.textContent = error;
    formAlert.classList.remove('d-none');
    return;
  }

  // Check duplicate batch for other records
  const isDuplicate = medicines.some(m => {
    if (editingMedicineId && m.id === editingMedicineId) return false;
    return m.batch.toUpperCase() === batch && m.name.toLowerCase() === name.toLowerCase();
  });

  if (isDuplicate) {
    formAlertText.textContent = `A medicine with batch "${batch}" already exists.`;
    formAlert.classList.remove('d-none');
    return;
  }

  formAlert.classList.add('d-none');

  if (editingMedicineId) {
    // Edit existing
    const index = medicines.findIndex(m => m.id === editingMedicineId);
    if (index !== -1) {
      medicines[index] = {
        ...medicines[index],
        name,
        batch,
        category,
        quantity,
        expiryDate,
        notes
      };
      saveMedicines(medicines);
      updateDashboard();
      renderTable();
      cancelEdit();
      showNotification('Medicine record updated', 'success');
    }
  } else {
    // Add new
    const newMed = {
      id: 'med_' + Date.now(),
      name,
      batch,
      category,
      quantity,
      expiryDate,
      notes
    };
    medicines.unshift(newMed);
    saveMedicines(medicines);
    updateDashboard();
    renderTable();
    medicineForm.reset();
    showNotification('Medicine added to inventory', 'success');
  }
}

// Load medicine into form for editing
function editMedicine(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;

  editingMedicineId = id;

  medicineIdInput.value = med.id;
  medicineNameInput.value = med.name;
  batchNumberInput.value = med.batch;
  medicineCategoryInput.value = med.category;
  medicineQuantityInput.value = med.quantity;
  expiryDateInput.value = med.expiryDate;
  medicineNotesInput.value = med.notes || '';

  formHeaderTitle.textContent = 'Edit Medicine';
  formModeBadge.textContent = 'Edit';
  btnSubmitText.textContent = 'Save Changes';
  btnSubmitIcon.className = 'bi bi-check-lg me-1';
  btnCancelEdit.classList.remove('d-none');
  formAlert.classList.add('d-none');

  medicineNameInput.focus();
}

// Cancel edit mode
function cancelEdit() {
  editingMedicineId = null;
  medicineForm.reset();
  medicineIdInput.value = '';

  formHeaderTitle.textContent = 'Add New Medicine';
  formModeBadge.textContent = 'New';
  btnSubmitText.textContent = 'Add Medicine';
  btnSubmitIcon.className = 'bi bi-plus-lg me-1';
  btnCancelEdit.classList.add('d-none');
  formAlert.classList.add('d-none');
}

// Delete medicine
function deleteMedicine(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;

  if (confirm(`Are you sure you want to delete ${med.name} (${med.batch})?`)) {
    if (editingMedicineId === id) cancelEdit();
    medicines = medicines.filter(m => m.id !== id);
    saveMedicines(medicines);
    updateDashboard();
    renderTable();
    showNotification('Medicine deleted', 'info');
  }
}

// Clear all medicines
function clearAllMedicines() {
  if (medicines.length === 0) return;
  if (confirm('Delete all medicine records from inventory?')) {
    medicines = [];
    cancelEdit();
    saveMedicines(medicines);
    updateDashboard();
    renderTable();
    showNotification('All records cleared', 'info');
  }
}

// Fetch sample data using Fetch API
async function loadSampleData() {
  btnLoadSampleData.disabled = true;
  apiSpinner.classList.remove('d-none');
  apiIcon.classList.add('d-none');

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!res.ok) throw new Error('API request failed');

    const sampleDrugs = [
      { name: 'Paracetamol 650mg', category: 'Tablet', batch: 'PCM-101', quantity: 120, offset: -15, notes: 'Fever and pain relief' },
      { name: 'Amoxicillin 500mg', category: 'Capsule', batch: 'AMX-202', quantity: 60, offset: 5, notes: 'Antibiotic' },
      { name: 'Cetirizine Syrup', category: 'Syrup', batch: 'CET-303', quantity: 35, offset: 18, notes: 'Antihistamine' },
      { name: 'Azithromycin 250mg', category: 'Tablet', batch: 'AZI-404', quantity: 80, offset: 70, notes: 'Antibiotic' },
      { name: 'Insulin Glargine', category: 'Injection', batch: 'INS-505', quantity: 20, offset: 150, notes: 'Keep refrigerated' }
    ];

    let count = 0;
    sampleDrugs.forEach(drug => {
      const exists = medicines.some(m => m.batch === drug.batch);
      if (!exists) {
        medicines.push({
          id: 'med_' + Math.random().toString(36).substring(2, 9),
          name: drug.name,
          category: drug.category,
          batch: drug.batch,
          quantity: drug.quantity,
          expiryDate: getRelativeDateString(drug.offset),
          notes: drug.notes
        });
        count++;
      }
    });

    if (count > 0) {
      saveMedicines(medicines);
      updateDashboard();
      renderTable();
      showNotification(`Loaded ${count} sample medicine records`, 'success');
    } else {
      showNotification('Sample medicines already loaded', 'info');
    }
  } catch (err) {
    console.error(err);
    showNotification('Could not load sample data. Check network connection.', 'danger');
  } finally {
    btnLoadSampleData.disabled = false;
    apiSpinner.classList.add('d-none');
    apiIcon.classList.remove('d-none');
  }
}

// Export inventory as CSV file
function exportCSV() {
  if (medicines.length === 0) {
    showNotification('Inventory is empty. Nothing to export.', 'warning');
    return;
  }

  const headers = ['ID', 'Medicine Name', 'Category', 'Batch', 'Quantity', 'Expiry Date', 'Days Left', 'Status', 'Notes'];
  const rows = medicines.map(m => {
    const days = calculateDaysRemaining(m.expiryDate);
    const status = getExpiryStatus(days).label;
    return [
      `"${m.id}"`,
      `"${m.name}"`,
      `"${m.category}"`,
      `"${m.batch}"`,
      m.quantity,
      `"${m.expiryDate}"`,
      days,
      `"${status}"`,
      `"${m.notes || ''}"`
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification('CSV exported successfully', 'success');
}

// Display toast message
function showNotification(msg, type = 'success') {
  if (!toastInstance || !toastElement) return;

  const bgClasses = {
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning text-dark',
    info: 'bg-dark'
  };

  toastElement.className = `toast align-items-center text-white border-0 shadow-sm ${bgClasses[type] || 'bg-success'}`;
  toastMessage.textContent = msg;
  toastInstance.show();
}

// Register all event listeners
function setupEvents() {
  loginForm.addEventListener('submit', handleLogin);
  btnLogout.addEventListener('click', handleLogout);
  togglePasswordBtn.addEventListener('click', togglePassword);
  btnFillDemoCredentials.addEventListener('click', fillDemoCredentials);

  medicineForm.addEventListener('submit', handleMedicineSubmit);
  btnCancelEdit.addEventListener('click', cancelEdit);
  btnClearForm.addEventListener('click', cancelEdit);

  // Table action delegation
  medicineTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'edit') editMedicine(id);
    if (action === 'delete') deleteMedicine(id);
  });

  searchInput.addEventListener('input', renderTable);
  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    renderTable();
    searchInput.focus();
  });

  statusFilter.addEventListener('change', renderTable);
  categoryFilter.addEventListener('change', renderTable);

  btnLoadSampleData.addEventListener('click', loadSampleData);
  btnEmptyStateAction.addEventListener('click', loadSampleData);
  btnExportCSV.addEventListener('click', exportCSV);
  btnClearAll.addEventListener('click', clearAllMedicines);
}
