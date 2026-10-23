# MedRecall - Medicine Inventory Management & Expiry Dashboard

MedRecall is a responsive web application designed for small pharmacies and medical dispensaries to maintain medicine stock records, track batch numbers, and monitor upcoming expiration dates.

---

## Features

- **User Authentication**: Simple login system with session persistence via `localStorage`.
- **Expiry Risk Classification**: Automatically categorizes inventory into:
  - **Expired**: Medicines past their expiry date.
  - **Expiring Soon**: Medicines expiring within 30 days.
  - **Safe**: Medicines with more than 30 days of shelf life remaining.
- **Inventory CRUD**:
  - Add new medicines with validation.
  - Edit existing records in place.
  - Delete medicine entries with confirmation.
- **Search & Filters**: Real-time search by medicine name and filtering by expiry status or drug category (Tablet, Capsule, Syrup, Injection, etc.).
- **Fetch API Integration**: Demonstrates asynchronous HTTP requests (`fetch` and `async/await`) by loading sample records from JSONPlaceholder.
- **Data Persistence**: Uses browser `localStorage` to save all inventory data across browser refreshes.
- **CSV Export**: Export all inventory records to a spreadsheet-compatible `.csv` file.

---

## Technologies Used

- **HTML5**: Semantic tags, accessible forms, date inputs.
- **CSS3**: Custom styling, responsive layouts.
- **Bootstrap 5 (CDN)**: Responsive grid, cards, badges, and components.
- **JavaScript (ES6+)**: DOM manipulation, event delegation, array methods, date math, Fetch API.
- **Browser localStorage**: Client-side storage for login sessions and medicine data.

---

## Project Structure

```text
MedRecall/
│
├── index.html       # Markup for Login and Dashboard views
├── style.css        # Custom styles and status badge colors
├── script.js        # Core logic: authentication, CRUD, date math, and API
├── README.md        # Documentation
└── .gitignore       # Git ignore file
```

---

## How to Run

1. Clone or download this repository.
2. Open `index.html` directly in any web browser (Chrome, Edge, Firefox).

### Demo Credentials
- **Email**: `admin@medrecall.com`
- **Password**: `MedRecall123`

---

## Key Logic

### 1. Date Calculation (script.js)
To prevent timezone conversion issues when comparing calendar dates, the application extracts the year, month, and day separately and normalizes both dates to local midnight:

```javascript
function calculateDaysRemaining(expiryDateStr) {
  const parts = expiryDateStr.split('-');
  const expiryDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = expiryDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
```

### 2. Event Delegation
Table edit and delete actions use event delegation on the table body to avoid binding individual event listeners each time the table re-renders:

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

## Author
Developed by **Heer Dedakia** for Web Development Lab.
