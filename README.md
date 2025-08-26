# Opinion Admin UI

A modern TypeScript React application for the Opinion platform administration dashboard.

## Overview

This is a complete rewrite of the original JSP-based admin interface, built with modern web technologies:

- **React 19** - Modern React with functional components and hooks
- **TypeScript** - Full type safety and enhanced developer experience
- **Material-UI v6** - Modern, accessible UI components
- **React Router v7** - Client-side routing
- **Vite** - Fast development server and build tool
- **Axios** - HTTP client for API communication

## Features

- 📊 **Comprehensive Dashboard** - Real-time statistics and recent activity
- 👥 **User Management** - Full CRUD operations for users
- 🏢 **Account Management** - Company accounts, billing, and subscriptions
- 📋 **Survey Management** - Create and manage surveys and polls
- 💳 **Payment Processing** - Handle billing and payment transactions
- 📈 **Reports & Analytics** - Data visualization and reporting
- 🔧 **System Administration** - System events and health monitoring
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Clean, intuitive interface with Material Design

## Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── layouts/            # Layout components
├── services/           # API services and data layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── hooks/              # Custom React hooks
└── contexts/           # React context providers
```

### Key Components

- **MainLayout**: Primary application layout with navigation
- **Dashboard**: Main dashboard with statistics and activity
- **Service Layer**: API abstraction with mock data support
- **Type System**: Complete TypeScript definitions for all data models

## Environment Configuration

The application supports multiple environments:

- **Development** (`npm run dev`) - Mock API enabled, debugging on
- **Staging** (`npm run dev:staging`) - Staging API, debugging on  
- **Production** (`npm run dev:production`) - Production API, debugging off

### Environment Variables

- `VITE_API_BASE_URL` - API server base URL
- `VITE_ENABLE_MOCK_API` - Enable/disable mock API
- `VITE_ENABLE_DEBUG` - Enable/disable debug logging
- `VITE_ITEMS_PER_PAGE` - Default pagination size

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
npm run dev              # Development server (port 3000)
npm run dev:staging      # Staging mode (port 3001)
npm run dev:production   # Production mode (port 3002)
npm run build            # Production build
npm run build:staging    # Staging build
npm run build:production # Production build
npm run lint             # ESLint checking
npm run lint:fix         # ESLint fixing
npm run type-check       # TypeScript checking
```

## API Integration

### Mock API

For development, the application includes a comprehensive mock API service that simulates the backend:

- **Realistic Data**: Generated mock data for all entities
- **Pagination Support**: Full pagination and filtering
- **Network Simulation**: Realistic delays and error handling
- **Consistent Interface**: Same API as production service

### Real API

When `VITE_ENABLE_MOCK_API=false`, the application connects to the actual backend REST API.

### Data Models

The application includes complete TypeScript definitions for:
- Users and user history
- Accounts and account billing
- Surveys and polls  
- Collectors and responses
- Payments and invoices
- System events and health

## Migration from JSP

This application replaces the original JSP-based admin interface:

### What's Converted

✅ **Dashboard** - Complete with stats cards and data tables  
✅ **Navigation** - Modern sidebar with Material Design  
✅ **Layout System** - Responsive layout with mobile support  
✅ **API Layer** - Modern HTTP client with error handling  
✅ **Type Safety** - Full TypeScript coverage  
✅ **Mock Data** - Comprehensive test data  
✅ **Users Management** - Full CRUD operations with advanced features
✅ **Accounts Management** - Complete account administration with subscription plans

### What's Next
🔲 Survey and poll management  
🔲 Payment and billing interfaces  
🔲 Reports and analytics  
🔲 System administration  
🔲 Authentication system  
🔲 Form validation  
🔲 Data export features  
🔲 Real-time updates  

## Development Guidelines

### Code Style

- Use functional components with hooks
- Implement proper TypeScript typing
- Follow Material-UI design patterns
- Use consistent naming conventions
- Write self-documenting code

### Component Structure

```tsx
// Component imports
import React from 'react';
import { ComponentProps } from '@mui/material';

// Type imports
import { DataType } from '../types';

// Service imports
import apiService from '../services';

// Interface definitions
interface Props {
  // prop definitions
}

// Component implementation
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

export default ComponentName;
```

### Best Practices

- Use proper error boundaries
- Implement loading states
- Handle empty states gracefully
- Follow accessibility guidelines
- Optimize for performance
- Test components thoroughly

## Contributing

When contributing to this project:

1. Follow the existing code patterns
2. Maintain TypeScript strict mode compliance
3. Update types when adding new features
4. Test changes thoroughly
5. Document new functionality

## License

This project is part of the Opinion platform and follows the same MIT license.
