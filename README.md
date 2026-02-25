# Donify — Blood Donation Network

A complete, modern frontend-only React application simulating a blood donation platform. Features full role-based access (Donor, Hospital, Admin), realistic workflows, mock data, and localStorage persistence.

## Features

✅ **Authentication & Authorization**
- Role-based login (Donor, Hospital, Admin)
- Input validation and error handling
- Demo accounts for testing

✅ **Donor Module**
- Profile management with blood group and location
- Availability toggle
- View and accept emergency requests
- Consent confirmation workflow
- Points & badge reward system
- Donation history tracking

✅ **Hospital Module**
- Create emergency blood requests
- Smart donor matching with compatibility scoring
- View request lifecycle (Sent → Accepted → In Progress → Completed)
- Dashboard with request statistics

✅ **Admin Module**
- System overview and analytics
- Blood group demand trends
- Top donors leaderboard
- Comprehensive audit logs
- Request lifecycle tracking

✅ **Public Pages**
- Emergency requests directory
- Donor directory with filtering
- Blockchain records (donation history with transaction hashes)

✅ **Advanced Features**
- Real-time notifications panel
- Urgency color-coding
- Auto-expiry of requests after 48 hours
- Responsive mobile-first design
- Professional healthcare brand theme (red/white)

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
cd c:\Users\Win\ 11\Documents\react\donify
npm install
npm start
```

The app will open at `http://localhost:3000`

## Demo Accounts

**Donor:** john@example.com / donor123
**Hospital:** city@hospital.com / hosp123
**Admin:** admin@donify.com / admin123

## Tech Stack

- React 19.2.4
- React Router 7.13.0
- Tailwind CSS (CDN)
- Context API
- localStorage

## Project Structure

```
src/
├── context/AuthContext.js
├── data/mockData.js
├── components/(Navbar, RequestCard, etc.)
├── pages/(Home, Login, Signup, etc.)
└── pages/donor|hospital|admin/
```

## Data Persistence

All data is stored in localStorage under `donify_*` keys. Clear to reset.

## License

MIT
