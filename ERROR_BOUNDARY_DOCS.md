# ErrorBoundary Implementation

This project includes comprehensive error handling with React ErrorBoundary components.

## Components Added

### 1. ErrorBoundary.tsx

**Location**: `src/app/_components/ErrorBoundary.tsx`

A robust class-based error boundary with:

- TypeScript support with proper interfaces
- Custom fallback UI with styled error message
- Error logging to console
- Refresh button for recovery
- Responsive design with Tailwind CSS

**Features**:

- Catches JavaScript errors in component tree
- Displays user-friendly error message
- Provides recovery options
- Logs errors for debugging

### 2. ErrorFallback.tsx

**Location**: `src/app/_components/ErrorFallback.tsx`

Functional component utilities for error handling:

- `ErrorFallback` component for custom error displays
- `useErrorHandler` hook for global error handling
- Handles both component errors and unhandled promise rejections

## Implementation

### Global Level

```tsx
// In layout.tsx
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";

export default function RootLayout({ children }) {
  return <ErrorBoundary>{/* App content */}</ErrorBoundary>;
}
```

### Admin Panel

```tsx
// In admin/layout.tsx
<ErrorBoundary fallback={<div>Custom admin error message</div>}>
  <AdminAuthProvider>{children}</AdminAuthProvider>
</ErrorBoundary>
```

## Usage Examples

### Basic Usage

```tsx
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";

function MyComponent() {
  return (
    <ErrorBoundary>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";

function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong in this section</div>}>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  );
}
```

### Using Error Hook

```tsx
import { useErrorHandler } from "@/app/_components/ErrorFallback";

function MyComponent() {
  useErrorHandler(); // Sets up global error listeners

  return <div>Component content</div>;
}
```

## Error Boundary Features

1. **Graceful Error Handling**: Catches errors and displays user-friendly messages
2. **Error Recovery**: Provides options to retry or refresh
3. **Error Logging**: Logs errors for debugging and monitoring
4. **Responsive Design**: Works on all device sizes
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **TypeScript Support**: Full type safety with proper interfaces

## Error Types Handled

- Component rendering errors
- Event handler errors
- Async operation errors (via useErrorHandler)
- Promise rejections
- JavaScript runtime errors

## Styling

Uses Tailwind CSS classes for:

- Responsive layout
- Consistent design system
- Error state indicators
- Interactive elements (buttons)
- Accessibility features

## Integration Points

1. **Root Layout**: Global error boundary for entire app
2. **Admin Layout**: Specialized error handling for admin features
3. **Component Level**: Can be wrapped around any component
4. **Global Handlers**: Window-level error catching

This implementation ensures the HFRP Relief website remains stable and user-friendly even when errors occur.
