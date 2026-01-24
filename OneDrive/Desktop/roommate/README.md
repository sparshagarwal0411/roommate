# RoomMate 🏠

A modern, intuitive web application for hostel roommates to seamlessly track shared expenses, split bills fairly, manage finances collaboratively, and streamline hostel living.

---

## 💡 Basic Idea

**RoomMate** solves the age-old problem of managing shared finances in a hostel or shared living space. Living with multiple roommates often leads to:
- Confusion about who paid for what
- Disputes over fair expense splitting
- Difficulty tracking who owes whom
- Lost track of shared bills and settlements

RoomMate provides a **centralized platform** where roommates can:
- **Log all shared expenses** in one place
- **Split bills intelligently** (equally or selectively)
- **Track outstanding debts** with real-time calculations
- **Settle payments** seamlessly and transparently
- **Communicate efficiently** about shared finances

The app eliminates the need for manual calculations, spreadsheets, or awkward money conversations by automating the entire expense-sharing workflow.

---

## 🎯 How It Works

### Step 1: Create or Join a Hostel
- **Owner** creates a hostel and gets a unique 6-digit code
- **Members** join using the code and set their room number
- Everyone is now connected in a shared financial ecosystem

### Step 2: Log Expenses
- Any member can add an expense (e.g., groceries, utilities, dining)
- Specify the category, amount, and who paid
- Choose to split equally among all members or with specific roommates
- The system instantly calculates the impact on everyone's balance

### Step 3: Track Balances
- The **Balance Summary** shows in real-time who owes whom
- Visual indicators (red for owing, green for owed to you) make it clear at a glance
- Monthly history tracks all transactions and helps identify patterns

### Step 4: Settle Debts
- Members can mark payments as received when debts are settled
- All settlements are recorded permanently in the transaction history
- Notifications keep everyone informed about who paid what

### Step 5: Communicate
- **Broadcast messages** to all roommates with important announcements
- **Notifications** alert members of new expenses, payments, and reminders
- **Activity feed** keeps everyone in sync

### Example Scenario
```
Scenario: Groceries Purchase

1. Alice buys groceries for ₹1,000 for the room
2. She logs it in RoomMate, splits equally among 4 roommates (₹250 each)
3. Bob, Charlie, and Dana immediately see they owe ₹250 to Alice
4. When Bob pays Alice ₹250, he marks it as settled in the app
5. Alice receives a notification confirming the payment
6. The balance updates, and Bob's debt is cleared
```

---

## ✨ Core Features

### 💰 Smart Expense Management
- **Flexible Expense Logging**: Track shared costs across multiple categories (food, utilities, groceries, entertainment, transport, shopping)
- **Selective Bill Splitting**: Choose to split expenses equally across all members or with specific roommates
- **Income Tracking**: Record extra funds, refunds, and contributions to adjust the monthly budget
- **Automatic Calculations**: Instantly see who owes whom with real-time balance updates

### 🏘️ Hostel & Room Management
- **Create or Join Hostels**: Generate unique 6-digit codes to invite roommates or join existing hostels
- **Room Assignment**: Track individual room numbers and member assignments
- **Member Management**: Add, remove, or manage roommate information
- **Hostel Ownership**: Manage hostel settings and member permissions

### 📊 Financial Insights
- **Balance Summary**: Visual "Who Owes Whom" overview with red/green status indicators
- **Spending Charts**: Analyze expense trends and category breakdowns
- **Monthly History**: Review past months' transactions and settlements
- **Settlement Tracking**: Mark debts as paid with persistent transaction history
- **Utility Bill Management**: Track utility expenses and split accordingly

### 🔔 Collaboration & Communication
- **Real-time Notifications**: Get instant alerts for new expenses, settlements, and reminders
- **Broadcast Messaging**: Send messages to all roommates directly from the dashboard
- **Activity Feed**: Stay updated on all hostel activities
- **Settlement Updates**: Receive notifications when debts are marked as paid

### 🎨 User Experience
- **Room-Centric Dashboard**: Room numbers and specific roommates prioritized for quick identification
- **Personalized Greeting**: Dynamic welcome message with your name and room information
- **Dark/Light Mode**: Theme toggle for comfortable viewing in any lighting
- **Responsive Design**: Seamless experience on desktop and mobile devices
- **Intuitive Navigation**: Clean UI built with shadcn/ui components

### 🔐 User Control
- **Exit Room**: Leave a room independently while remaining in the hostel
- **Leave Hostel**: Completely exit a hostel with one click
- **Multi-Hostel Support**: Join multiple hostels simultaneously

---

## 🚀 Recent Updates

- **Enhanced Financial Tracking**: Income tracking and selective expense splitting
- **Settlement System**: Mark debts as received with historical tracking
- **Visual Indicators**: Red/green color coding for pending vs settled transactions
- **Personalized Dashboard**: Welcome section with user and room information
- **Broadcast Communications**: Send announcements to all roommates
- **Exit/Leave Controls**: Dedicated buttons for room and hostel management
- **Notification System**: Real-time alerts powered by Supabase subscriptions

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **TypeScript** for type-safe UI development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible, customizable component library
- **Lucide React** for beautiful, consistent icons
- **React Router** for client-side navigation
- **TanStack Query (React Query)** for efficient server state management
- **React Hook Form** with Zod validation for robust forms
- **date-fns** for date manipulation and formatting

