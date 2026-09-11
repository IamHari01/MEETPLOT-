# SlotSync Pro - Production Meeting Booking App

A robust, production-quality meeting slot booking web application that enforces strict business rules, handles concurrent bookings gracefully, and features a clean, responsive, mobile-first interface.

## 🚀 Features

- **Strict Business Rules**: Books meetings only within valid working hours (9:00 AM - 6:00 PM).
- **Mandatory 15-Minute Buffer**: Automatically enforces a 15-minute gap before and after every meeting to prevent back-to-back overlaps.
- **Concurrency & Double Booking Prevention**: Backed by a transactional mutex lock (local) and an atomic SQL function with advisory locks/overlap checks (Supabase/Postgres).
- **Dynamic Availability Visualization**: A live timeline grid from 9:00 AM - 6:00 PM highlighting exactly what slots are Available, Booked, or reserved as Buffer time.
- **Chronological Management**: View active meetings in chronological order and instantly cancel them to immediately restore availability.
- **Responsive & Accessible UX**: Glassmorphism design, real-time validation, disabled submit states, micro-animations, and full mobile support.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database Architecture**: PostgreSQL (via Supabase) and Local Fallback Store
- **Testing**: Vitest for strict domain validation testing

## 🏛 Architecture Overview

The app cleanly separates concerns into layers:
1. **UI Layer**: React Server & Client Components (`src/components/*`) that handle interaction and visual rendering of the schedule.
2. **Business/Domain Layer**: Centralized pure functions in `src/lib/booking/logic.ts` that mathematically determine overlaps, buffer violations, and working hours without depending on external state.
3. **Data/Persistence Layer**: A concurrency-safe adapter `src/lib/db/index.ts` that automatically routes traffic to production Supabase via RPC, or falls back to an isolated JSON file protected by an async mutex lock for instant local development without credentials.
4. **API Layer**: Next.js App Router API Routes (`src/app/api/bookings/route.ts`) bridging the frontend and data layer.

### 🕒 The Booking & Buffer Algorithm

To guarantee the 15-minute buffer, the system evaluates the mathematical condition for any new booking request $[s, e]$ against all existing bookings $[s_i, e_i]$:

A conflict occurs if **BOTH** of these are true:
1. `new_start < existing_end + 15 minutes`
2. `new_end + 15 minutes > existing_start`

This elegantly handles partial overlaps, total overlaps, double bookings, and exact edge cases (e.g., booking ending exactly 15 minutes before the next one starts is explicitly allowed).

## 🗄 Database Schema (PostgreSQL)

Located in `supabase/schema.sql`, the production database uses:
- A `bookings` table with CHECK constraints for valid duration and valid time ranges.
- A `create_booking_atomic` stored procedure utilizing `pg_advisory_xact_lock` and the buffer conflict algorithm above inside an atomic transaction to guarantee no race conditions occur when two users attempt to book simultaneously.

## 💻 Local Setup & Development

You can run the app immediately with zero configuration using the built-in local persistence layer.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Unit Tests**:
   ```bash
   npm test
   ```
   *Runs the Vitest suite covering 20+ edge cases including timezone resilience and boundary violations.*

## 🌍 Environment Variables (Production)

To connect to Supabase in production, add a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```
*Run the `supabase/schema.sql` script in your Supabase SQL Editor before deploying.*

## 🚀 Deployment Instructions

The application is fully prepared for Vercel deployment:
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
4. Deploy!

## 📝 Important Design Decisions

- **Client-Side vs Server-Side Validation**: The frontend prevents invalid selections to provide immediate UX feedback, but the backend/database performs the exact same robust validation autonomously. Do not trust the client!
- **Timezone Resilience**: All times are parsed to ISO 8601 and evaluated mathematically against midnight relative boundaries. Working hours (9 AM - 6 PM) remain consistent regardless of server execution region.
- **`SUBMITS` Button**: As explicitly requested by product requirements, the primary booking button is named **`SUBMITS`**.

## ⚠️ Known Limitations
- The current UI Timeline only visualizes the 9:00 AM - 6:00 PM operating hours window. If a user was mathematically able to book a 6:00 PM - 7:00 PM meeting (which is currently blocked by rules), it would not render.
- The local development datastore uses a JSON file and async mutex lock; it scales well for local testing but is obviously not designed for horizontal production scaling. Provide Supabase credentials for production use!
