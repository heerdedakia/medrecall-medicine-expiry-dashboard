# Project Report: MedRecall
## Medicine Inventory Management & Expiry Alert Dashboard

**Academic Domain:** Web Application Development (Client-Side Architecture)  
**Author / Lead:** Heer Dedakia  
**Repository:** [github.com/heerdedakia/medrecall-medicine-expiry-dashboard](https://github.com/heerdedakia/medrecall-medicine-expiry-dashboard)  
**Live Application:** [heerdedakia.github.io/medrecall-medicine-expiry-dashboard](https://heerdedakia.github.io/medrecall-medicine-expiry-dashboard/)  

---

## 1. Executive Summary

**MedRecall** is a lightweight, responsive pharmaceutical inventory tracking application built using pure client-side web technologies (HTML5, CSS3, Vanilla JavaScript ES6+, and Bootstrap 5). 

The application solves a critical problem in clinics, community pharmacies, and hospital dispensaries: **monitoring expiration dates to prevent the accidental distribution of expired drugs and reducing financial waste from overlooked inventory**. 

MedRecall features an automated risk calculation engine that categorizes stock into **Expired**, **Expiring Soon (≤ 30 days)**, and **Safe Stock**, dynamic metric dashboards, full CRUD operations with duplicate prevention, persistent browser storage via `localStorage`, and external REST API integration via the JavaScript `fetch` API.

---

## 2. Problem Statement & Motivation

1. **Patient Safety Risk:** Administering expired pharmaceuticals can cause reduced efficacy, chemical toxicity, and treatment failure.
2. **Financial Loss:** Pharmacies lose substantial capital when medicines expire unnoticed on shelves instead of being prioritized, returned to suppliers, or discounted.
3. **Manual Overhead:** Paper ledgers and static spreadsheets are prone to human calculation errors, especially regarding calendar leap years and month durations.

**MedRecall's Solution:** A clean, automated system that normalizes calendar dates, computes remaining shelf life in real time, and alerts dispensary staff visually through color-coded badges and metric counters.

---

## 3. System Architecture & Data Flow

```text
[User / Pharmacy Staff]
         │
         ▼
[Bootstrap 5 UI (Forms, Tables, Metric Cards)]
         │
         ├── Submits Credentials ──► [Auth Controller] ──► [localStorage Session]
         │
         ├── Adds / Edits Stock  ──► [Validation & Duplicate Check]
         │                                    │
         │                                    ▼
         │                           [Date Math Engine] ──► Computes Days Left
         │                                    │
         │                                    ▼
         ├── Updates Table / Cards ──► [DOM Table Renderer]
         │                                    │
         │                                    ▼
         ├── Persists Data       ──► [localStorage: medrecall_medicines]
         │
         └── Load Sample Data   ──► [Fetch API] ──► [JSONPlaceholder REST API]
```

---

## 4. Presentation Topic Breakdown (Who Speaks on What)

If presenting as a group or team, the project is divided into four natural modules:

### Speaker 1: Overview, Motivation & Authentication
* **Focus Areas:**
  - Real-world context of pharmaceutical inventory auditing.
  - Why standard login systems are needed to protect dispensary records.
  - How demo session management works via `localStorage` (`medrecall_logged_in`).
  - Password visibility toggle using DOM property manipulation (`type="password"` vs `type="text"`).

### Speaker 2: The Expiry Risk Engine & Date Math (Key Technical Feature)
* **Focus Areas:**
  - How date math works in JavaScript without third-party libraries (like Moment.js).
  - The challenge of timezone drift: Why `new Date("YYYY-MM-DD")` causes off-by-one errors and how MedRecall solves it by splitting components (`year`, `month`, `day`) and normalizing both dates to local midnight (`00:00:00`).
  - Status classification boundary rules:
    - **Expired:** Days remaining < 0 (Red badge).
    - **Expiring Soon:** 0 ≤ Days remaining ≤ 30 (Amber badge).
    - **Safe:** Days remaining > 30 (Green badge).

### Speaker 3: CRUD Operations, Input Validation & Search Engine
* **Focus Areas:**
  - **Create & Duplicate Prevention:** Validating required fields, positive integer quantities, and checking that identical batch numbers are not registered twice.
  - **Read & Safe DOM Injection:** Preventing Cross-Site Scripting (XSS) attacks by escaping special characters (`&`, `<`, `>`, `"`) before injecting HTML strings.
  - **Update & Delete:** Dynamic in-place form modification and `confirm()` modal deletion.
  - **Real-Time Filtering:** Combining case-insensitive substring searching with category and status dropdowns using JavaScript `Array.prototype.filter()`.

### Speaker 4: Networking (Fetch API), CSV Export & Architecture
* **Focus Areas:**
  - **Asynchronous HTTP Fetch:** How `async/await` executes non-blocking network calls to JSONPlaceholder (`jsonplaceholder.typicode.com/posts?_limit=5`), handles HTTP status verification (`response.ok`), and manages UI states (spinners and disabled buttons).
  - **CSV Data Export:** Generating programmatic data blobs (`Blob`, `URL.createObjectURL`) to trigger instant client-side file downloads without a backend.
  - **Why localStorage over a Database Server:** Evaluating storage quotas (~5MB origin limit), offline independence, zero-dependency deployment, and fast load speeds for frontend demonstrations.

---

## 5. Technical Implementation Highlights

### A. Calendar Date Normalization Logic
```javascript
function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;

  // Split YYYY-MM-DD directly to prevent UTC conversion skew
  const parts = expiryDateStr.split('-');
  const expYear = parseInt(parts[0], 10);
  const expMonth = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
  const expDay = parseInt(parts[2], 10);

  // Normalize both dates to local midnight (00:00:00)
  const expiryDate = new Date(expYear, expMonth, expDay, 0, 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Divide millisecond difference by milliseconds in one day
  const diffMs = expiryDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
```

### B. Efficient Event Delegation
Instead of attaching separate event handlers to each button across hundreds of dynamically rendered table rows, MedRecall binds a single listener to `<tbody>`:
```javascript
medicineTableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');

  if (action === 'edit') editMedicine(id);
  if (action === 'delete') deleteMedicine(id);
});
```

---

## 6. Live Demonstration Script (Step-by-Step)

1. **Login:** Open `index.html`. Click **"Auto Fill"** → **"Sign In"**. Demonstrate session persistence.
2. **Fetch API:** Click **"Load Sample Data"**. Watch sample pharmaceutical records load into the table and the dashboard metric cards update dynamically.
3. **Form Validation & Add:** Enter a medicine expiring in the past (e.g. `2026-09-15`). Show it gets classified immediately as **Expired** with red styling. Enter another expiring next week to trigger **Expiring Soon**.
4. **Edit & Delete:** Click the pencil icon on any item, edit its quantity, and save changes. Click the trash icon to demonstrate the confirmation prompt.
5. **Real-Time Search:** Type `"Amox"` into the search box to show instant table filtering without page refresh.
6. **Persistence:** Press `F5` to reload the page. Show that the session and all updated inventory records remain preserved.
7. **Export:** Click **"Export CSV"** and open the resulting spreadsheet in Excel.

---

## 7. Viva Questions & Quick Model Answers

| Question | Model Answer |
|---|---|
| **Why not use cookies instead of `localStorage`?** | Cookies have a 4KB limit and are sent in every HTTP request header, causing unnecessary network overhead. `localStorage` provides 5MB of purely client-side storage, ideal for persistent web application data. |
| **How does your app prevent XSS attacks?** | All user inputs inserted into HTML strings pass through an `escapeHtml()` function that converts characters like `<`, `>`, `&`, and `"` into HTML character entities (`&lt;`, `&gt;`, etc.), preventing browser script execution. |
| **What happens if the JSONPlaceholder API is down?** | The fetch call is wrapped in a `try...catch...finally` block. If the request fails, the application displays an error toast, re-enables the button, and leaves the existing inventory intact without crashing. |
| **Why use Event Delegation for table rows?** | When rows are added or re-rendered dynamically, individually attached listeners are destroyed. Event delegation leverages event bubbling up to the static `<tbody>` element, improving memory efficiency and reliability. |
