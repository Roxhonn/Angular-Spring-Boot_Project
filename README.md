# Mandi Connect Platform and Crop Price Prediction - Frontend (Angular)

Replace the old `src` folder of your Angular project with the `src` folder of this zip.
`angular.json`, `package.json` and `public/` stay as they are.

## Run

1. Start the Spring Boot backend (port 8080).
2. In the project folder: `npm install` (only the first time), then `npm start`.
3. Open http://localhost:4200 - you will see the Login page.

The backend address is in `src/app/config.ts`.

## Three portals

| Portal | Login (demo) | Pages |
|--------|--------------|-------|
| Farmer | mobile `9000000001` / `Farmer@123` (or Register as a new farmer) | Crop Prices, Price History, Mandis, Book Slot (+ my bookings) |
| Mandi Officer | `bargarh.officer` / `Officer@123` | My Mandi (bookings, check in / complete), Enter Prices, Crop Prices, Price History |
| Admin | `admin` / `Admin@123` | Admin Panel (numbers, mandis, officers, farmers), Crop Prices, Price History, Mandis |

## How login works in the frontend

- `auth.service.ts` - login, register, logout; keeps the logged-in user in the browser (localStorage)
- `auth.interceptor.ts` - adds the token to every request; logs out when the server says the token is not valid
- `guards.ts` - `roleGuard('FARMER')` etc. open a page only for the right role
- `app.ts` - top bar shows the menu of the logged-in role

## Folder structure

- `app/api.service.ts` - all calls to the backend
- `app/models.ts` - data types
- `app/pages/` - one file per page
- `app/utils.ts`, `app/config.ts`, `app/odisha.ts` - small helpers
- `styles.css` - styles of the whole project
