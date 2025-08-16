# Packsi Telegram Mini App

A React-based Telegram Mini App with dark/light theme support and Persian/English localization.

## Features

- 🚀 Built with React 18 + TypeScript + Vite
- 📱 Telegram WebApp SDK integration
- 🌙 Dark/Light theme support (follows Telegram theme)
- 🌍 Internationalization (Persian/English)
- 💅 Styled Components for theming
- 📦 Optimized build for Telegram Mini Apps

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts (Telegram, Theme, Language)
├── hooks/          # Custom React hooks
├── locales/        # Translation files and i18n config
├── styles/         # Theme definitions and global styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Telegram Mini App Setup

### 1. Create a Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newbot` command to create a new bot
3. Save the bot token

### 2. Configure Mini App

1. Use `/mybots` command in BotFather
2. Select your bot
3. Go to "Bot Settings" → "Configure Mini App"
4. Set your Mini App URL (where you host the built files)

### 3. Deploy

1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your web server
3. Ensure HTTPS is enabled (required for Telegram Mini Apps)
4. Update the Mini App URL in BotFather

## Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **Telegram WebApp SDK**: Official Telegram Mini App SDK
- **Styled Components**: CSS-in-JS with theme support
- **React i18next**: Internationalization framework
- **RTL Support**: Right-to-left layout for Persian language

## Telegram WebApp Features Used

- User authentication and data access
- Theme detection (light/dark)
- Viewport management
- Closing confirmation
- Integration with Telegram UI

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Telegram Desktop
- Telegram Mobile Apps