### Backend & Database
- **Supabase** (PostgreSQL) for database and real-time subscriptions
- **Supabase Auth** for secure authentication
- **Row-Level Security (RLS)** policies for data protection
- **Real-time Subscriptions** for live updates across clients

### Styling & UI
- **Tailwind CSS** configuration with custom theme
- **PostCSS** for CSS processing
- **ESLint** for code quality

### Deployment
- **Vercel** configuration ready (includes vercel.json)
- **Bun** package manager support

---

## 📂 Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard-related components
│   │   ├── Dashboard.tsx   # Main dashboard container
│   │   ├── BalanceSummary.tsx
│   │   ├── BudgetTracker.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── IncomeForm.tsx
│   │   ├── MembersList.tsx
│   │   ├── MonthlyHistory.tsx
│   │   ├── SpendingCharts.tsx
│   │   ├── UtilityBills.tsx
│   │   ├── NotificationBell.tsx
│   │   └── BroadcastDialog.tsx
│   ├── landing/            # Landing page
│   ├── ui/                 # shadcn/ui components
│   └── [Layout components]
├── hooks/
│   ├── useHostel.ts       # Main data fetching hooks
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── integrations/
│   └── supabase/          # Supabase client config
├── lib/
│   ├── hostel-store.ts    # Local storage utilities
│   └── utils.ts           # Helper functions
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Authentication
│   ├── Lobby.tsx          # Hostel selection/creation
│   ├── ProfileSetup.tsx   # User onboarding
│   └── NotFound.tsx
└── App.tsx                # Route configuration
```

---

## 📊 Database Schema (Key Tables)

### hostels
- `id` (UUID) - Primary key
- `name` (TEXT) - Hostel name
- `code` (TEXT) - Unique 6-digit code
- `owner_id` (UUID) - Owner's user ID
- `monthly_budget` (NUMERIC) - Monthly budget limit
- `room_no` (TEXT) - Optional primary room number
- `created_at` (TIMESTAMP)

### members
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key to hostels
- `profile_id` (UUID) - Link to auth user profile
- `name` (TEXT) - Member name
- `room_no` (TEXT) - Room number
- `created_at` (TIMESTAMP)

### expenses
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key
- `paid_by_member_id` (UUID) - Who paid
- `amount` (NUMERIC) - Expense amount
- `category` (ENUM) - food | groceries | utilities | entertainment | transport | shopping
- `description` (TEXT) - Optional notes
- `split_equally` (BOOLEAN) - Split type
- `participants` (UUID[]) - Array of member IDs if selective split
- `created_at` (TIMESTAMP)

### income
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key
- `amount` (NUMERIC) - Income amount
- `description` (TEXT) - Optional notes
- `created_at` (TIMESTAMP)

### settlements
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key
- `from_member_id` (UUID) - Who owes
- `to_member_id` (UUID) - Who is owed
- `amount` (NUMERIC) - Settlement amount
- `created_at` (TIMESTAMP)

### utility_bills
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key
- `bill_type` (TEXT) - e.g., "electricity", "water"
- `amount` (NUMERIC) - Bill amount
- `month` (TEXT) - Month identifier
- `paid` (BOOLEAN) - Payment status
- `created_at` (TIMESTAMP)

### notifications
- `id` (UUID) - Primary key
- `hostel_id` (UUID) - Foreign key
- `recipient_id` (UUID) - Recipient member ID
- `sender_id` (UUID) - Sender member ID
- `actor_name` (TEXT) - Actor's name
- `type` (ENUM) - bill | payment | reminder | broadcast
- `content` (TEXT) - Notification message
- `is_read` (BOOLEAN) - Read status
- `created_at` (TIMESTAMP)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 16+ or Bun
- A Supabase project (create one at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roommate
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure Supabase**
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   ```bash
   # Using Supabase CLI
   supabase migration up
   ```

5. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Build for Production
```bash
bun run build
# or
npm run build
```

### Preview Production Build
```bash
bun run preview
# or
npm run preview
```

---

## 🔒 Authentication Flow

1. **Landing Page** → Public access
2. **Auth Page** → Email/password authentication via Supabase
3. **Profile Setup** → Create user profile with name
4. **Lobby** → Create a new hostel or join existing one using 6-digit code
5. **Dashboard** → Main app interface for expense and hostel management

---

## 📱 User Workflows

### Creating a Hostel
1. Go to Lobby
2. Click "Create Hostel"
3. Enter hostel name and monthly budget
4. Share the 6-digit code with roommates
5. Invite members via the dashboard

### Joining a Hostel
1. Go to Lobby
2. Click "Join Hostel"
3. Enter the 6-digit code provided by hostel owner
4. Confirm room number and details

### Logging Expenses
1. Navigate to Dashboard
2. Click "Add Expense"
3. Enter amount, category, and description
4. Choose "Split with All" or select specific members
5. Submit to notify roommates

### Settling Debts
1. View the Balance Summary
2. Click "Mark as Paid" on a debt
3. Confirm the settlement
4. Notification sent to creditor

---

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy automatically on push

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests for bug fixes, features, or documentation improvements.

---

Made with ❤️ for hostel life.
