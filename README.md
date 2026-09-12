# MEETPLOT - Modern Scheduling Hub

MEETPLOT is a production-quality, lightning-fast meeting scheduling web application. It features a custom zero-rate-limit authentication system, a premium glassmorphism interface, and a robust booking engine that strictly enforces business rules and prevents double bookings.

## ✨ Key Features

- **Custom Local Authentication**: A built-in, rate-limit-free authentication system (Signup, Login, Forgot Password) tailored for instant MVP usage—no third-party auth restrictions or email confirmations required.
- **Smart Booking Engine**: Automatically restricts meetings to working hours (9:00 AM - 6:00 PM).
- **Mandatory 15-Minute Buffer**: The system mathematically guarantees a 15-minute gap before and after every meeting to prevent back-to-back overlaps.
- **Dynamic Timeline Visualization**: A live, color-coded grid that instantly visualizes Available time, Booked slots, and Buffer blocks.
- **Concurrency Protection**: Backed by a transactional mutex lock to ensure double-bookings are impossible, even if two users book simultaneously.
- **Auto-Synced Profiles**: Your booking name is automatically synced and locked to your login credentials for seamless identity management.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Premium Glassmorphism & Micro-animations)
- **Database**: Zero-config Local JSON Datastore (`data/users.json` & `data/bookings.json`) with Mutex Locks
- **Testing**: Vitest

## 🚀 Getting Started

You can run the app immediately with zero configuration. No external database credentials are required.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can create a new account instantly and access your dashboard!

### 3. Run Unit Tests (Optional)
```bash
npm run test
```
*Runs the Vitest suite covering 20+ edge cases including timezone resilience and boundary violations.*

## 📂 Architecture Overview

1. **Frontend / UI Layer (`src/components/*`)**: 
   - `BookingForm.tsx`: Handles slot calculation and synced user identity.
   - `TimelineVisualizer.tsx`: Renders the visual schedule grid.
   - `Navbar.tsx` & `page.tsx`: Handles seamless authentication state and protected routing.
2. **Business Logic Layer (`src/lib/booking/logic.ts`)**: 
   - Centralized, mathematically-proven pure functions that determine overlap and buffer rules.
3. **Data Layer (`src/lib/db/index.ts` & `data/*`)**: 
   - A concurrency-safe file adapter that uses async mutex locks to safely read and write to `users.json` and `bookings.json` instantly. 
4. **API Routes (`src/app/api/*`)**: 
   - Bridges the client UI and the secure local data layer for both `/auth` and `/bookings`.
