/* ============================================
   CLEARANCE CHECKLIST SYSTEM - SCRIPTS v5.4
   Google Sheets Connected, CORS Fixed, Excel Upload,
   Graduation Status Toggle, Accordion Sidebar, Print All Pages
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    GAS_ENDPOINT: localStorage.getItem('gasEndpoint') || 'https://script.google.com/macros/s/AKfycbzWITQj23dxsA6nOEIcwWIqKD5X0Ot_DlpWiYhp5jreTpU1QVKxmxy09ZFI28PCufcPew/exec',
    SHEET_ID: localStorage.getItem('sheetId') || '',
    DATA_SHEET_NAME: 'Students',
    CHECKLIST_SHEET_NAME: 'Checklist',
};

// ============================================
// LOGIN CONFIGURATION
// ============================================
const LOGIN_CONFIG = {
    PASSWORD: '09292001',
    STORAGE_KEY: 'clearanceLoggedIn_v1'
};

// ============================================
// LOGIN FUNCTIONS
// ============================================
function initLogin() {
    injectLoginStyles();
    const isLoggedIn = sessionStorage.getItem(LOGIN_CONFIG.STORAGE_KEY);
    if (!isLoggedIn) {
        showLoginOverlay();
    } else {
        hideLoginOverlay();
        completeInitialization();
    }
}

function injectLoginStyles() {
    if (document.getElementById('loginStyles')) return;
    const style = document.createElement('style');
    style.id = 'loginStyles';
    style.textContent = `
        #loginOverlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.93);
            backdrop-filter: blur(10px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .login-box {
            background: #fff; padding: 44px 40px; border-radius: 18px;
            box-shadow: 0 25px 60px -12px rgba(0,0,0,0.35);
            text-align: center; width: 100%; max-width: 380px;
            animation: loginPop 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes loginPop {
            from { opacity: 0; transform: translateY(24px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-box h2 { margin: 0 0 10px 0; color: #0f172a; font-size: 1.6rem; }
        .login-box h2 i { color: #3b82f6; margin-right: 10px; }
        .login-box > p:first-of-type { color: #64748b; margin: 0 0 28px 0; font-size: 0.95rem; }
        #loginPassword {
            width: 100%; padding: 14px 18px; border: 2px solid #e2e8f0;
            border-radius: 12px; font-size: 1.05rem; margin-bottom: 18px;
            box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
        }
        #loginPassword:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        #loginBtn {
            width: 100%; padding: 14px; background: #3b82f6; color: #fff;
            border: none; border-radius: 12px; font-size: 1.05rem; font-weight: 600;
            cursor: pointer; transition: background 0.2s, transform 0.1s;
        }
        #loginBtn:hover { background: #2563eb; }
        #loginBtn:active { transform: scale(0.97); }
        .login-error { margin-top: 14px; font-size: 0.875rem; color: #ef4444; font-weight: 500; }
    `;
    document.head.appendChild(style);
}

function showLoginOverlay() {
    let overlay = document.getElementById('loginOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loginOverlay';
        overlay.innerHTML = `
            <div class="login-box">
                <h2><i class="fas fa-lock"></i> Clearance Checklist</h2>
                <p>Enter your password to continue</p>
                <input type="password" id="loginPassword" placeholder="Password" maxlength="20" autocomplete="off">
                <button id="loginBtn"><i class="fas fa-sign-in-alt"></i> Login</button>
                <p class="login-error" id="loginError" style="display:none;">Incorrect password. Try again.</p>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('loginBtn').addEventListener('click', handleLogin);
        document.getElementById('loginPassword').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function handleLogin() {
    const input = document.getElementById('loginPassword').value.trim();
    const normalized = input.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    const valid = [
        '09292001', '092901', '0929',
        'september292001', 'sep292001', '29september2001',
        '29092001', '290901'
    ];
    
    if (valid.includes(normalized)) {
        sessionStorage.setItem(LOGIN_CONFIG.STORAGE_KEY, 'true');
        hideLoginOverlay();
        showToast('Welcome! Logged in successfully.', 'success');
        completeInitialization();
    } else {
        const err = document.getElementById('loginError');
        err.style.display = 'block';
        document.getElementById('loginPassword').value = '';
        setTimeout(() => document.getElementById('loginPassword').focus(), 50);
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function setupLogout() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const existing = document.getElementById('logoutBtn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'logoutBtn';
    btn.className = 'tool-btn';
    btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    btn.addEventListener('click', () => {
        sessionStorage.removeItem(LOGIN_CONFIG.STORAGE_KEY);
        location.reload();
    });

    const actionsContent = document.getElementById('actionsContent');
    if (actionsContent) {
        actionsContent.appendChild(btn);
        return;
    }

    const footer = sidebar.querySelector('.sidebar-footer');
    if (footer) {
        sidebar.insertBefore(btn, footer);
    } else {
        sidebar.appendChild(btn);
    }
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_DATA = {
    "College of Education": {
        "Bachelor of Elementary Education": [
            "ALCANTARA, Nelvie M.", "ANTONIO, Rona Mae M.", "DALANON, Carla Pamela S.",
            "DALISAY, Marcelo III F.", "DALUMPINES, Shaira F.", "DIONISIO, Hannah S.",
            "FAA, Jillian Pearl M.", "FALLURIN, Hannah Nicole P.", "FAMPULME, Hannah Grace F.",
            "FORTUNATO, Frances Nicole F.", "GABINETE, Eihsen F.", "GALIVO, Ma. Belinda M.",
            "GUMAGAY, Emma Ruth F.", "GUYO, Cristian Jay D.", "LUCAS, Mayren F.",
            "MAESTRE, Mara Anthonette M.", "MAGBATA, Aika Mae F.", "MANATO, Weeden Thee M.",
            "MARCELO, Lorelie F.", "MELCHOR, Liza M.", "MENDEZ, Jhun August ll R.",
            "MIÑON, Judelyn Mae F.", "MORTEL, Mary Diane M.", "OFALSA, Raven V.",
            "PASIG, Christopher D.", "PLAZA, Nelly Joy G.", "POTOY, Shairane G.",
            "ROSA, Rodela M.", "SALAZAR, Icy P.", "UMAMBONG, Angellika D."
        ]
    }
};

// ============================================
// DATA STRUCTURE
// ============================================
let collegesData = {};

const columns = [
    { key: 'alumni_sheet', label: 'ALUMNI\nINFO\nSHEET', type: 'checkbox' },
    { key: 'nsrp', label: 'NSRP\nJOBSEEKER\nREG.', type: 'checkbox' },
    { key: 'privacy', label: 'DATA\nPRIVACY\nCONSENT', type: 'checkbox' },
    { key: 'yearbook', label: 'WAIVER', type: 'checkbox' },
    { key: 'job_orient_attend', label: 'ATTEND.', type: 'checkbox' },
    { key: 'job_orient_eval', label: 'EVAL.\nFORM', type: 'checkbox' },
    { key: 'job_fair', label: 'PARTIC.', type: 'checkbox' },
    { key: 'labor_attend', label: 'ATTEND.', type: 'checkbox' },
    { key: 'labor_eval', label: 'EVAL.\nFORM', type: 'checkbox' },
    { key: 'rsu_portal', label: 'RSU CAREER\nPORTAL\nREGISTRATION', type: 'checkbox' },
    { key: 'payment', label: 'PAYMENT OF\nALUMNI FEE\n(OR NO.)', type: 'input' },
    { key: 'signature', label: 'SIGNATURE &\nDATE SIGNED', type: 'date' },
];

// ============================================
// STATE MANAGEMENT
// ============================================
let checklistData = {};
let currentFilter = 'all';
let graduationStatusFilter = 'all';
let searchQuery = '';
let selectedCollege = '';
let selectedCourse = '';
let sidebarCollapsed = false;
let uploadedExcelData = null;

let selectedSignatureDate = '';
let selectedSignatureMonth = '';
let studentsCardMode = 'total';
let duplicatePayments = new Set();

const ROWS_PER_PAGE = 30;
let currentPage = {};

// --- PRINT MODE STATE ---
let isPrintMode = false;
let savedPrintState = null;

// ============================================
// API HELPERS
// ============================================
async function apiCall(action, payload = {}) {
    if (!CONFIG.GAS_ENDPOINT || CONFIG.GAS_ENDPOINT === 'https://script.google.com/macros/s/AKfycbws7eZIVHTbaYI9AaRjs43F9xweM5vuWdBn3OJtkqAKhVqv2VdGUiJ3KQ42A5JuXdOjPg/exec') {
        console.warn('GAS_ENDPOINT not configured. Skipping API call.');
        return { success: false, message: 'GAS endpoint not configured. Set it via: localStorage.setItem("gasEndpoint", "YOUR_URL")' };
    }

    const data = {
        action: action,
        ...payload,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('API call failed:', error);
        return { success: false, message: 'Server unreachable. Data saved locally only.' };
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSignatureDates() {
    const baseStudents = getFilteredStudentsBase();
    const dates = new Set();
    baseStudents.forEach(student => {
        const data = checklistData[student.id];
        if (data && data.signature && data.signature.trim()) {
            dates.add(data.signature.trim());
        }
    });
    return Array.from(dates).sort((a, b) => {
        const parse = (str) => { const [m, d, y] = str.split('/').map(Number); return new Date(y, m - 1, d); };
        return parse(a) - parse(b);
    });
}

function getSignatureMonths() {
    const baseStudents = getFilteredStudentsBase();
    const months = new Set();
    baseStudents.forEach(student => {
        const data = checklistData[student.id];
        if (data && data.signature && data.signature.trim()) {
            const parts = data.signature.split('/');
            if (parts.length === 3) months.add(`${parts[0]}/${parts[2]}`);
        }
    });
    return Array.from(months).sort((a, b) => {
        const [ma, ya] = a.split('/').map(Number);
        const [mb, yb] = b.split('/').map(Number);
        if (ya !== yb) return ya - yb;
        return ma - mb;
    });
}

function populateSignatureFilters() {
    const dateSelect = document.getElementById('signatureDateSelect');
    const monthSelect = document.getElementById('signatureMonthSelect');
    if (!dateSelect || !monthSelect) return;

    const currentDate = dateSelect.value;
    const currentMonth = monthSelect.value;

    dateSelect.innerHTML = '<option value="">All Dates</option>';
    monthSelect.innerHTML = '<option value="">All Months</option>';

    getSignatureDates().forEach(date => {
        const opt = document.createElement('option');
        opt.value = date;
        opt.textContent = date;
        dateSelect.appendChild(opt);
    });

    getSignatureMonths().forEach(month => {
        const opt = document.createElement('option');
        opt.value = month;
        opt.textContent = month;
        monthSelect.appendChild(opt);
    });

    if (currentDate && Array.from(dateSelect.options).some(o => o.value === currentDate)) {
        dateSelect.value = currentDate;
    } else {
        selectedSignatureDate = '';
    }
    if (currentMonth && Array.from(monthSelect.options).some(o => o.value === currentMonth)) {
        monthSelect.value = currentMonth;
    } else {
        selectedSignatureMonth = '';
    }
}

function updateDuplicatePayments() {
    const counts = {};
    Object.values(checklistData).forEach(data => {
        const val = data.payment;
        if (val && String(val).length === 6 && /^\d{6}$/.test(String(val))) {
            counts[val] = (counts[val] || 0) + 1;
        }
    });
    duplicatePayments = new Set(Object.keys(counts).filter(k => counts[k] > 1));
}

function highlightDuplicatePayments() {
    document.querySelectorAll('.payment-input').forEach(input => {
        const val = input.value;
        if (val && duplicatePayments.has(val)) input.classList.add('duplicate');
        else input.classList.remove('duplicate');
    });
}

function setSidebarCollapsed(collapsed) {
    sidebarCollapsed = collapsed;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const toggleBtn = document.getElementById('sidebarToggle');

    if (sidebar) sidebar.classList.toggle('collapsed', collapsed);
    if (mainContent) mainContent.classList.toggle('sidebar-collapsed', collapsed);

    if (collapseBtn) {
        const icon = collapseBtn.querySelector('i');
        if (collapsed) { 
            if (icon) icon.className = 'fas fa-chevron-right'; 
            collapseBtn.title = 'Expand Sidebar'; 
        } else { 
            if (icon) icon.className = 'fas fa-chevron-left'; 
            collapseBtn.title = 'Collapse Sidebar'; 
        }
    }

    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (collapsed) {
            if (icon) icon.className = 'fas fa-columns';
            toggleBtn.title = 'Show Sidebar';
            toggleBtn.style.background = 'var(--primary-light)';
            toggleBtn.style.borderColor = 'var(--primary)';
            toggleBtn.style.color = 'var(--primary)';
        } else {
            if (icon) icon.className = 'fas fa-columns';
            toggleBtn.title = 'Hide Sidebar';
            toggleBtn.style.background = '';
            toggleBtn.style.borderColor = '';
            toggleBtn.style.color = '';
        }
    }

    localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false');
}

function setupSidebarCollapse() {
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => setSidebarCollapsed(!sidebarCollapsed));
    }

    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => setSidebarCollapsed(!sidebarCollapsed));
    }

    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
        setSidebarCollapsed(true);
    }
}

function setupStudentsCard() {
    const card = document.getElementById('studentsStatCard');
    if (!card) return;
    card.addEventListener('click', () => {
        studentsCardMode = studentsCardMode === 'total' ? 'filtered' : 'total';
        updateStats();
    });
}

function setupSignatureFilters() {
    const dateSelect = document.getElementById('signatureDateSelect');
    const monthSelect = document.getElementById('signatureMonthSelect');
    if (!dateSelect || !monthSelect) return;

    const newDateSelect = dateSelect.cloneNode(true);
    const newMonthSelect = monthSelect.cloneNode(true);
    dateSelect.parentNode.replaceChild(newDateSelect, dateSelect);
    monthSelect.parentNode.replaceChild(newMonthSelect, monthSelect);

    newDateSelect.addEventListener('change', (e) => {
        selectedSignatureDate = e.target.value;
        currentPage = {};
        renderDocuments();
        updateStats();
    });

    newMonthSelect.addEventListener('change', (e) => {
        selectedSignatureMonth = e.target.value;
        currentPage = {};
        renderDocuments();
        updateStats();
    });
}

// ============================================
// PASSWORD PROMPT
// ============================================
function promptSavePassword() {
    const input = prompt('Enter password to save to Google Sheets:');
    if (!input) return null;
    const normalized = input.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    const valid = ['09292001', '092901', '0929', 'september292001', 'sep292001', '29september2001', '29092001', '290901'];
    if (!valid.includes(normalized)) {
        showToast('Incorrect password. Operation cancelled.', 'error');
        return null;
    }
    return normalized;
}

// ============================================
// LOAD / SAVE DATA
// ============================================
async function loadDataFromSheets() {
    showLoading('Loading data from Google Sheets...');

    try {
        const result = await apiCall('getStudents');

        if (result.success && result.data && result.data.length > 0) {
            collegesData = {};

            result.data.forEach(row => {
                const campus = row.campus || row.Campus || 'Unknown Campus';
                const program = row.program || row.Program || 'Unknown Program';
                const fullName = row.fullName || row['FULL NAME'] || row.full_name || '';

                if (!fullName) return;

                if (!collegesData[campus]) {
                    collegesData[campus] = {};
                }
                if (!collegesData[campus][program]) {
                    collegesData[campus][program] = [];
                }

                collegesData[campus][program].push(fullName);
            });

            if (result.checklistData) {
                checklistData = result.checklistData;
                saveDataLocal();
            }

            saveDataLocal();

            if (Object.keys(collegesData).length > 0 && !selectedCollege) {
                selectedCollege = Object.keys(collegesData)[0];
            }

            showToast('Data loaded from Google Sheets!', 'success');
        } else {
            showToast('No data found in Google Sheets', 'warning');
        }
    } catch (error) {
        console.error('Failed to load from sheets:', error);
        showToast('Failed to load from server: ' + error.message, 'warning');
    } finally {
        populateSignatureFilters();
        updateDuplicatePayments();
        hideLoading();
    }
}

async function saveChecklistToSheets() {
    if (!CONFIG.GAS_ENDPOINT) {
        saveDataLocal();
        showToast('Data saved locally. Set GAS endpoint to sync to server.', 'warning');
        return;
    }

    const password = promptSavePassword();
    if (!password) return;

    showLoading('Saving checklist data to server...');

    try {
        const result = await apiCall('saveChecklist', {
            checklistData: checklistData,
            password: password
        });

        if (result.success) {
            showToast('Checklist data saved to Google Sheets!', 'success');
        } else {
            showToast('Save failed: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Save failed:', error);
        showToast('Save failed. Data saved locally only.', 'warning');
        saveDataLocal();
    } finally {
        hideLoading();
    }
}

async function uploadExcelToSheets(excelData) {
    if (!CONFIG.GAS_ENDPOINT) {
        showToast('No server configured. Set GAS endpoint in localStorage.', 'warning');
        return;
    }

    const password = promptSavePassword();
    if (!password) return;

    showLoading('Uploading data to Google Sheets...');

    try {
        const result = await apiCall('uploadStudents', {
            students: excelData,
            password: password
        });

        if (result.success) {
            showToast('Excel data uploaded to Google Sheets!', 'success');
            await loadDataFromSheets();
            allStudents = getAllStudents();
            renderDocuments();
            populateDropdowns();
        } else {
            showToast('Upload failed: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Upload failed:', error);
        showToast('Upload failed: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function saveDataLocal() {
    localStorage.setItem('clearanceChecklistData', JSON.stringify(checklistData));
    localStorage.setItem('clearanceCollegesData', JSON.stringify(collegesData));
}

function initData() {
    const savedChecklist = localStorage.getItem('clearanceChecklistData');
    const savedColleges = localStorage.getItem('clearanceCollegesData');

    if (savedChecklist) {
        checklistData = JSON.parse(savedChecklist);
    }
    if (savedColleges) {
        try {
            collegesData = JSON.parse(savedColleges);
        } catch (e) {
            collegesData = {};
        }
    }

    if (Object.keys(collegesData).length === 0) {
        collegesData = DEMO_DATA;
        saveDataLocal();
    }

    if (Object.keys(collegesData).length > 0 && !selectedCollege) {
        selectedCollege = Object.keys(collegesData)[0];
    }
}

// ============================================
// FLATTEN STUDENTS
// ============================================
function getAllStudents() {
    const allStudents = [];
    let globalId = 1;
    for (const [college, courses] of Object.entries(collegesData)) {
        for (const [course, names] of Object.entries(courses)) {
            names.forEach((name, idx) => {
                allStudents.push({
                    id: globalId++,
                    name: name,
                    college: college,
                    course: course,
                    courseIndex: idx + 1
                });
            });
        }
    }
    return allStudents;
}

let allStudents = [];

// ============================================
// CHECKBOX LOGIC
// ============================================
function toggleCheck(studentId, key) {
    if (!checklistData[studentId]) checklistData[studentId] = {};
    checklistData[studentId][key] = !checklistData[studentId][key];
    if (!checklistData[studentId][key]) {
        delete checklistData[studentId][key];
    }
    saveDataLocal();

    const cell = document.querySelector(`[data-student-id="${studentId}"][data-col-key="${key}"]`);
    if (cell) {
        cell.classList.toggle('checked', isChecked(studentId, key));
        updateRowStatus(studentId);
        updateStats();
    }
    showToast('Updated successfully', 'success');
}

function isChecked(studentId, key) {
    return checklistData[studentId] && checklistData[studentId][key] === true;
}

function updateRowStatus(studentId) {
    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (!row) return;
    
    if (!isGraduated(studentId)) {
        row.className = 'row-not-graduated';
        return;
    }
    
    const studentData = checklistData[studentId] || {};
    const checkedCount = Object.values(studentData).filter(v => v === true).length;
    const totalCheckCols = columns.filter(c => c.type === 'checkbox').length;
    const isComplete = checkedCount === totalCheckCols;
    const hasPending = checkedCount > 0 && checkedCount < totalCheckCols;

    row.className = isComplete ? 'row-complete' : (hasPending ? 'row-pending' : '');
}

// ============================================
// DATE INPUT HANDLING
// ============================================
function formatDateInput(value) {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length >= 1) formatted = digits.substring(0, 2);
    if (digits.length >= 3) formatted += '/' + digits.substring(2, 4);
    if (digits.length >= 5) formatted += '/' + digits.substring(4, 8);
    return formatted;
}

function isValidDate(dateStr) {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    return true;
}

function handleDateInput(studentId, value) {
    if (!checklistData[studentId]) checklistData[studentId] = {};
    checklistData[studentId]['signature'] = value;

    if (isValidDate(value)) {
        columns.forEach(col => {
            if (col.type === 'checkbox') {
                checklistData[studentId][col.key] = true;
            }
        });
        populateSignatureFilters();
    } else if (value === '') {
        columns.forEach(col => {
            if (col.type === 'checkbox') {
                delete checklistData[studentId][col.key];
            }
        });
        populateSignatureFilters();
    }

    saveDataLocal();

    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (row) {
        row.querySelectorAll('.check-cell').forEach(cell => {
            const colKey = cell.dataset.colKey;
            if (colKey) {
                cell.classList.toggle('checked', isChecked(studentId, colKey));
            }
        });
        updateRowStatus(studentId);
    }
    updateStats();
}

// ============================================
// PAYMENT INPUT HANDLING
// ============================================
function formatPaymentInput(value) {
    return value.replace(/\D/g, '').substring(0, 6);
}

function handlePaymentInput(studentId, value) {
    if (!checklistData[studentId]) checklistData[studentId] = {};
    checklistData[studentId]['payment'] = value;
    saveDataLocal();
    updateDuplicatePayments();
    highlightDuplicatePayments();
}

// ============================================
// GRADUATION STATUS
// ============================================
function isGraduated(studentId) {
    return checklistData[studentId]?.graduated !== false;
}

function setGraduationStatus(studentId, graduated) {
    if (!checklistData[studentId]) checklistData[studentId] = {};
    if (graduated) {
        delete checklistData[studentId].graduated;
    } else {
        checklistData[studentId].graduated = false;
    }
    saveDataLocal();
}

function initGraduationPopup() {
    let popup = document.getElementById('graduationPopup');
    if (popup) return popup;
    
    popup = document.createElement('div');
    popup.id = 'graduationPopup';
    popup.className = 'graduation-popup';
    popup.innerHTML = `
        <div class="graduation-popup-title">Graduation Status</div>
        <label class="graduation-option">
            <input type="radio" name="gradStatus" value="graduated">
            <span>Graduated</span>
        </label>
        <label class="graduation-option">
            <input type="radio" name="gradStatus" value="notGraduated">
            <span>Not Graduated</span>
        </label>
    `;
    document.body.appendChild(popup);
    
    popup.addEventListener('change', (e) => {
        if (e.target.name === 'gradStatus') {
            const studentId = popup.dataset.studentId;
            if (!studentId) return;
            const graduated = e.target.value === 'graduated';
            setGraduationStatus(studentId, graduated);
            closeGraduationPopup();
            renderDocuments();
        }
    });
    
    return popup;
}

function showGraduationPopup(studentId, anchorEl) {
    closeGraduationPopup();
    
    const popup = initGraduationPopup();
    const rect = anchorEl.getBoundingClientRect();
    
    const graduated = isGraduated(studentId);
    popup.querySelector('input[value="graduated"]').checked = graduated;
    popup.querySelector('input[value="notGraduated"]').checked = !graduated;
    
    popup.style.display = 'block';
    popup.style.visibility = 'hidden';
    const popupWidth = popup.offsetWidth || 200;
    const popupHeight = popup.offsetHeight || 120;
    popup.style.visibility = 'visible';
    
    let left = rect.right + 10;
    let top = rect.top + window.scrollY;
    
    if (left + popupWidth > window.innerWidth - 10) {
        left = rect.left - popupWidth - 10;
    }
    if (top + popupHeight > window.innerHeight + window.scrollY - 10) {
        top = window.innerHeight + window.scrollY - popupHeight - 10;
    }
    if (top < window.scrollY + 10) top = window.scrollY + 10;
    
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.dataset.studentId = studentId;
    
    setTimeout(() => {
        document.addEventListener('click', closePopupOnClickOutside);
    }, 10);
}

function closePopupOnClickOutside(e) {
    const popup = document.getElementById('graduationPopup');
    if (!popup || popup.style.display === 'none') return;
    if (!popup.contains(e.target) && !e.target.closest('.student-name')) {
        closeGraduationPopup();
    }
}

function closeGraduationPopup() {
    const popup = document.getElementById('graduationPopup');
    if (popup) popup.style.display = 'none';
    document.removeEventListener('click', closePopupOnClickOutside);
}

function setupGraduationPopupGlobalListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGraduationPopup();
    });
    window.addEventListener('scroll', closeGraduationPopup, true);
    window.addEventListener('resize', closeGraduationPopup);
}

// ============================================
// BOLD SURNAME HELPER
// ============================================
function formatNameWithBoldSurname(name) {
    const commaIndex = name.indexOf(',');
    if (commaIndex === -1) return name;
    const surname = name.substring(0, commaIndex);
    const rest = name.substring(commaIndex);
    return `<strong>${surname}</strong>${rest}`;
}

// ============================================
// GET VISIBLE STUDENTS
// ============================================
function getVisibleStudents() {
    let collegesToShow = Object.entries(collegesData);
    if (selectedCollege) {
        collegesToShow = collegesToShow.filter(([college]) => college === selectedCollege);
    }

    const visibleStudents = [];

    collegesToShow.forEach(([college, courses]) => {
        let coursesToShow = Object.entries(courses);
        if (selectedCourse) {
            coursesToShow = coursesToShow.filter(([course]) => course === selectedCourse);
        }

        coursesToShow.forEach(([course, names]) => {
            const courseStudents = allStudents.filter(s => 
                s.college === college && s.course === course
            );

            const filteredStudents = courseStudents.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                const studentData = checklistData[s.id] || {};
                const checkedCount = Object.values(studentData).filter(v => v === true).length;
                const totalCols = columns.filter(c => c.type === 'checkbox').length;
                const isStudentGraduated = isGraduated(s.id);

                // Graduation status filter
                if (graduationStatusFilter === 'graduated' && !isStudentGraduated) return false;
                if (graduationStatusFilter === 'notGraduated' && isStudentGraduated) return false;

                // Signature date filter
                let matchesSignature = true;
                if (selectedSignatureDate) {
                    matchesSignature = studentData.signature === selectedSignatureDate;
                }
                if (selectedSignatureMonth && matchesSignature) {
                    const sig = studentData.signature || '';
                    const parts = sig.split('/');
                    const sigMonth = parts.length === 3 ? `${parts[0]}/${parts[2]}` : '';
                    matchesSignature = sigMonth === selectedSignatureMonth;
                }
                if (!matchesSignature) return false;

                // Quick filters - hide not graduated
                if (currentFilter === 'complete') {
                    if (!isStudentGraduated) return false;
                    return matchesSearch && checkedCount === totalCols;
                } else if (currentFilter === 'incomplete') {
                    if (!isStudentGraduated) return false;
                    return matchesSearch && checkedCount < totalCols;
                }
                return matchesSearch;
            });

            visibleStudents.push(...filteredStudents);
        });
    });

    return visibleStudents;
}

// ============================================
// RENDER DOCUMENTS - PAGINATED
// ============================================
function renderDocuments() {
    const container = document.getElementById('documentsContainer');
    container.innerHTML = '';

    if (Object.keys(collegesData).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Data Available</h3>
                <p>Upload an Excel file or sync from Google Sheets to get started.</p>
                <button class="tool-btn" onclick="document.getElementById('excelUpload').click()" style="margin-top:12px;width:auto;display:inline-flex;">
                    <i class="fas fa-upload"></i> Upload Excel
                </button>
            </div>
        `;
        updateStats();
        return;
    }

    let collegesToShow = Object.entries(collegesData);
    if (selectedCollege) {
        collegesToShow = collegesToShow.filter(([college]) => college === selectedCollege);
    }

    collegesToShow.forEach(([college, courses]) => {
        let coursesToShow = Object.entries(courses);
        if (selectedCourse) {
            coursesToShow = coursesToShow.filter(([course]) => course === selectedCourse);
        }

        coursesToShow.forEach(([course, names]) => {
            const courseStudents = allStudents.filter(s => 
                s.college === college && s.course === course
            );

            const filteredStudents = courseStudents.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                const studentData = checklistData[s.id] || {};
                const checkedCount = Object.values(studentData).filter(v => v === true).length;
                const totalCols = columns.filter(c => c.type === 'checkbox').length;
                const isStudentGraduated = isGraduated(s.id);

                // Graduation status filter
                if (graduationStatusFilter === 'graduated' && !isStudentGraduated) return false;
                if (graduationStatusFilter === 'notGraduated' && isStudentGraduated) return false;

                // Signature date filter
                let matchesSignature = true;
                if (selectedSignatureDate) {
                    matchesSignature = studentData.signature === selectedSignatureDate;
                }
                if (selectedSignatureMonth && matchesSignature) {
                    const sig = studentData.signature || '';
                    const parts = sig.split('/');
                    const sigMonth = parts.length === 3 ? `${parts[0]}/${parts[2]}` : '';
                    matchesSignature = sigMonth === selectedSignatureMonth;
                }
                if (!matchesSignature) return false;

                // Quick filters - hide not graduated
                if (currentFilter === 'complete') {
                    if (!isStudentGraduated) return false;
                    return matchesSearch && checkedCount === totalCols;
                } else if (currentFilter === 'incomplete') {
                    if (!isStudentGraduated) return false;
                    return matchesSearch && checkedCount < totalCols;
                }
                return matchesSearch;
            });

            if (filteredStudents.length === 0) return;

            const docPage = document.createElement('div');
            docPage.className = 'document-page';

            const badge = document.createElement('div');
            badge.className = 'course-badge';
            badge.innerHTML = `<i class="fas fa-graduation-cap"></i> ${course}`;
            docPage.appendChild(badge);

            const header = document.createElement('div');
            header.className = 'doc-header';
            header.innerHTML = `
                <h2 class="doc-title">CHECKLIST OF REQUIREMENTS FOR CLEARANCE SIGNING</h2>
                <h3 class="doc-subtitle">${course}</h3>
                <h3 class="doc-college">${college}</h3>
            `;
            docPage.appendChild(header);

            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-sticky-wrapper';

            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';

            const table = document.createElement('table');
            table.className = 'checklist-table';
            table.innerHTML = `
                <thead>
                    <tr class="header-row-1">
                        <th rowspan="3" class="th-name">NAME OF STUDENTS</th>
                        <th colspan="4" class="th-accomplished">ACCOMPLISHED FORMS</th>
                        <th colspan="5" class="th-attendance">ATTENDANCE TO REQUIRED SEMINARS/WEBINARS</th>
                        <th rowspan="3" class="th-rsu">RSU CAREER<br>PORTAL<br>REGISTRATION</th>
                        <th rowspan="3" class="th-payment">PAYMENT OF<br>ALUMNI FEE<br>(OR NO.)</th>
                        <th rowspan="3" class="th-signature">SIGNATURE &<br>DATE SIGNED</th>
                    </tr>
                    <tr class="header-row-2">
                        <th class="th-form">ALUMNI<br>INFO<br>SHEET</th>
                        <th class="th-form">NSRP<br>JOBSEEKER<br>REG.</th>
                        <th class="th-form">DATA<br>PRIVACY<br>CONSENT</th>
                        <th class="th-form">WAIVER</th>
                        <th class="th-seminar" colspan="2">JOB ORIENTATION &<br>PLACEMENT SEMINAR</th>
                        <th class="th-seminar">JOB FAIR<br>SIMULATION</th>
                        <th class="th-seminar" colspan="2">LABOR EDUCATION FOR<br>GRADUATING STUDENTS</th>
                    </tr>
                    <tr class="header-row-3">
                        <th class="th-empty"></th>
                        <th class="th-empty"></th>
                        <th class="th-empty"></th>
                        <th class="th-empty"></th>
                        <th class="th-sub">ATTEND.</th>
                        <th class="th-sub">EVAL.<br>FORM</th>
                        <th class="th-sub">PARTIC.</th>
                        <th class="th-sub">ATTEND.</th>
                        <th class="th-sub">EVAL.<br>FORM</th>
                        <th class="th-empty"></th>
                        <th class="th-empty"></th>
                        <th class="th-empty"></th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');

            const tableKey = `${college}|||${course}`;
            if (!currentPage[tableKey]) currentPage[tableKey] = 1;

            // --- PRINT MODE: show all rows, no pagination ---
            let pageStudents;
            let totalPages = 1;
            let startIdx = 0;
            let endIdx = filteredStudents.length;

            if (isPrintMode) {
                pageStudents = filteredStudents;
            } else {
                totalPages = Math.ceil(filteredStudents.length / ROWS_PER_PAGE);
                startIdx = (currentPage[tableKey] - 1) * ROWS_PER_PAGE;
                endIdx = Math.min(startIdx + ROWS_PER_PAGE, filteredStudents.length);
                pageStudents = filteredStudents.slice(startIdx, endIdx);
            }

            // Calculate sequential numbering for graduated students only
            let gradCounter = 0;
            const gradNumbers = {};
            filteredStudents.forEach(student => {
                if (isGraduated(student.id)) {
                    gradCounter++;
                    gradNumbers[student.id] = gradCounter;
                } else {
                    gradNumbers[student.id] = '-';
                }
            });

            pageStudents.forEach((student) => {
                const studentData = checklistData[student.id] || {};
                const isStudentGraduated = isGraduated(student.id);
                const displayNum = gradNumbers[student.id];

                const tr = document.createElement('tr');
                tr.dataset.studentId = student.id;

                if (!isStudentGraduated) {
                    tr.className = 'row-not-graduated';
                    
                    const nameTd = document.createElement('td');
                    nameTd.innerHTML = `<span class="row-num not-graduated-num">${displayNum}</span><span class="student-name not-graduated-name">${formatNameWithBoldSurname(student.name)}</span>`;
                    nameTd.querySelector('.student-name').addEventListener('click', (e) => {
                        e.stopPropagation();
                        showGraduationPopup(student.id, e.currentTarget);
                    });
                    tr.appendChild(nameTd);
                    
                    const statusTd = document.createElement('td');
                    statusTd.colSpan = 12;
                    statusTd.className = 'graduation-status-cell';
                    statusTd.textContent = 'Not in Graduation List';
                    tr.appendChild(statusTd);
                } else {
                    const checkedCount = Object.values(studentData).filter(v => v === true).length;
                    const totalCheckCols = columns.filter(c => c.type === 'checkbox').length;
                    const isComplete = checkedCount === totalCheckCols;
                    const hasPending = checkedCount > 0 && checkedCount < totalCheckCols;

                    tr.className = isComplete ? 'row-complete' : (hasPending ? 'row-pending' : '');

                    const nameTd = document.createElement('td');
                    nameTd.innerHTML = `<span class="row-num">${displayNum}</span><span class="student-name">${formatNameWithBoldSurname(student.name)}</span>`;
                    nameTd.querySelector('.student-name').addEventListener('click', (e) => {
                        e.stopPropagation();
                        showGraduationPopup(student.id, e.currentTarget);
                    });
                    tr.appendChild(nameTd);

                    columns.forEach(col => {
                        const td = document.createElement('td');

                        if (col.type === 'date') {
                            td.className = 'signature-cell';
                            const dateValue = studentData['signature'] || '';
                            td.innerHTML = `
                                <input type="text" 
                                       class="date-input" 
                                       placeholder="__/__/____" 
                                       value="${dateValue}"
                                       maxlength="10"
                                       data-student-id="${student.id}"
                                       data-col-key="${col.key}"
                                >
                            `;
                            const input = td.querySelector('.date-input');
                            input.addEventListener('input', (e) => {
                                const formatted = formatDateInput(e.target.value);
                                e.target.value = formatted;
                                handleDateInput(student.id, formatted);
                            });
                            input.addEventListener('paste', (e) => {
                                e.preventDefault();
                                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                                const formatted = formatDateInput(pasteData);
                                e.target.value = formatted;
                                handleDateInput(student.id, formatted);
                            });
                        } else if (col.type === 'input') {
                            td.className = 'payment-cell';
                            const paymentValue = studentData['payment'] || '';
                            td.innerHTML = `
                                <input type="text" 
                                       class="payment-input" 
                                       placeholder="______" 
                                       value="${paymentValue}"
                                       maxlength="6"
                                       data-student-id="${student.id}"
                                       data-col-key="${col.key}"
                                >
                            `;
                            const input = td.querySelector('.payment-input');
                            input.addEventListener('input', (e) => {
                                const formatted = formatPaymentInput(e.target.value);
                                e.target.value = formatted;
                                handlePaymentInput(student.id, formatted);
                            });
                            input.addEventListener('paste', (e) => {
                                e.preventDefault();
                                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                                const formatted = formatPaymentInput(pasteData);
                                e.target.value = formatted;
                                handlePaymentInput(student.id, formatted);
                            });
                            if (duplicatePayments.has(paymentValue)) {
                                input.classList.add('duplicate');
                            }
                        } else {
                            td.className = 'check-cell' + (isChecked(student.id, col.key) ? ' checked' : '');
                            td.dataset.studentId = student.id;
                            td.dataset.colKey = col.key;
                            td.innerHTML = `
                                <span class="check-placeholder"></span>
                                <span class="checkmark">✓</span>
                            `;
                            td.addEventListener('click', () => toggleCheck(student.id, col.key));
                        }

                        tr.appendChild(td);
                    });
                }

                tbody.appendChild(tr);
            });

            tableContainer.appendChild(table);
            tableWrapper.appendChild(tableContainer);
            docPage.appendChild(tableWrapper);

            // --- PAGINATION (hidden in print mode) ---
            if (!isPrintMode && totalPages > 1) {
                const pagination = document.createElement('div');
                pagination.className = 'pagination';

                const showingStart = startIdx + 1;
                const showingEnd = endIdx;
                const totalItems = filteredStudents.length;

                pagination.innerHTML = `
                    <div class="pagination-info">
                        Showing <strong>${String(showingStart).padStart(2, '0')}</strong> to <strong>${String(showingEnd).padStart(2, '0')}</strong> of <strong>${totalItems}</strong>
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" data-action="first" data-table="${tableKey}" ${currentPage[tableKey] === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button class="pagination-btn" data-action="prev" data-table="${tableKey}" ${currentPage[tableKey] === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-left"></i>
                        </button>
                        <span class="pagination-page">Page ${currentPage[tableKey]} of ${totalPages}</span>
                        <button class="pagination-btn" data-action="next" data-table="${tableKey}" ${currentPage[tableKey] === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-right"></i>
                        </button>
                        <button class="pagination-btn" data-action="last" data-table="${tableKey}" ${currentPage[tableKey] === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                `;

                pagination.querySelectorAll('.pagination-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.dataset.action;
                        const tKey = btn.dataset.table;

                        if (action === 'first') currentPage[tKey] = 1;
                        else if (action === 'prev') currentPage[tKey] = Math.max(1, currentPage[tKey] - 1);
                        else if (action === 'next') currentPage[tKey] = Math.min(totalPages, currentPage[tKey] + 1);
                        else if (action === 'last') currentPage[tKey] = totalPages;

                        renderDocuments();
                    });
                });

                docPage.appendChild(pagination);
            }

            const footer = document.createElement('div');
            footer.className = 'doc-footer';
            footer.innerHTML = '<p>This is an official document. Please ensure all information is accurate.</p>';
            docPage.appendChild(footer);

            container.appendChild(docPage);
        });
    });

    highlightDuplicatePayments();
    updateStats();
}

// ============================================
// STATISTICS
// ============================================
function updateStats() {
    const totalColleges = Object.keys(collegesData).length;
    let totalCourses = 0;
    let totalStudents = 0;

    for (const courses of Object.values(collegesData)) {
        totalCourses += Object.keys(courses).length;
        for (const names of Object.values(courses)) {
            totalStudents += names.length;
        }
    }

    const visibleStudents = getVisibleStudents();
    const checkboxCols = columns.filter(c => c.type === 'checkbox');
    
    const graduatedVisible = visibleStudents.filter(s => isGraduated(s.id));
    let completed = 0;
    let pending = 0;
    let totalChecks = 0;
    let maxChecks = graduatedVisible.length * checkboxCols.length;

    graduatedVisible.forEach(s => {
        const data = checklistData[s.id] || {};
        const checked = Object.values(data).filter(v => v === true).length;
        const total = checkboxCols.length;

        totalChecks += checked;
        if (checked === total) completed++;
        else if (checked > 0) pending++;
    });

    document.getElementById('totalColleges').textContent = totalColleges;
    document.getElementById('totalCourses').textContent = totalCourses;

    const studentsNum = document.getElementById('totalStudents');
    const studentsLabel = studentsNum ? studentsNum.nextElementSibling : null;
    const studentsCard = document.getElementById('studentsStatCard');

    if (studentsCardMode === 'filtered' && studentsNum) {
        studentsNum.textContent = visibleStudents.length;
        if (studentsLabel) studentsLabel.textContent = 'Showing';
        if (studentsCard) {
            studentsCard.classList.add('showing-filtered');
            studentsCard.classList.remove('showing-total');
        }
    } else if (studentsNum) {
        studentsNum.textContent = totalStudents;
        if (studentsLabel) studentsLabel.textContent = 'Students';
        if (studentsCard) {
            studentsCard.classList.add('showing-total');
            studentsCard.classList.remove('showing-filtered');
        }
    }

    const percent = maxChecks > 0 ? Math.round((totalChecks / maxChecks) * 100) : 0;
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('progressCircle').setAttribute('stroke-dasharray', `${percent}, 100`);
}

// ============================================
// CASCADING DROPDOWN POPULATION
// ============================================
function getFilteredStudentsBase() {
    let collegesToShow = Object.entries(collegesData);
    if (selectedCollege) {
        collegesToShow = collegesToShow.filter(([college]) => college === selectedCollege);
    }

    const baseStudents = [];
    collegesToShow.forEach(([college, courses]) => {
        let coursesToShow = Object.entries(courses);
        if (selectedCourse) {
            coursesToShow = coursesToShow.filter(([course]) => course === selectedCourse);
        }
        coursesToShow.forEach(([course, names]) => {
            const courseStudents = allStudents.filter(s => s.college === college && s.course === course);
            baseStudents.push(...courseStudents);
        });
    });
    return baseStudents;
}

function populateDropdowns() {
    const collegeSelect = document.getElementById('collegeSelect');
    const courseSelect = document.getElementById('courseSelect');

    const prevCollege = selectedCollege;
    const prevCourse = selectedCourse;

    collegeSelect.innerHTML = '<option value="">All Colleges</option>';
    Object.keys(collegesData).sort().forEach(college => {
        const option = document.createElement('option');
        option.value = college;
        option.textContent = college;
        collegeSelect.appendChild(option);
    });

    if (prevCollege && collegesData[prevCollege]) {
        collegeSelect.value = prevCollege;
        selectedCollege = prevCollege;
    }

    courseSelect.innerHTML = '<option value="">All Courses</option>';
    if (selectedCollege && collegesData[selectedCollege]) {
        Object.keys(collegesData[selectedCollege]).sort().forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseSelect.appendChild(option);
        });
    }

    if (prevCourse && selectedCollege && collegesData[selectedCollege] && collegesData[selectedCollege][prevCourse]) {
        courseSelect.value = prevCourse;
        selectedCourse = prevCourse;
    } else {
        selectedCourse = '';
    }

    populateSignatureFilters();
    updateTopSubtitle();
}

function updateTopSubtitle() {
    const subtitle = document.getElementById('topSubtitle');
    if (selectedCollege && selectedCourse) {
        subtitle.textContent = `${selectedCollege} — ${selectedCourse}`;
    } else if (selectedCollege) {
        subtitle.textContent = selectedCollege;
    } else if (selectedCourse) {
        subtitle.textContent = selectedCourse;
    } else {
        subtitle.textContent = 'All Colleges — All Courses';
    }
}

// ============================================
// SEARCH & FILTERS
// ============================================
function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = {};
        renderDocuments();
    });
}

function setupCollegeCourseListeners() {
    const collegeSelect = document.getElementById('collegeSelect');
    const courseSelect = document.getElementById('courseSelect');
    if (!collegeSelect || !courseSelect) return;

    collegeSelect.addEventListener('change', (e) => {
        selectedCollege = e.target.value;
        selectedCourse = '';
        selectedSignatureDate = '';
        selectedSignatureMonth = '';
        currentPage = {};

        courseSelect.innerHTML = '<option value="">All Courses</option>';
        if (selectedCollege && collegesData[selectedCollege]) {
            Object.keys(collegesData[selectedCollege]).sort().forEach(course => {
                const option = document.createElement('option');
                option.value = course;
                option.textContent = course;
                courseSelect.appendChild(option);
            });
        }

        populateSignatureFilters();
        updateTopSubtitle();
        renderDocuments();
        updateStats();
    });

    courseSelect.addEventListener('change', (e) => {
        selectedCourse = e.target.value;
        selectedSignatureDate = '';
        selectedSignatureMonth = '';
        currentPage = {};

        populateSignatureFilters();
        updateTopSubtitle();
        renderDocuments();
        updateStats();
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = {};
            renderDocuments();
        });
    });
}

function setupGraduationStatusFilter() {
    document.querySelectorAll('.grad-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.grad-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            graduationStatusFilter = btn.dataset.gradFilter;
            currentPage = {};
            renderDocuments();
            updateStats();
        });
    });
}

// ============================================
// ACCORDION SIDEBAR
// ============================================
function setupAccordion() {
    document.querySelectorAll('.accordion-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const content = document.getElementById(targetId);
            const isOpen = content.classList.contains('open');
            
            if (isOpen) {
                content.classList.remove('open');
                toggle.classList.remove('active');
            } else {
                content.classList.add('open');
                toggle.classList.add('active');
            }
        });
    });
}

// ============================================
// SIDEBAR
// ============================================
function setupSidebar() {
    const toggle = document.getElementById('menuToggle');
    const close = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        if (window.innerWidth <= 1023) {
            openSidebar();
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    });

    close.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// ============================================
// FULLSCREEN
// ============================================
function setupFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showToast('Fullscreen not supported: ' + err.message, 'error');
            });
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        }
    });
}

// ============================================
// EXCEL UPLOAD
// ============================================
function setupExcelUpload() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('excelUpload');
    const uploadActions = document.getElementById('uploadActions');
    const uploadFilename = document.getElementById('uploadFilename');
    const uploadToSheetBtn = document.getElementById('uploadToSheetBtn');

    uploadBox.addEventListener('click', () => fileInput.click());

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleExcelFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleExcelFile(e.target.files[0]);
        }
    });

    function handleExcelFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
                    const row = jsonData[i];
                    if (row && row.some(cell => 
                        String(cell).toLowerCase().includes('full name') ||
                        String(cell).toLowerCase().includes('campus') ||
                        String(cell).toLowerCase().includes('program')
                    )) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    showToast('Could not find headers in Excel file', 'error');
                    return;
                }

                const headers = jsonData[headerRowIndex].map(h => String(h).trim().toLowerCase());
                const campusIdx = headers.findIndex(h => h.includes('campus'));
                const programIdx = headers.findIndex(h => h.includes('program'));
                const fullNameIdx = headers.findIndex(h => h.includes('full name'));
                const lastNameIdx = headers.findIndex(h => h.includes('last'));
                const firstNameIdx = headers.findIndex(h => h.includes('first'));
                const middleNameIdx = headers.findIndex(h => h.includes('middle'));

                if (fullNameIdx === -1) {
                    showToast('FULL NAME column not found in Excel', 'error');
                    return;
                }

                const parsedData = [];
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;
                    if (!row[fullNameIdx]) continue;

                    parsedData.push({
                        no: row[0] || i - headerRowIndex,
                        campus: campusIdx >= 0 ? (row[campusIdx] || 'Unknown Campus') : 'Unknown Campus',
                        program: programIdx >= 0 ? (row[programIdx] || 'Unknown Program') : 'Unknown Program',
                        lastName: lastNameIdx >= 0 ? (row[lastNameIdx] || '') : '',
                        firstName: firstNameIdx >= 0 ? (row[firstNameIdx] || '') : '',
                        middleName: middleNameIdx >= 0 ? (row[middleNameIdx] || '') : '',
                        fullName: row[fullNameIdx]
                    });
                }

                uploadedExcelData = parsedData;
                uploadFilename.textContent = `${file.name} (${parsedData.length} students)`;
                uploadActions.style.display = 'block';
                showToast(`Parsed ${parsedData.length} students from Excel`, 'success');

            } catch (err) {
                console.error(err);
                showToast('Error parsing Excel file: ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    uploadToSheetBtn.addEventListener('click', async () => {
        if (!uploadedExcelData || uploadedExcelData.length === 0) {
            showToast('No data to upload', 'warning');
            return;
        }

        if (!CONFIG.GAS_ENDPOINT) {
            collegesData = {};
            uploadedExcelData.forEach(row => {
                const campus = row.campus;
                const program = row.program;
                const fullName = row.fullName;

                if (!collegesData[campus]) collegesData[campus] = {};
                if (!collegesData[campus][program]) collegesData[campus][program] = [];
                collegesData[campus][program].push(fullName);
            });

            saveDataLocal();
            allStudents = getAllStudents();
            renderDocuments();
            populateDropdowns();
            uploadActions.style.display = 'none';
            uploadedExcelData = null;
            showToast('Data saved locally. Configure GAS endpoint to sync to Google Sheets.', 'success');
            return;
        }

        await uploadExcelToSheets(uploadedExcelData);
        uploadActions.style.display = 'none';
        uploadedExcelData = null;
    });
}

// ============================================
// SAVE & SYNC
// ============================================
function setupSaveAndSync() {
    const saveBtn = document.getElementById('saveBtn');
    const syncBtn = document.getElementById('syncBtn');

    saveBtn.addEventListener('click', async () => {
        await saveChecklistToSheets();
    });

    syncBtn.addEventListener('click', async () => {
        if (!CONFIG.GAS_ENDPOINT) {
            showToast('No server configured. Set GAS endpoint in localStorage.', 'warning');
            return;
        }
        await loadDataFromSheets();
        allStudents = getAllStudents();
        renderDocuments();
        populateDropdowns();
    });
}

// ============================================
// LOADING OVERLAY
// ============================================
function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = text;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// ============================================
// PRINT MODE - PRINT ALL FILTERED PAGES
// ============================================

function enterPrintMode() {
    isPrintMode = true;
    document.body.classList.add('print-mode-active');
    renderDocuments();
}

function exitPrintMode() {
    isPrintMode = false;
    document.body.classList.remove('print-mode-active');
    renderDocuments();
}

function handlePrint() {
    // Save current scroll position
    const scrollPos = window.scrollY;
    
    enterPrintMode();
    
    // Small delay to let DOM render, then print
    setTimeout(() => {
        window.print();
        
        // Restore after print dialog closes
        setTimeout(() => {
            exitPrintMode();
            window.scrollTo(0, scrollPos);
        }, 100);
    }, 150);
}

// ============================================
// WORD DOCUMENT GENERATION
// ============================================
function setupWordExport() {
    const wordBtn = document.getElementById('downloadWordBtn');
    if (wordBtn) {
        wordBtn.addEventListener('click', generateWordDocument);
    }
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', handlePrint);
    }
}

async function generateWordDocument() {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = 'Generating Word Document...';
    overlay.classList.add('active');

    try {
        const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, 
                WidthType, AlignmentType, BorderStyle, PageOrientation, 
                convertInchesToTwip } = docx;

        const pageWidth = convertInchesToTwip(13);
        const pageHeight = convertInchesToTwip(8.5);
        const margin = convertInchesToTwip(0.35);

        const borderStyle = {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "000000",
        };
        const cellBorders = {
            top: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
            right: borderStyle,
        };

        function headerCell(text, options = {}) {
            const { rowSpan = 1, colSpan = 1, width, bold = true, fontSize = 16 } = options;
            const lines = text.split('\n');
            const paragraphs = lines.map(line => 
                new Paragraph({
                    children: [new TextRun({ text: line, bold, size: fontSize, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 0, before: 0, line: 240 },
                })
            );

            return new TableCell({
                children: paragraphs,
                rowSpan,
                columnSpan: colSpan,
                borders: cellBorders,
                verticalAlign: "center",
                width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            });
        }

        function emptyHeaderCell(width) {
            return new TableCell({
                children: [new Paragraph({ children: [] })],
                borders: cellBorders,
                width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            });
        }

        function bodyCheckCell(studentId, colKey, width) {
            const checked = isChecked(studentId, colKey);
            return new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: checked ? "✓" : "", 
                        bold: true, 
                        size: 18,
                        color: "1a5f2a",
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.CENTER,
                })],
                borders: cellBorders,
                verticalAlign: "center",
                width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            });
        }

        const sections = [];

        let collegesToExport = Object.entries(collegesData);
        if (selectedCollege) {
            collegesToExport = collegesToExport.filter(([college]) => college === selectedCollege);
        }

        collegesToExport.forEach(([college, courses]) => {
            let coursesToExport = Object.entries(courses);
            if (selectedCourse) {
                coursesToExport = coursesToExport.filter(([course]) => course === selectedCourse);
            }

            coursesToExport.forEach(([course, names]) => {
                const courseStudents = allStudents.filter(s => 
                    s.college === college && s.course === course
                );

                if (courseStudents.length === 0) return;

                const headerRow1 = new TableRow({
                    children: [
                        headerCell("NAME OF STUDENTS", { rowSpan: 3, width: 13 }),
                        headerCell("ACCOMPLISHED FORMS", { colSpan: 4, width: 22 }),
                        headerCell("ATTENDANCE TO REQUIRED SEMINARS/WEBINARS", { colSpan: 5, width: 35 }),
                        headerCell("RSU CAREER\nPORTAL\nREGISTRATION", { rowSpan: 3, width: 10 }),
                        headerCell("PAYMENT OF\nALUMNI FEE\n(OR NO.)", { rowSpan: 3, width: 10 }),
                        headerCell("SIGNATURE &\nDATE SIGNED", { rowSpan: 3, width: 10 }),
                    ],
                    height: { value: 400, rule: "atLeast" },
                });

                const headerRow2 = new TableRow({
                    children: [
                        headerCell("ALUMNI\nINFO\nSHEET", { width: 5.5, fontSize: 14 }),
                        headerCell("NSRP\nJOBSEEKER\nREG.", { width: 5.5, fontSize: 14 }),
                        headerCell("DATA\nPRIVACY\nCONSENT", { width: 5.5, fontSize: 14 }),
                        headerCell("WAIVER", { width: 5.5, fontSize: 13 }),
                        headerCell("JOB ORIENTATION &\nPLACEMENT SEMINAR", { colSpan: 2, width: 14, fontSize: 14 }),
                        headerCell("JOB FAIR\nSIMULATION", { width: 7, fontSize: 14 }),
                        headerCell("LABOR EDUCATION FOR\nGRADUATING STUDENTS", { colSpan: 2, width: 14, fontSize: 14 }),
                    ],
                    height: { value: 500, rule: "atLeast" },
                });

                const headerRow3 = new TableRow({
                    children: [
                        emptyHeaderCell(5.5),
                        emptyHeaderCell(5.5),
                        emptyHeaderCell(5.5),
                        emptyHeaderCell(5.5),
                        headerCell("ATTEND.", { width: 7, fontSize: 14 }),
                        headerCell("EVAL.\nFORM", { width: 7, fontSize: 14 }),
                        headerCell("PARTIC.", { width: 7, fontSize: 14 }),
                        headerCell("ATTEND.", { width: 7, fontSize: 14 }),
                        headerCell("EVAL.\nFORM", { width: 7, fontSize: 14 }),
                        emptyHeaderCell(10),
                        emptyHeaderCell(10),
                        emptyHeaderCell(10),
                    ],
                    height: { value: 300, rule: "atLeast" },
                });

                const bodyRows = courseStudents.map(student => {
                    const nameParts = student.name.split(',');
                    const surname = nameParts[0];
                    const restName = nameParts.length > 1 ? ',' + nameParts.slice(1).join(',') : '';

                    const cells = [
                        new TableCell({
                            children: [new Paragraph({
                                children: [
                                    new TextRun({ text: student.courseIndex + " ", size: 14, font: "Times New Roman" }),
                                    new TextRun({ text: surname, bold: true, size: 16, font: "Times New Roman" }),
                                    new TextRun({ text: restName, size: 16, font: "Times New Roman" })
                                ],
                            })],
                            borders: cellBorders,
                            verticalAlign: "center",
                            width: { size: 13, type: WidthType.PERCENTAGE },
                        }),
                        bodyCheckCell(student.id, 'alumni_sheet', 5.5),
                        bodyCheckCell(student.id, 'nsrp', 5.5),
                        bodyCheckCell(student.id, 'privacy', 5.5),
                        bodyCheckCell(student.id, 'yearbook', 5.5),
                        bodyCheckCell(student.id, 'job_orient_attend', 7),
                        bodyCheckCell(student.id, 'job_orient_eval', 7),
                        bodyCheckCell(student.id, 'job_fair', 7),
                        bodyCheckCell(student.id, 'labor_attend', 7),
                        bodyCheckCell(student.id, 'labor_eval', 7),
                        bodyCheckCell(student.id, 'rsu_portal', 10),
                        new TableCell({
                            children: [new Paragraph({ 
                                children: [new TextRun({ 
                                    text: (checklistData[student.id] && checklistData[student.id]['payment']) || "", 
                                    size: 14, 
                                    font: "Times New Roman" 
                                })] 
                            })],
                            borders: cellBorders,
                            verticalAlign: "center",
                            width: { size: 10, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [new Paragraph({ 
                                children: [new TextRun({ 
                                    text: (checklistData[student.id] && checklistData[student.id]['signature']) || "", 
                                    size: 14, 
                                    font: "Times New Roman" 
                                })] 
                            })],
                            borders: cellBorders,
                            verticalAlign: "center",
                            width: { size: 10, type: WidthType.PERCENTAGE },
                        }),
                    ];

                    return new TableRow({
                        children: cells,
                        height: { value: 320, rule: "atLeast" },
                        cantSplit: true,
                    });
                });

                sections.push({
                    properties: {
                        page: {
                            width: pageWidth,
                            height: pageHeight,
                            margin: {
                                top: margin,
                                right: margin,
                                bottom: margin,
                                left: margin,
                            },
                            orientation: PageOrientation.LANDSCAPE,
                        },
                    },
                    children: [
                        new Paragraph({
                            children: [new TextRun({ 
                                text: "CHECKLIST OF REQUIREMENTS FOR CLEARANCE SIGNING", 
                                bold: true, 
                                size: 24,
                                font: "Times New Roman",
                                caps: true,
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 60 },
                        }),
                        new Paragraph({
                            children: [new TextRun({ 
                                text: course, 
                                bold: true, 
                                italics: true,
                                size: 22,
                                font: "Times New Roman",
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 40 },
                        }),
                        new Paragraph({
                            children: [new TextRun({ 
                                text: college, 
                                bold: true, 
                                size: 20,
                                font: "Times New Roman",
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 },
                        }),
                        new Table({
                            rows: [headerRow1, headerRow2, headerRow3, ...bodyRows],
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            layout: "fixed",
                        }),
                        new Paragraph({
                            children: [new TextRun({ 
                                text: "This is an official document. Please ensure all information is accurate.", 
                                italics: true,
                                size: 16,
                                color: "666666",
                                font: "Times New Roman",
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200 },
                        }),
                    ],
                });
            });
        });

        const doc = new Document({
            sections: sections,
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "Clearance_Checklist_Multi_Course.docx");

        showToast('Word document downloaded!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Error generating document: ' + error.message, 'error');
    } finally {
        overlay.classList.remove('active');
        document.getElementById('loadingText').textContent = 'Loading...';
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'p') {
                e.preventDefault();
                handlePrint();
            }
            if (e.key === 's') {
                e.preventDefault();
                document.getElementById('saveBtn').click();
            }
            if (e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        }
        if (e.key === 'F11') {
            e.preventDefault();
            document.getElementById('fullscreenBtn').click();
        }
    });
}

// ============================================
// EXCEL TEMPLATE DOWNLOAD
// ============================================
function setupExcelTemplateDownload() {
    const btn = document.getElementById('downloadExcelTemplateBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        try {
            const headers = ['NO', 'Campus', 'Program', 'Last Name', 'First Name', 'Middle Name', 'FULL NAME'];
            const data = [
                headers,
                [1, 'College of Education', 'Bachelor of Elementary Education', 'DELA CRUZ', 'JUAN', 'M', 'DELA CRUZ, Juan M.'],
                [2, 'College of Engineering', 'Bachelor of Science in Civil Engineering', 'SANTOS', 'MARIA', 'L', 'SANTOS, Maria L.']
            ];

            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Template');

            const wscols = headers.map(() => ({ wch: 22 }));
            ws['!cols'] = wscols;

            XLSX.writeFile(wb, 'Clearance_Checklist_Template.xlsx');
            showToast('Excel template downloaded!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error generating template: ' + err.message, 'error');
        }
    });
}

// ============================================
// GENERATE REPORT (UI ONLY)
// ============================================
function setupGenerateReport() {
    const btn = document.getElementById('generateReportBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            showToast('Generate Report feature coming soon!', 'warning');
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLogin();
});

async function completeInitialization() {
    initData();
    updateDuplicatePayments();

    if (Object.keys(collegesData).length > 0) {
        allStudents = getAllStudents();
        renderDocuments();
        populateDropdowns();
    } else {
        renderDocuments();
    }

    if (CONFIG.GAS_ENDPOINT) {
        try {
            await loadDataFromSheets();
            allStudents = getAllStudents();
            renderDocuments();
            populateDropdowns();
        } catch (e) {
            console.log('Could not sync from server on load:', e.message);
        }
    }

    const setupTasks = [
        { fn: setupSearch, name: 'Search' },
        { fn: setupFilters, name: 'Filters' },
        { fn: setupGraduationStatusFilter, name: 'Graduation Status Filter' },
        { fn: setupAccordion, name: 'Accordion' },
        { fn: setupSidebar, name: 'Sidebar' },
        { fn: setupFullscreen, name: 'Fullscreen' },
        { fn: setupExcelUpload, name: 'Excel Upload' },
        { fn: setupSaveAndSync, name: 'Save & Sync' },
        { fn: setupExcelTemplateDownload, name: 'Excel Template' },
        { fn: setupKeyboardShortcuts, name: 'Keyboard Shortcuts' },
        { fn: setupLogout, name: 'Logout' },
        { fn: setupCollegeCourseListeners, name: 'College/Course Listeners' },
        { fn: setupSidebarCollapse, name: 'Sidebar Collapse' },
        { fn: setupStudentsCard, name: 'Students Card' },
        { fn: setupSignatureFilters, name: 'Signature Filter Events' },
        { fn: setupWordExport, name: 'Word Export & Print' },
        { fn: setupGraduationPopupGlobalListeners, name: 'Graduation Popup' },
        { fn: setupGenerateReport, name: 'Generate Report' }
    ];

    setupTasks.forEach(task => {
        try {
            if (typeof task.fn === 'function') {
                task.fn();
            } else {
                console.warn('Setup function not found:', task.name);
            }
        } catch (err) {
            console.error('Failed to initialize', task.name + ':', err.message);
        }
    });

    setTimeout(() => {
        if (Object.keys(collegesData).length === 0) {
            showToast('Welcome! Upload an Excel file or configure Google Sheets to get started.', 'success');
        } else if (!CONFIG.GAS_ENDPOINT) {
            showToast('Welcome! Data loaded from local storage. Set GAS endpoint to sync.', 'warning');
        } else {
            showToast('Welcome! Data loaded. Ctrl+S to save.', 'success');
        }
    }, 800);
}
