# 💪 Workout Tracker

A React Native (Expo) iOS workout tracking app with Supabase backend, exercise search, smart weight suggestions, and AI-powered workout plans.

## Features

- **Auth**: Sign up & login via Supabase Auth
- **Log Workouts**: Exercise name, sets, reps, weight
- **Exercise Search**: Search via API Ninjas API
- **Smart Weight Suggestions**: Auto-suggest based on your last workout
- **History**: View past workouts with pull-to-refresh
- **Daily Reminders**: Local push notifications
- **AI Chat**: Generate a workout plan based on your goals
- **Polished UI**: Clean, modern iOS-native feel

## Prerequisites

- **Node.js** ≥ 18
- **Expo CLI**: `npm install -g expo-cli` (or use `npx expo`)
- **iOS Simulator** (Xcode) or **Expo Go** app on your iPhone
- A **Supabase** project (free tier works)
- An **API Ninjas** account for exercise search (optional)

## Quick Start

### 1. Install dependencies

```bash
cd workout-tracker
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_NINJAS_KEY=your-api-ninjas-key
```

### 3. Set up Supabase database

In your Supabase dashboard → SQL Editor, run each migration file in order:

1. `supabase/migrations/001_create_users.sql`
2. `supabase/migrations/002_create_workout_logs.sql`
3. `supabase/migrations/003_create_user_goals.sql`
4. `supabase/migrations/004_rls_policies.sql`

### 4. Run the app

```bash
# Start Expo dev server
npx expo start

# Then press:
#   i → open iOS Simulator
#   a → open Android emulator
#   Scan QR → open in Expo Go on physical device
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # Colors, spacing, config
├── hooks/            # Custom React hooks
├── navigation/       # React Navigation setup
├── screens/          # Screen components
├── services/         # API & backend services
├── types/            # TypeScript interfaces
└── utils/            # Helper functions
```

## Tech Stack

- **React Native** + **Expo SDK 52**
- **TypeScript**
- **React Navigation 7** (native-stack + bottom-tabs)
- **Supabase** (Auth + PostgreSQL + RLS)
- **Expo Notifications**
- **Axios** + API Ninjas

## License

MIT