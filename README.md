# MedRecall - Medicine Inventory Management & Expiry Alert Dashboard

> **College Web Development Project &bull; Evaluation Weightage: 50 Marks**  
> A lightweight, responsive web application for healthcare dispensaries and community pharmacies to manage medicine stock, track calendar expiry dates, and alert staff to high-risk inventory.

---

## 1. Project Overview

**MedRecall** is a frontend inventory management system built with Vanilla HTML5, CSS3, modern JavaScript (ES6+), and Bootstrap 5. It addresses a real-world pharmaceutical issue: maintaining safe medicine supply chains by automatically tracking shelf life, flagging expired or expiring stocks, and eliminating manual audit errors.

The application operates entirely client-side, utilizing browser `localStorage` for offline persistence and the browser's Fetch API to simulate live pharmaceutical record imports from an external HTTP web service.

---

## 2. Problem Statement

Community clinics, retail pharmacies, and college first-aid centers often struggle with manual ledger logging of pharmaceutical stocks. Critical problems include:
1. **Accidental Dispensation of Expired Drugs**: Poses health risks to patients and regulatory penalties.
2. **Financial Losses from Unnoticed Expiries**: Medicines expire quietly on back shelves without staff realizing they could have been used or returned to distributors in time.
3. **Inefficient Stock Audits**: Manual shelf checks waste hours of clinical staff time.

**MedRecall Solves This By:**
- Categorizing inventory automatically into **Expired**, **Expiring Soon (&le; 30 days)**, and **Safe (&gt; 30 days)**.
- Computing dynamic metrics directly on page load and data change.
- Providing real-time search, multi-criteria filtering, and CSV export for reporting.

---

## 3. Key Features

- **Demonstration Authentication & Session Persistence**: Secure-feel login portal with show/hide password toggle, input validation, and automatic session restoration on page reload using `localStorage`.
- **Dynamic Risk Summary Dashboard**: 4 live metric cards (Total Inventory, Expired, Expiring Soon, Safe) dynamically calculated using JavaScript date math.
- **Full Inventory CRUD**:
  - **Create**: Add new medicines with validation (name, batch, category, quantity, expiry date, notes) and duplicate batch prevention.
  - **Read**: Rendered cleanly in a responsive, styled Bootstrap table with color-coded status badges and days-remaining counters.
  - **Update**: Edit existing medicine records in place with a single click.
  - **Delete**: Remove records with browser confirmation modals (`confirm()`).
- **Live Search & Combined Filtering**: Instant case-insensitive name search combined with expiry status filter (`Expired`, `Expiring Soon`, `Safe`) and category filter (`Tablet`, `Capsule`, `Syrup`, `Injection`, `Other`).
- **External API Integration (Fetch API)**: Genuine HTTP network call to JSONPlaceholder (`https://jsonplaceholder.typicode.com/posts?_limit=5`), transforming remote response payloads into sample demo medicines across all 3 expiry tiers.
- **CSV Data Export**: One-click download of the complete inventory table formatted as a standard comma-separated values (`.csv`) spreadsheet file.
- **XSS-Resistant Safe Rendering**: All user-provided fields are sanitized using HTML entity escaping before injection into the Document Object Model (DOM).

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Structure** | HTML5 | Semantic elements (`<main>`, `<section>`, `<nav>`, `<table>`, `<form>`) |
| **Styling** | CSS3 & Custom Variables | Healthcare theme, soft shadows, hover transitions, status color tokens |
| **UI Framework** | Bootstrap 5.3.3 (CDN) | Responsive grid, cards, table wrappers, badges, and modals |
| **Icons** | Bootstrap Icons 1.11.3 | Healthcare pills, shields, calendar, and UI action symbols |
| **Logic** | Vanilla JavaScript (ES6+) | Date calculations, DOM manipulation, event listeners, array methods |
| **Storage** | Browser `localStorage` | Client-side persistent data storage (no database server required) |
| **Networking** | JavaScript Fetch API | Asynchronous HTTP `GET` request (`async`/`await`) to external REST endpoint |

