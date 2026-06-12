# 🛒 MP Store — JSON Server Ecommerce

HTML / CSS / JavaScript ecommerce store with a `json-server` backend.
Features: authentication, admin product management, cart, and **dummy**
JazzCash / EasyPaisa / COD checkout (no real payment gateway integration).

## Features

- **Auth** — Register / Login (users stored in `db.json`), roles: `admin` & `user`
- **Shop** — product grid, search, category filter, price sorting
- **Cart** — per-user cart (localStorage), quantity update, remove
- **Checkout** — delivery details + payment method selection
  - JazzCash / EasyPaisa → simulated payment (validates `03XXXXXXXXX`, fake processing delay)
  - Cash on Delivery
- **Admin Dashboard** — add / edit / delete products, view all customer orders

## Run it

You need **two** things running: the JSON API and a static web server.

```bash
# 1. Install dependencies (one time)
npm install

# 2. Start the JSON API (terminal 1)
npm run server      # → http://localhost:3000

# 3. Start the website (terminal 2)
npm run web         # → http://localhost:5500
```

Then open **http://localhost:5500** in your browser.

> Tip: You can also open via VS Code "Live Server" extension instead of `npm run web`.
> Just keep `npm run server` running for the API.

## Demo accounts

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@store.com   | admin123   |
| User  | user@store.com    | user123    |

## Project structure

```
index.html      → Shop (products)
login.html      → Login
register.html   → Register
cart.html       → Cart
checkout.html   → Checkout + payment
admin.html      → Admin dashboard
db.json         → json-server database (users, products, orders)
css/style.css   → Styles
js/common.js    → API config, auth, cart, navbar, toast helpers
js/auth.js      → Login & register logic
js/shop.js      → Product listing, search, filter
js/cart.js      → Cart page
js/checkout.js  → Checkout + dummy payment
js/admin.js     → Admin product & order management
```

## Notes

- Passwords are stored in plain text in `db.json` — this is a learning project, **not** production-ready.
- Payment is **simulated**: no OTP, no real gateway, no money moves. Online orders are
  marked `Paid (Simulated)` and COD orders `Pending (COD)`.
