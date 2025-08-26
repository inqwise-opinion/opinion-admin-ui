# Navigation Pane - Opinion Admin UI

The Opinion Admin UI features a comprehensive navigation system designed for optimal user experience and productivity.

## 🎯 Overview

The navigation pane is the primary way to navigate through different sections of the admin interface. It's located on the left side of the screen and provides quick access to all major features.

## ✨ Key Features

### 1. **Collapsible Sidebar**
- **Full Mode**: Shows icons with labels (280px wide)
- **Collapsed Mode**: Shows only icons (64px wide)  
- **Toggle**: Click the menu icon (☰) in the sidebar header
- **Automatic**: Remembers your preference

### 2. **Responsive Design**
- **Desktop**: Fixed sidebar that can be collapsed
- **Mobile/Tablet**: Slide-out drawer activated by hamburger menu
- **Automatic**: Adapts based on screen size

### 3. **Active State Tracking**
- **Visual Feedback**: Current page is highlighted in blue (#324E8D)
- **URL Matching**: Works with nested routes (e.g., `/users/123`)
- **Persistent**: State maintained across page refreshes

### 4. **Accessibility Features**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and roles
- **High Contrast**: Clear visual hierarchy
- **Tooltips**: Show labels when collapsed

## 📋 Available Menu Items

| Icon | Section | Path | Description |
|------|---------|------|-------------|
| 📊 | Dashboard | `/dashboard` | System overview and statistics |
| 👥 | Users | `/users` | User account management |
| 🏢 | Accounts | `/accounts` | Client account management |
| 📊 | Surveys | `/surveys` | Survey creation and management |
| 📚 | Collectors | `/collectors` | Data collection methods |
| 💳 | Billing | `/billing` | Payment processing |
| 📖 | Knowledge Base | `/knowledge-base` | Documentation |
| 📝 | Blog | `/blog` | Content management |
| 📄 | Content | `/content` | Media management |
| ⚙️ | Setup | `/settings` | System configuration |

## 🎮 Usage Guide

### Navigation Basics
1. **Click** any menu item to navigate to that section
2. **Hover** over items to see tooltips (when collapsed)
3. **Use** keyboard Tab/Enter for accessibility

### Collapsing the Sidebar
1. **Click** the menu icon (☰) in the sidebar header
2. **Or** press the keyboard shortcut (implementation dependent)
3. **State** is automatically saved for future visits

### Mobile Usage
1. **Tap** the hamburger menu in the top-left corner
2. **Swipe** from the left edge of the screen
3. **Tap** outside the menu to close it

### User Menu (Top Right)
- **Profile**: Access user profile settings
- **Settings**: Quick access to system settings  
- **Logout**: Securely log out of the system

## 🎨 Visual Design

### Colors (Matching Original JSP)
- **Primary**: #324E8D (Selected state)
- **Hover**: rgba(50, 78, 141, 0.08)
- **Background**: #ECEFF6
- **Text**: #333333
- **Border**: #DEDEDE

### Typography
- **Font**: Arial, Helvetica, sans-serif
- **Size**: 16px (increased from original for better readability)
- **Weight**: Bold for selected items

### Animations
- **Smooth transitions** for collapse/expand (300ms)
- **Hover effects** with subtle color changes
- **Page transitions** maintained by React Router

## 🔧 Technical Implementation

### Components
- **MainLayout.tsx**: Main layout wrapper with navigation
- **MenuItems**: Configured in `constants/index.ts`
- **Icons**: Material-UI icons with consistent styling

### State Management
- **Local State**: Collapse/expand state
- **URL State**: Current page tracking via React Router
- **Persistence**: localStorage for user preferences

### Responsive Breakpoints
- **Desktop**: ≥960px (fixed sidebar)
- **Tablet**: <960px (temporary drawer)
- **Mobile**: <600px (full-width drawer)

## 🚀 Getting Started

To see the navigation in action:

1. **Visit** any page in the admin interface
2. **Try** collapsing/expanding the sidebar
3. **Navigate** between different sections
4. **Test** on mobile/tablet devices
5. **Visit** `/navigation` for a detailed overview

## 💡 Tips & Best Practices

### For Users
- **Bookmark** specific pages for quick access
- **Use** the collapsed mode to maximize content space
- **Learn** keyboard shortcuts for faster navigation
- **Customize** your experience with the collapsible sidebar

### For Developers
- **Add** new menu items in `constants/index.ts`
- **Follow** the existing icon and routing patterns
- **Test** responsive behavior on different screen sizes
- **Maintain** accessibility standards

## 🎯 Demo Page

Visit `/navigation` to see an interactive demonstration of all navigation features, including:

- Feature overview cards
- Complete menu structure
- Usage tips and tricks
- Technical implementation details

---

**Need Help?** The navigation system is designed to be intuitive, but if you need assistance, visit the Knowledge Base section or contact support.
