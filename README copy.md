# Haitian Family Relief Project - Web Application

A Next.js application for the Haitian Family Relief Project, featuring comprehensive donation management, analytics tracking, and responsive design.

## 🚀 Development Setup

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- VS Code with recommended extensions

### Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   bun run dev
   ```

3. **Open in browser:**
   - Main app: http://localhost:3000
   - Testing center: http://localhost:3000/test-donate

## 🔧 VS Code Extensions Profile

This project includes a recommended extensions profile for optimal development experience:

### Recommended Extensions:
- **Live Server** - Static file serving with auto-reload
- **Tailwind CSS IntelliSense** - Enhanced Tailwind development
- **Prettier** - Code formatting
- **TypeScript Hero** - Advanced TypeScript support
- **Auto Rename Tag** - HTML/JSX tag synchronization
- **Path Intellisense** - File path autocompletion

### Installing Extensions:
1. Open VS Code in the project folder
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Show Recommended Extensions"
4. Install all recommended extensions

## 📺 Live Server Configuration

### Method 1: VS Code Live Server Extension
1. Install the "Live Server" extension
2. Right-click on any HTML file
3. Select "Open with Live Server"
4. Server runs on http://localhost:5500

### Method 2: Custom Live Server Setup
```bash
# Install live-server globally
npm install -g live-server

# Run from project root
live-server --port=5000 --host=localhost
```

### Method 3: Next.js Development Server (Recommended)
```bash
# Start Next.js dev server with hot reload
bun run dev

# Access at http://localhost:3000
```

## 🎯 Development Workflow

### Available Scripts:
```bash
# Development server with hot reload
bun run dev

# Production build
bun run build

# Run linter
bun run lint

# Start production server
bun start
```

### VS Code Tasks:
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Select from available tasks:
  - `dev` - Start development server
  - `build` - Create production build
  - `lint` - Run code linter
  - `install dependencies` - Install/update packages

## 🧪 Testing & Debugging

### Comprehensive Testing System:
- **URL**: http://localhost:3000/test-donate
- **Features**: Real-time analytics tracking, console monitoring, donate button testing

### Debug Configurations:
- **Next.js Server-side**: Debug backend API routes
- **Next.js Client-side**: Debug React components in Chrome
- **Full Stack**: Debug both frontend and backend simultaneously

### Testing Donate Buttons:
1. Visit http://localhost:3000/test-donate
2. Use individual test buttons or "Run All Tests"
3. Monitor console logs and analytics events
4. Verify popup behavior and fallback functionality

## 📁 Project Structure

```
hfrp-relief/
├── .vscode/                 # VS Code configuration
│   ├── extensions.json      # Recommended extensions
│   ├── settings.json        # Workspace settings
│   ├── launch.json          # Debug configurations
│   └── tasks.json           # Build tasks
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── _components/     # Reusable components
│   │   ├── test-donate/     # Testing system
│   │   └── ...
│   └── ...
├── .same/                   # Project documentation
├── live-server.config.js    # Live server configuration
└── README.md
```

## 🔗 Key Features

### ✅ Direct Payment Integration:
- Navbar and homepage buttons open Donorbox forms directly
- Pre-configured $15 monthly recurring donations (50¢ daily)
- Smart fallback to /donate page if popups blocked
- Google Analytics event tracking

### ✅ Comprehensive Testing:
- Real-time console monitoring
- Analytics event capture
- Popup blocking simulation
- Cross-browser compatibility testing

### ✅ Development Tools:
- Hot reload with Next.js
- TypeScript support
- Tailwind CSS with IntelliSense
- Automated linting and formatting
- Debug configurations for VS Code

## 🌐 Live Development

### Next.js Development Server (Primary):
- **URL**: http://localhost:3000
- **Features**: Hot reload, API routes, server-side rendering
- **Best for**: Full-stack development

### Live Server (Secondary):
- **URL**: http://localhost:5000
- **Features**: Static file serving, auto-refresh
- **Best for**: Quick HTML/CSS testing

## 📊 Environment Configuration

### Development:
- Hot reload enabled
- Debug mode active
- Test mode for donations
- Detailed error reporting

### Production:
- Optimized builds
- Analytics tracking
- Real donation processing
- Error monitoring

## 🚀 Deployment

The project is configured for easy deployment to various platforms:
- **Netlify**: Static site generation
- **Vercel**: Full-stack Next.js deployment
- **Custom servers**: Docker support available

## 📝 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bun Documentation](https://bun.sh/docs)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/vscode)

---

**Status**: ✅ All development tools configured and ready for use!
