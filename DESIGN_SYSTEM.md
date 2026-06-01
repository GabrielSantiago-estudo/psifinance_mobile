# FinanceFlow - Mobile Design System Documentation

## Overview
A modern, mobile-first financial management UI design system inspired by leading fintech apps like Nubank and PicPay. Built with React, TypeScript, and Tailwind CSS.

---

## 🎨 Design Tokens

### Color Palette

#### Primary Colors
- **Primary**: `#6c5ce7` (Purple) - Main brand color for CTAs and important elements
- **Secondary**: `#a29bfe` (Light Purple) - Secondary actions and accents
- **Background**: `#f8f9fb` (Light Gray) - Main app background
- **Card**: `#ffffff` (White) - Card and surface backgrounds

#### Semantic Colors
- **Success/Income**: `#00b894` (Green) - Positive actions, income indicators
- **Destructive/Expense**: `#ff6b6b` (Red) - Negative actions, expense indicators  
- **Warning**: `#fdcb6e` (Yellow) - Warning states and alerts
- **Muted**: `#e8eaed` (Gray) - Borders, dividers, disabled states

### Typography Scale

- **Title**: 2xl - Used for page headings and large display text
- **Subtitle**: xl - Section headings
- **Body**: base (16px) - Default text size
- **Caption**: sm - Helper text, labels, metadata

### Spacing System
Based on 8px grid:
- **xs**: 4px (0.5rem)
- **sm**: 8px (1rem)  
- **md**: 16px (2rem)
- **lg**: 24px (3rem)
- **xl**: 32px (4rem)

### Border Radius
- **Small**: 12px - Buttons, inputs
- **Medium**: 16px - Cards, smaller components
- **Large**: 24px - Feature cards, modals
- **Extra Large**: 32px - Hero elements

### Shadows
- **Small**: Subtle elevation for cards
- **Medium**: Standard card shadows
- **Large**: Prominent elements like FAB
- **Colored**: Primary color shadows at 30-40% opacity

---

## 🧩 Components

### 1. FinButton
**Purpose**: Primary button component with multiple variants

**Variants**:
- `primary` - Main CTAs (purple with shadow)
- `secondary` - Secondary actions (light purple)
- `outline` - Tertiary actions (bordered)
- `ghost` - Minimal actions (transparent)

**Sizes**: `sm`, `md`, `lg`

**Props**:
```tsx
variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
size?: 'sm' | 'md' | 'lg'
disabled?: boolean
```

**Usage**:
```tsx
<FinButton variant="primary" size="lg">
  Save Transaction
</FinButton>
```

---

### 2. FinInput
**Purpose**: Styled text input with label, icon, and error support

**Features**:
- Optional label text
- Left icon support
- Error state with message
- Rounded corners (16px)
- Focus state with ring

**Props**:
```tsx
label?: string
error?: string
icon?: React.ReactNode
```

**Usage**:
```tsx
<FinInput
  label="Email"
  placeholder="Enter your email"
  icon={<Mail size={20} />}
  error="Invalid email"
/>
```

---

### 3. BalanceCard
**Purpose**: Highlighted card displaying total account balance

**Features**:
- Gradient background (primary to secondary)
- Toggle visibility (show/hide balance)
- Large, prominent typography
- Shadow with primary color tint

**Props**:
```tsx
balance: number
showBalance: boolean
onToggleBalance: () => void
```

---

### 4. TransactionCard
**Purpose**: Individual transaction item in lists

**Features**:
- Category icon with colored background
- Transaction type indicator (income/expense)
- Color-coded amounts (green/red)
- Date display
- Tap/click interaction

**Props**:
```tsx
transaction: Transaction
onClick?: () => void
```

**Transaction Type**:
```tsx
interface Transaction {
  id: string
  title: string
  category: string
  amount: number
  type: 'income' | 'expense'
  date: string
}
```

---

### 5. SummaryCard
**Purpose**: Income/Expense summary display

**Features**:
- Type indicator icon (up/down arrow)
- Color-coded by type
- Compact layout
- Clear typography hierarchy

**Props**:
```tsx
type: 'income' | 'expense'
amount: number
label?: string
```

---

### 6. BottomNav
**Purpose**: Fixed bottom navigation bar

**Features**:
- 3 main navigation items (Home, Transactions, Reports)
- Active state highlighting
- Icon + label layout
- Fixed positioning with safe area support

**Navigation Items**:
- Home (Dashboard)
- Transactions (List view)
- Reports (Analytics)

---

### 7. Header
**Purpose**: Page header with title and optional actions

**Features**:
- Back button support
- Page title
- Optional right action button
- Sticky positioning
- Backdrop blur

**Props**:
```tsx
title: string
showBack?: boolean
action?: React.ReactNode
```

---

### 8. FAB (Floating Action Button)
**Purpose**: Quick action button for adding transactions

**Features**:
- Fixed bottom-right position
- Circular shape (56px)
- Primary color with shadow
- Scale animation on tap
- Mobile-responsive positioning

**Props**:
```tsx
to: string
icon?: React.ReactNode
```

---

## 📱 Screens

### 1. LoginScreen
**Route**: `/`

**Features**:
- App logo with gradient background
- Email and password inputs with icons
- "Forgot password?" link
- Primary login button
- Register navigation

