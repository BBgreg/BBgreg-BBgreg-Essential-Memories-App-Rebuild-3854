# Essential Memories

A React-based memory management application that helps you remember important dates and events.

## Features

- 🎂 **Memory Management**: Store birthdays, anniversaries, and special dates
- 📅 **Calendar View**: Visualize your memories throughout the year
- 🎯 **Practice Mode**: Test your memory with flashcards
- 🔥 **Streak Tracking**: Build consistency with daily challenges
- 💎 **Premium Features**: Unlimited memories and advanced features

## Tech Stack

- **Frontend**: React 18 + Vite
- **UI**: Tailwind CSS + Framer Motion
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Icons**: React Icons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Setup

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Note

This application handles sensitive user data and payment information. All secrets and API keys are managed through environment variables and secure configuration systems. Never commit sensitive credentials to version control.

## License

Private Project - All Rights Reserved