---

## 5. Project Folder Structure

```text
MedRecall/
│
├── index.html       # Single-page application markup (Login & Dashboard views)
├── style.css        # Custom CSS styles, color tokens, and responsive overrides
├── script.js        # Core logic: Auth, Date Math, CRUD, LocalStorage, API & DOM
├── README.md        # Comprehensive documentation & Viva presentation guide
└── .gitignore       # Git ignore rules for clean repository hygiene
```

---

## 6. How to Run Locally

Because MedRecall is built using pure client-side web standards, **no Node.js, npm install, or database server is required**.

### Method 1: Direct Browser Launch (Easiest)
1. Navigate to the `MedRecall` folder on your computer.
2. Double-click `index.html` (or right-click &rarr; *Open With* &rarr; Google Chrome, Microsoft Edge, or Mozilla Firefox).

### Method 2: Python Local HTTP Server
If testing the Fetch API in an environment with strict local file CORS policies:
```bash
# Open terminal inside the MedRecall directory:
python -m http.server 8000
```
Then visit: `http://localhost:8000` in your browser.

### Method 3: VS Code Live Server
1. Open the `MedRecall` folder in Visual Studio Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

---

## 7. Demo Login Credentials

For demonstration and viva evaluation:

| Field | Value |
|---|---|
| **Email Address** | `admin@medrecall.com` |
| **Password** | `MedRecall123` |

> *Tip: Click the **"Auto Fill"** link on the login card to instantly populate credentials during your viva presentation.*

---

## 8. Technical Deep-Dive & Syllabus Concepts

### A. Calendar Date Calculations & Expiry Logic (Viva Highlight)
A common pitfall in web development is timezone drift when calculating date differences (e.g., UTC parsing causing off-by-one errors). MedRecall solves this with a robust calendar-date normalization algorithm:

```javascript
function calculateDaysRemaining(expiryDateStr) {
  // 1. Explicitly split the 'YYYY-MM-DD' string to isolate year, month, and day
  const parts = expiryDateStr.split('-');
  const expYear = parseInt(parts[0], 10);
  const expMonth = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const expDay = parseInt(parts[2], 10);

  // 2. Instantiate Date object set to local midnight (00:00:00)
  const expiryDate = new Date(expYear, expMonth, expDay, 0, 0, 0, 0);

  // 3. Normalize current time to local midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // 4. Calculate calendar difference in whole days
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
```

#### Classification Rules:
- **`EXPIRED`**: `daysRemaining < 0` (Red badge & row highlight)
- **`EXPIRING SOON`**: `daysRemaining >= 0 && daysRemaining <= 30` (Amber/Warning badge)
- **`SAFE`**: `daysRemaining > 30` (Green badge)

---

### B. Persistent Storage (`localStorage`)
Browser `localStorage` retains key-value pairs across page reloads and browser restarts:
- **`medrecall_medicines`**: JSON stringified array of medicine objects.
- **`medrecall_logged_in`**: Session flag (`'true'`).

**Safe JSON Parsing**:
```javascript
function loadMedicines() {
  try {
    const rawData = localStorage.getItem('medrecall_medicines');
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Data parsing error:', error);
    return [];
  }
}
```

---

### C. Asynchronous HTTP Fetch API Integration
When the user clicks **"Load Sample Data (API)"**, the application performs a genuine asynchronous HTTP GET request:

```javascript
async function loadSampleData() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!response.ok) throw new Error('Network error: ' + response.status);
    const posts = await response.json();
    
    // Transform mock response into realistic medicine models with dynamic relative dates
    // ...
  } catch (error) {
    showNotification('Network Error: Could not connect to API.', 'danger');
  }
}
```
- Implements `async/await` syntax.
- Verifies `response.ok` before processing JSON.
- Provides UI loading state via Bootstrap spinner.
- Gracefully catches network failures without crashing the application.

