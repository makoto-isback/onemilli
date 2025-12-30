# Telegram Lottery Mini App

A fully off-chain lottery system built as a Telegram Mini App with custodial KYAT currency management.

## 🎯 Overview

This is a Telegram Mini App that implements a lottery system where users can bet using KYAT tokens. The system is completely off-chain with manual deposits and withdrawals handled through support.

### Key Features

- **Off-chain lottery**: No blockchain integration, fully server-controlled
- **KYAT currency**: Virtual currency stored only in database
- **Telegram authentication**: Secure login via Telegram Web App
- **Automatic rounds**: 1-hour rounds with random winner selection
- **Manual deposits/withdrawals**: Support-assisted financial operations
- **Mobile-first UI**: Optimized for Telegram's mobile interface

## 🧠 System Architecture

### KYAT Currency Rules

KYAT exists ONLY in the database and is updated through:
- Admin credit (deposits)
- Admin debit (withdrawals)
- User bets (deducted immediately)
- Lottery winnings (credited automatically)

### Lottery Logic

- **Single active round** at any time
- **1-hour duration** (configurable)
- **Random winner** selected server-side
- **90% payout** to winner, 10% platform fee
- **Automatic round management** - no admin intervention

### Authentication

- Telegram Web App `initData` verification
- Server-side hash validation
- JWT token issuance
- Protected API routes

## 🏗️ Tech Stack

### Backend
- **Node.js** with **NestJS** framework
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** authentication
- **Schedule module** for automated round management

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **Telegram Web App SDK** for integration
- **Axios** for API communication
- **Mobile-first responsive design**

## 📁 Project Structure

```
telegram-lottery/
├── backend/
│   ├── src/
│   │   ├── auth/           # Telegram authentication
│   │   ├── users/          # User management
│   │   ├── wallet/         # KYAT balance & transactions
│   │   ├── lottery/        # Round & betting logic
│   │   ├── admin/          # Admin operations
│   │   └── prisma/         # Database service
│   ├── prisma/schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main app pages
│   │   ├── telegram.ts     # Telegram integration
│   │   ├── api.ts          # API service layer
│   │   └── main.tsx        # App entry point
│   ├── index.html          # HTML template
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Telegram Bot Token

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd telegram-lottery/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lottery_db"
   JWT_SECRET="your-super-secret-jwt-key"
   TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
   ADMIN_TOKEN="your-admin-token-for-api-access"
   PORT=3000
   ROUND_DURATION_MINUTES=60
   ```

4. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd telegram-lottery/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment (optional):**
   Create `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🎲 Lottery Mechanics

### Round Flow

1. **Round Creation**: Automatic when no active round exists
2. **Betting Phase**: Users place bets (minimum 10 KYAT)
3. **Round End**: Automatic after 1 hour
4. **Winner Selection**: Random bet selection
5. **Payout**: 90% of pool to winner, 10% platform fee
6. **New Round**: Immediately starts after payout

### Betting Rules

- Minimum bet: 10 KYAT
- Bets deducted immediately from balance
- Users can bet multiple times in same round
- All bets are final (no cancellation)

### Winner Selection

- Completely random selection from all bets
- Server-side randomness (Math.random)
- No manipulation possible
- Winner gets 90% of total pool

## 💰 Wallet System

### KYAT Management

- **Balance tracking**: Stored in `kyat_balances` table
- **Transaction logging**: All changes recorded in `transactions` table
- **Atomic operations**: Balance updates with transaction records

### Deposit/Withdrawal

1. User clicks Deposit/Withdraw button
2. Enters amount in prompt
3. Request submitted to backend
4. User redirected to support chat
5. Admin manually processes request
6. Admin uses `/admin/credit` or `/admin/debit` endpoints

## 🔐 Admin API

### Authentication

All admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header.

### Endpoints

#### Credit User
```bash
POST /api/admin/credit
{
  "telegramId": "123456789",
  "amount": 10000,
  "note": "Deposit via bank transfer"
}
```

#### Debit User
```bash
POST /api/admin/debit
{
  "telegramId": "123456789",
  "amount": 5000,
  "note": "Withdrawal request"
}
```

#### Get All Transactions
```bash
GET /api/admin/transactions
Authorization: Bearer <ADMIN_TOKEN>
```

#### Get User Details
```bash
GET /api/admin/user/123456789
Authorization: Bearer <ADMIN_TOKEN>
```

## 🎨 Frontend Features

### Pages

- **Home**: Active round display, betting interface, countdown timer
- **Wallet**: Balance display, transaction history, deposit/withdraw buttons
- **History**: Past lottery rounds and winners

### Components

- **BalanceCard**: Shows current KYAT balance
- **BetPanel**: Round info, betting form, countdown
- **DepositButton**: Triggers deposit request flow
- **WithdrawButton**: Triggers withdrawal request flow

### Mobile Optimization

- Black & white color scheme
- Touch-friendly buttons
- Responsive layout
- Telegram Web App integration

## 🔧 Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `ADMIN_TOKEN`: Secret token for admin API access
- `PORT`: Server port (default: 3000)
- `ROUND_DURATION_MINUTES`: Round duration (default: 60)

#### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000/api)

## 🚀 Deployment

### Backend Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Run database migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start production server:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. Build for production:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder with any static server

### Telegram Bot Setup

1. Create a Telegram bot via @BotFather
2. Set bot token in environment variables
3. Configure webhook or use polling for the bot
4. Set up the Mini App in your bot settings

## 🔒 Security Considerations

- Telegram `initData` hash verification
- JWT token expiration (7 days)
- Admin token for sensitive operations
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM

## 📊 Database Schema

### Core Tables

- **users**: Telegram user information
- **kyat_balances**: User KYAT balances
- **transactions**: All balance changes
- **rounds**: Lottery rounds
- **bets**: Individual bets in rounds

### Key Relationships

- User → KyatBalance (1:1)
- User → Transactions (1:many)
- User → Bets (1:many)
- Round → Bets (1:many)

## 🎯 API Reference

### Authentication
```bash
POST /api/auth/telegram
Content-Type: application/json

{
  "initData": "user=...&auth_date=...&hash=..."
}
```

### Lottery
```bash
GET /api/lottery/round          # Get active round
GET /api/lottery/history        # Get round history
POST /api/lottery/bet           # Place a bet
Authorization: Bearer <JWT_TOKEN>
```

### Wallet
```bash
GET /api/wallet/balance         # Get balance
GET /api/wallet/transactions    # Get transaction history
POST /api/wallet/deposit        # Request deposit
POST /api/wallet/withdraw       # Request withdrawal
Authorization: Bearer <JWT_TOKEN>
```

## 🤝 Support & Contributing

This is a complete, production-ready Telegram Mini App. The system is designed to be:

- **Custodial**: Admin controls all financial operations
- **Off-chain**: No blockchain dependencies
- **Scalable**: PostgreSQL can handle high loads
- **Secure**: Proper authentication and validation
- **Maintainable**: Clean architecture with separation of concerns

For support or questions, please check the code comments and documentation within each file.