**Components Used**:
- FinInput
- FinButton

---

### 2. RegisterScreen
**Route**: `/register`

**Features**:
- Similar layout to login
- Additional fields (name, confirm password)
- Form validation
- Login navigation link

**Components Used**:
- FinInput
- FinButton

---

### 3. DashboardScreen
**Route**: `/dashboard`

**Features**:
- Welcome header with user name
- Balance card with show/hide toggle
- Income/Expense summary cards (2-column grid)
- Recent transactions list (5 items)
- "See All" link to transactions
- FAB for adding transactions
- Bottom navigation

**Components Used**:
- BalanceCard
- SummaryCard
- TransactionCard
- FAB
- BottomNav

---

### 4. TransactionsScreen
**Route**: `/transactions`

**Features**:
- Header with filter button
- Filter tabs (All, Income, Expense)
- Full transaction list
- Color-coded by type
- Empty state message
- FAB for adding transactions
- Bottom navigation

**Components Used**:
- Header
- TransactionCard
- FAB
- BottomNav

---

### 5. AddTransactionScreen
**Route**: `/add-transaction`

**Features**:
- Header with back button
- Type toggle (Income/Expense) with colored states
- Amount input
- Title input
- Category selection grid (8 categories)
- Date picker
- Save button

**Components Used**:
- Header
- FinInput
- FinButton

**Categories**:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Utilities
- Health
- Income
- Other

---

### 6. ReportsScreen
**Route**: `/reports`

**Features**:
- Monthly summary card
- Income/Expense summary
- Net savings calculation
- Chart type toggle
- Pie chart (spending by category)
- Bar chart (monthly trend)
- Color-coded legend
- Bottom navigation

**Components Used**:
- Header
- SummaryCard
- BottomNav
- Recharts (PieChart, BarChart)

---

## 📐 Layout Patterns

### Mobile Container
All screens use a centered container with max-width:
```tsx
<div className="max-w-md mx-auto px-4">
  {/* Content */}
</div>
```

### Spacing
- **Page padding**: 24px (1.5rem)
- **Card spacing**: 16px gap between cards
- **Section spacing**: 24px between sections
- **Content padding**: 16-24px inside cards

### Grid System
- **2-column grid**: Summary cards on dashboard
- **2-column grid**: Category selection
- **Single column**: Transaction lists

---

## 🎯 UX Patterns

### Navigation
- **Bottom Nav**: Primary navigation (3 items)
- **FAB**: Quick add transaction action
- **Back Button**: In-page navigation with history

### Interactions
- **Tap feedback**: Scale down animation (0.95)
- **Hover states**: Opacity/color changes
- **Focus states**: Ring outline with primary color
- **Transitions**: 200ms duration for smooth animations

### Visual Hierarchy
1. **Primary**: Balance, page titles, CTAs
2. **Secondary**: Section headings, important data
3. **Tertiary**: Labels, metadata, helper text

### Feedback
- **Loading states**: Skeleton loaders (future enhancement)
- **Empty states**: Centered message with icon
- **Error states**: Red border + error message below input
- **Success states**: Green indicators for income

---

## 🌙 Dark Mode Support

The design system includes dark mode tokens:
- Background: `#1a1d29`
- Card: `#252837`
- Primary: `#a29bfe` (lighter purple)
- Borders: White at 10% opacity

---

## 📦 Technical Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router v7** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

---

## 🚀 Getting Started

### Using Components
```tsx
import { FinButton } from './components/FinButton'
import { BalanceCard } from './components/BalanceCard'

function MyScreen() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <BalanceCard 
        balance={15432.75}
        showBalance={true}
        onToggleBalance={() => {}}
      />
      <FinButton variant="primary" size="lg">
        Add Transaction
      </FinButton>
    </div>
  )
}
```

### Navigation
```tsx
import { useNavigate } from 'react-router'

function MyComponent() {
  const navigate = useNavigate()
  
  return (
    <button onClick={() => navigate('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```

---

## 📝 Design Principles

1. **Mobile-First**: Optimized for mobile devices (320px - 428px)
2. **Consistency**: Reusable components with consistent styling
3. **Accessibility**: Semantic HTML, proper contrast ratios
4. **Performance**: Lightweight, optimized animations
5. **Scalability**: Modular components, easy to extend

---

## 🎨 Fintech Aesthetic

Inspired by modern fintech apps:
- **Clean & Minimal**: Lots of whitespace, clear hierarchy
- **Bold Typography**: Large, readable text for key information
- **Gradients**: Subtle gradients for premium feel
- **Shadows**: Soft shadows for depth
- **Rounded Corners**: 16-24px for friendly, modern look
- **Color Psychology**: Purple (trust), Green (growth), Red (caution)

---

## 🔮 Future Enhancements

- [ ] Pull-to-refresh on transaction lists
- [ ] Swipe actions on transaction cards
- [ ] Biometric authentication
- [ ] Multiple currency support
- [ ] Budget tracking features
- [ ] Recurring transactions
- [ ] Export reports (PDF/CSV)
- [ ] Push notifications
- [ ] Account linking (bank integration)

---

## 📄 License

This design system is part of the FinanceFlow project.