---

### D. Event Delegation
Instead of attaching separate event listeners to every edit and delete button in hundreds of table rows, a single event listener is attached to the parent `<tbody>`:

```javascript
medicineTableBody.addEventListener('click', (event) => {
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;
  const action = actionBtn.getAttribute('data-action');
  const id = actionBtn.getAttribute('data-id');
  
  if (action === 'edit') editMedicine(id);
  if (action === 'delete') deleteMedicine(id);
});
```

---

## 9. Security & Limitations

### Educational Demonstrations vs. Production Security:
1. **Client-Side Authentication**: The login system demonstrates credential verification and session management via `localStorage`. In a commercial enterprise application, authentication must be verified by an HTTPS backend issuing signed JWTs or HttpOnly session cookies.
2. **Password Security**: Passwords are never saved in `localStorage`.
3. **Storage Boundary**: `localStorage` is scoped to the browser origin and limited to ~5MB. Commercial systems utilize server-side databases (PostgreSQL, MongoDB).
4. **Medical Disclaimer**: MedRecall is an administrative inventory dashboard and does not provide clinical guidance or drug dispensation recommendations.

---

## 10. Future Improvements

1. Integration with a Node.js/Express and MongoDB backend for multi-store synchronization.
2. Web camera barcode / QR code scanning for medicine packaging.
3. Automated email or SMS alert dispatches via Twilio or SendGrid when medicines enter the 30-day window.
4. Role-Based Access Control (RBAC) separating Pharmacists, Inventory Clerks, and Auditors.

---

## 11. Viva Questions & Model Answers

### Q1: Why did you use `localStorage` instead of cookies or a database?
> **Answer**: For a self-contained frontend demonstration, `localStorage` provides persistent client-side storage (~5MB limit) that survives browser refreshes without requiring external database servers or complex backend dependencies. Cookies are designed for server-client transmission (~4KB limit), whereas `localStorage` is purely client-accessible.

### Q2: How did you prevent timezone off-by-one errors when comparing expiry dates?
> **Answer**: Standard date parsing (`new Date("YYYY-MM-DD")`) parses as UTC midnight, which in local timezones (e.g., UTC+5:30) shifts to the previous calendar day. In MedRecall, we explicitly split the year, month, and day integers and construct `Date` objects normalized to local midnight (`00:00:00`), ensuring exact calendar day comparisons regardless of the user's timezone.

### Q3: What is Event Delegation and why did you use it on the inventory table?
> **Answer**: Event delegation is a design pattern where an event listener is placed on a parent container (`<tbody>`) rather than on individual child buttons. Because table rows are generated dynamically from JavaScript, attaching listeners to individual buttons would require re-binding listeners every time the table re-renders. Event delegation leverages DOM event bubbling (`e.target.closest()`) for better memory performance and cleaner code.

### Q4: How does the application prevent Cross-Site Scripting (XSS)?
> **Answer**: Any user input rendered into the DOM is sanitized through an `escapeHtml()` helper function that replaces characters like `<`, `>`, `&`, and `"` with their respective HTML entities. This ensures malicious scripts entered into the medicine name or notes fields cannot execute.

### Q5: How does your Fetch API implementation handle network failures?
> **Answer**: The HTTP call is wrapped in a `try...catch...finally` block. If the network drops or the remote server responds with a non-200 code (`!response.ok`), the error is caught, an alert toast is shown to the user, and the loading spinner is cleanly reset in the `finally` block, leaving the existing inventory intact.

---

## 12. Git Commands for Publishing to GitHub

```bash
# 1. Initialize git repository inside MedRecall
cd MedRecall
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: complete MedRecall medicine inventory & expiry dashboard"

# 4. Set main branch
git branch -M main

# 5. Add remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/your-username/medrecall-medicine-expiry-dashboard.git

# 6. Push to GitHub
git push -u origin main
```
