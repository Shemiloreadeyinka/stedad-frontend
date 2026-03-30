# Stedad Admin Receiptify — Frontend

A premium admin dashboard for managing staff, products, and sales transactions. Built with React + Vite, styled with Tailwind CSS, and powered by TanStack Query.

---

## Tech Stack

| Layer          | Library                        |
|----------------|--------------------------------|
| Framework      | React 18 + Vite                |
| Styling        | Tailwind CSS (custom design system) |
| Data fetching  | TanStack Query v5              |
| HTTP client    | Axios (with JWT interceptor)   |
| Routing        | React Router v6                |
| Charts         | Recharts                       |
| Icons          | Lucide React                   |
| Notifications  | React Hot Toast                |
| Components     | Headless UI                    |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Your Express backend running on `http://localhost:5000`

### Installation

```bash
# Clone / unzip the project
cd stedad-frontend

# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Edit .env.local → set VITE_API_URL if your backend runs elsewhere

# Start dev server
npm run dev
```

App runs at **http://localhost:3000**. API requests to `/api/*` are proxied to `localhost:5000`.

### Build for production

```bash
npm run build
# Output in /dist — serve with any static host (Vercel, Nginx, etc.)
```

---

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx   # Route + role guard
│   ├── layout/
│   │   └── AppLayout.jsx        # Sidebar shell (desktop + mobile drawer)
│   └── ui/
│       └── index.jsx            # Shared UI: Modal, Skeleton, Badge, EmptyState…
├── lib/
│   ├── api.js                   # Axios instance + all API modules
│   └── utils.js                 # Formatters, helpers, constants
├── pages/
│   ├── LoginPage.jsx            # Staff ID + password login
│   ├── DashboardPage.jsx        # Stats, revenue chart, alerts
│   ├── SalesPage.jsx            # POS — product grid + cart
│   ├── HistoryPage.jsx          # Sales list + receipt viewer/printer
│   ├── StaffPage.jsx            # Staff CRUD + status toggle (Admin only)
│   ├── InventoryPage.jsx        # Product CRUD + stock level bars
│   └── NotFoundPage.jsx         # 404
├── store/
│   ├── auth.jsx                 # Auth context (login, logout, user)
│   └── cart.jsx                 # Cart reducer (items, payment, status)
├── App.jsx                      # Router tree
├── main.jsx                     # QueryClient + Toaster bootstrap
└── index.css                    # Design system (Tailwind layers)
```

---

## Design System

### Color Palette
| Token            | Value     | Usage                        |
|------------------|-----------|------------------------------|
| `obsidian-950`   | `#050403` | Page background              |
| `obsidian-900`   | `#0a0904` | Cards / panels               |
| `receipt-gold`   | `#D4A853` | Primary accent, CTAs         |
| `receipt-warm`   | `#E8C97A` | Hover states                 |
| `status.paid`    | `#22c55e` | Paid badges                  |
| `status.unpaid`  | `#f59e0b` | Unpaid badges                |
| `status.low`     | `#f97316` | Low stock warnings           |

### Typography
- **Display**: DM Serif Display — page headings, logo
- **Body**: DM Sans — all prose and UI
- **Mono**: JetBrains Mono — IDs, amounts, codes, timestamps

### Key CSS classes
```css
.glass-card        /* Frosted glass panel */
.btn-primary       /* Gold CTA button */
.btn-ghost         /* Bordered ghost button */
.btn-danger        /* Red destructive button */
.field             /* Dark input field */
.field-label       /* Uppercase mono label */
.badge-paid        /* Green status pill */
.badge-unpaid      /* Amber status pill */
.badge-low         /* Orange stock pill */
.skeleton          /* Shimmer loading block */
.tr-base / .td-base / .th-base  /* Table utilities */
```

---

## API Integration

All API calls live in `src/lib/api.js`. The Axios instance automatically:
1. Attaches `Authorization: Bearer <token>` from `localStorage`
2. Redirects to `/login` on any `401` response

### Endpoints used
| Module   | Method | Path                              |
|----------|--------|-----------------------------------|
| Auth     | POST   | `/auth/login`                     |
| Auth     | POST   | `/auth/logout`                    |
| Sales    | GET    | `/sales`                          |
| Sales    | POST   | `/sales`                          |
| Sales    | GET    | `/sales/eod`                      |
| Sales    | GET    | `/sales/search-customer?name=`    |
| Sales    | GET    | `/sales/:id/receipt`              |
| Products | GET    | `/products`                       |
| Products | POST   | `/products`                       |
| Products | PUT    | `/products/:id`                   |
| Products | DELETE | `/products/:id`                   |
| Staff    | GET    | `/staff`                          |
| Staff    | POST   | `/staff`                          |
| Staff    | PUT    | `/staff/:id`                      |
| Staff    | PATCH  | `/staff/:id/toggle-status`        |
| Staff    | DELETE | `/staff/:id`                      |

---

## Auth & Role Guards

- JWT is stored in `localStorage` under key `stedad_token`
- User object stored under `stedad_user`
- `ProtectedRoute` redirects unauthenticated users to `/login`
- `ProtectedRoute allowedRoles={['Admin']}` guards the `/staff` route
- Non-Admin users won't see the Staff nav link either

---

## Assumptions & Adaptations

Since the backend schema wasn't provided, the frontend makes these assumptions you may need to align with your actual responses:

| Field assumed          | Where used                         |
|------------------------|------------------------------------|
| `sale.totalAmount`     | `HistoryPage`, `DashboardPage`     |
| `sale.items[].productId` | `SalesPage` cart submission      |
| `product.quantityLeft` | `InventoryPage`, `SalesPage`       |
| `product._id`          | All product references             |
| `staff.fullName`       | `StaffPage`, `AppLayout`           |
| `staff.staffId`        | Login field, `StaffPage`           |
| `eod.totalRevenue`     | `DashboardPage` stats              |
| `eod.transactionCount` | `DashboardPage` stats              |
| `eod.hourlySales`      | `DashboardPage` chart (optional)   |

Adjust field names in `src/lib/utils.js` and in each page's data destructuring as needed.
