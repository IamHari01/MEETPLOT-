# Appointment Booking App

## 1. Project Name
MeetPlot - A full-stack Appointment Booking & Scheduling Application.

## 2. Project Description
MeetPlot is a modern and highly optimized appointment scheduling application that allows users to book meetings, view daily schedules, and manage availability through a responsive dashboard. It features a custom hardcoded authentication bypass for easy access, robust calendar slot logic, and real-time timeline visualization. The application is built with Next.js (App Router), styled with Tailwind CSS, and powered by Supabase PostgreSQL for the backend database.

**Key Features:**
- 📅 **Dynamic Slot Generation:** Automatically prevents double-bookings and mandates a 15-minute buffer between meetings.
- ⚡ **Highly Optimized:** Utilizes Data Structures & Algorithms (DSA) principles with React optimizations (`React.memo`, `useMemo`) for blazing fast rendering.
- 🔒 **Custom Authentication:** Simplified ID/Password validations for effortless testing and user creation without strict gateways.
- 📊 **Real-Time Visualizer:** A beautiful visual timeline of booked, buffered, and available time slots.

---

## 3. File Structure
A brief overview of the core project structure:

```text
Appointment_Booking_app/
├── public/                 # Static assets (images, icons)
├── src/                    # Main source code directory
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── api/            # Backend API endpoints (auth, bookings)
│   │   ├── dashboard/      # Main scheduling dashboard interface
│   │   ├── login/          # Custom Authentication UI
│   │   ├── globals.css     # Global Tailwind CSS configurations
│   │   └── page.tsx        # Landing Page
│   ├── components/         # Reusable React components (Navbar, Forms, Lists)
│   │   ├── BookingForm.tsx
│   │   ├── BookingsList.tsx
│   │   └── TimelineVisualizer.tsx
│   └── lib/                # Shared utilities and logic
│       ├── booking/        # Core business logic for slots and availability
│       ├── supabase/       # Supabase client configurations
│       └── types/          # TypeScript definitions and interfaces
├── .env.local              # Local Environment variables
├── next.config.mjs         # Next.js configurations
├── tailwind.config.js      # Tailwind CSS configurations
└── package.json            # Project dependencies and scripts
```

---

## 4. Env File Updation
To connect the application to the Supabase database, you need to set up the environment variables. 
Create a file named `.env.local` in the root directory and add the following keys:

```env
# URL for your Supabase project instance
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Service Role Key for backend database operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# (Optional) Anon Key if you plan to implement client-side features in the future
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: You can find these keys in your Supabase Dashboard under `Project Settings > API`.*

---

## 5. Needed Steps to Get the Project Live
Follow these steps to run the project on your local system:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/IamHari01/Slot_Booking_App.git
   cd Appointment_Booking_app
   ```

2. **Install Dependencies**
   Install the required Node.js packages using npm:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Update the `.env.local` file with your database keys as shown in Step 4.

4. **Start the Development Server**
   Spin up the local server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Deploy to Vercel (Production)**
   - Connect your GitHub repository to [Vercel](https://vercel.com/).
   - Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) in the Vercel project settings.
   - Click "Deploy". The platform will automatically build and publish your optimized application.

---

## 6. Author
**Hari Selva**  
[GitHub Profile](https://github.com/IamHari01)
