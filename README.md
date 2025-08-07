# Stockfolio - Social Stock Portfolio Manager

## Overview

Stockfolio is a comprehensive stock portfolio management platform that combines portfolio tracking with social features, allowing users to manage their investments, research stocks, and connect with other investors. The platform provides detailed stock market data, portfolio analytics, and a social layer for users to follow and learn from other investors' portfolios.

## Features

- **Portfolio Management**: Track your stock investments with real-time performance metrics
- **Social Integration**: Follow other investors and discover their portfolios
- **Stock Research**: Access detailed stock information, historical data, and analytics
- **Performance Tracking**: Monitor your portfolio's performance with interactive charts
- **User Profiles**: Create and customize your investor profile

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - shadcn/ui for accessible, customizable components
  - Radix UI primitives for unstyled, accessible components
- **State Management**: 
  - React Query for server state
  - React Context for global UI state
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Services
- **Stock Market Data API**: [Stockfolio API](https://github.com/alexvarelo/Stockfolio-api) (Custom built)
- **User Management & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Supabase Realtime

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Access to Stockfolio API (or local instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alexvarelo/Stockfolio.Web.git
   cd Stockfolio.Web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=your_api_base_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── api/               # API client and data fetching logic
  ├── assets/            # Static assets (images, fonts, etc.)
  ├── components/        # Reusable UI components
  │   ├── ui/           # Basic UI elements
  │   ├── layout/       # Layout components
  │   ├── navigation/   # Navigation components
  │   └── ...
  ├── hooks/            # Custom React hooks
  ├── lib/              # Library code and utilities
  ├── pages/            # Page components
  ├── styles/           # Global styles and themes
  └── utils/            # Utility functions
```

## Development Guidelines

Please refer to our [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md) for coding standards, component architecture, and best practices.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Supabase](https://supabase.com/) for backend services
- [Vite](https://vitejs.dev/) for the build tooling
