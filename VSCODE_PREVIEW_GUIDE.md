# 🎨 VS Code Preview Guide - HFRP Relief Project

## ✅ Extensions Already Installed
- ✅ Live Preview (ms-vscode.live-server) v0.4.16
- ✅ CodeGPT v3.14.135
- ✅ Pretty TypeScript Errors v0.6.1

---

## 🚀 How to Preview Your Project in VS Code

### Method 1: Simple Browser (Easiest)

**Step 1:** Make sure your dev server is running (it already is!)
```
Server URL: http://localhost:3005
```

**Step 2:** Open Simple Browser in VS Code
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Simple Browser: Show"**
3. Enter URL: **http://localhost:3005**
4. Press Enter

The browser will open in a VS Code panel alongside your code!

---

### Method 2: Live Preview Extension

**Option A - Quick Open:**
1. Press `Cmd+Shift+P` (Command Palette)
2. Type: **"Live Preview: Show Preview (External Browser)"**
3. Select it to open in your default browser

**Option B - Right-Click:**
1. Right-click on any `.html` or `.tsx` file in Explorer
2. Select **"Show Preview"**

---

### Method 3: Built-in Terminal Browser View

**Step 1:** Open integrated terminal
- Press `` Ctrl+` `` (backtick) or `View → Terminal`

**Step 2:** Click the "Ports" tab next to "Terminal"
- You should see port `3005` listed
- Click the globe icon (🌐) next to port 3005
- Or right-click → "Open in Browser"

---

## 🎯 Recommended Workflow

### Split View Setup (Best Experience):

1. **Left Side:** Your code editor
   - Open files like `src/app/page.tsx` or `src/app/donate/page.tsx`

2. **Right Side:** Browser preview
   - Use Simple Browser with http://localhost:3005
   - OR use external browser with split screen

### To Set This Up:
1. Open your code file (e.g., `src/app/page.tsx`)
2. Press `Cmd+Shift+P` → "Simple Browser: Show"
3. Enter: `http://localhost:3005`
4. Drag the browser tab to the right side to split the view
5. Make changes to your code → Save → See updates instantly!

---

## 🔥 Hot Reload is Active

Your Next.js dev server has **Hot Module Replacement (HMR)**:
- Edit any file and save
- Changes appear **instantly** in the browser
- No manual refresh needed!

### Try It:
1. Open `src/app/page.tsx`
2. Change some text (e.g., a heading)
3. Save the file (`Cmd+S`)
4. Watch the preview update automatically! ✨

---

## 📱 Preview on Multiple Devices

### Your Local Network:
The dev server is accessible at:
- **Local:** http://localhost:3005
- **Network:** http://0.0.0.0:3005

### To Preview on Phone/Tablet:
1. Find your computer's IP address:
   ```bash
   # Run in terminal:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. On your mobile device (same WiFi network):
   - Open browser
   - Go to: `http://YOUR_IP:3005`
   - Example: `http://192.168.1.100:3005`

---

## 🎨 VS Code Layout Tips

### Recommended Extensions (Already Installed):
- ✅ Live Preview - Built-in browser
- ✅ CodeGPT - AI coding assistant
- ✅ Pretty TypeScript Errors - Better error messages

### Additional Helpful Extensions:
```bash
# Install Tailwind CSS IntelliSense (helpful for your project)
code --install-extension bradlc.vscode-tailwindcss

# Install ES7+ React/Redux/React-Native snippets
code --install-extension dsznajder.es7-react-js-snippets

# Install Auto Rename Tag
code --install-extension formulahendry.auto-rename-tag
```

---

## 🛠️ Quick Commands

### Command Palette (`Cmd+Shift+P`):
```
Simple Browser: Show          - Open built-in browser
Live Preview: Show Preview    - Open external preview
Ports: Focus on Ports View    - See running servers
View: Toggle Integrated Terminal
```

### Keyboard Shortcuts:
```
Cmd+Shift+P     - Command Palette
Cmd+B           - Toggle Sidebar
Cmd+J           - Toggle Panel (Terminal/Ports)
Cmd+\           - Split Editor
Ctrl+`          - Toggle Terminal
Cmd+S           - Save (triggers hot reload)
```

---

## 📊 Viewing Different Pages

Once the browser is open in VS Code:

### Navigate by changing the URL in Simple Browser:
```
Homepage:     http://localhost:3005
Donate:       http://localhost:3005/donate
Admin:        http://localhost:3005/admin
Gallery:      http://localhost:3005/gallery
Impact:       http://localhost:3005/impact
Radio:        http://localhost:3005/radio
Blog:         http://localhost:3005/blog
Contact:      http://localhost:3005/contact
```

### Or click links in the preview window!

---

## 🐛 Debugging in Preview

### Open DevTools:
1. In Simple Browser, right-click anywhere
2. Select **"Inspect"** or **"Inspect Element"**
3. Developer Tools open in VS Code!

### Or use Chrome DevTools:
1. Open in external Chrome browser
2. Press `F12` or `Cmd+Option+I`
3. Full DevTools available

---

## 🔄 Workflow Example

**Editing the Donate Page:**

1. **Open the file:**
   ```
   File → Open → src/app/donate/page.tsx
   ```

2. **Open preview:**
   - `Cmd+Shift+P` → "Simple Browser: Show"
   - Enter: `http://localhost:3005/donate`

3. **Arrange windows:**
   - Drag browser tab to right side
   - Code on left, preview on right

4. **Make changes:**
   - Edit donation amounts
   - Change button text
   - Modify styling

5. **Save and watch:**
   - Press `Cmd+S`
   - Preview updates instantly!

---

## ✨ Pro Tips

### 1. Multiple Preview Windows
- Open multiple Simple Browser instances
- Preview different pages simultaneously
- Great for comparing layouts

### 2. Responsive Testing
- Resize the browser panel
- Test mobile/tablet/desktop views
- Use browser DevTools device toolbar

### 3. Console Logs
- Open DevTools in Simple Browser
- See `console.log()` output
- Debug JavaScript errors

### 4. Network Requests
- Monitor API calls
- Check Stripe integration
- Verify webhook calls

---

## 🎯 Current Status

✅ Dev server running at: **http://localhost:3005**
✅ Hot reload enabled
✅ All pages compiling successfully
✅ Stripe test mode active
✅ VS Code extensions installed

**You're ready to start previewing!** 🚀

---

## 🆘 Troubleshooting

### Preview not loading?
- Check terminal: Is dev server running?
- Look for errors in Terminal output
- Try refreshing the browser panel

### Changes not appearing?
- Make sure you saved the file (`Cmd+S`)
- Check console for errors
- Try hard refresh (`Cmd+Shift+R`)

### Port 3005 in use?
- Check Ports tab in VS Code
- Stop other services using port 3005
- Or change port in `package.json`

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **VS Code Docs:** https://code.visualstudio.com/docs
- **Live Preview Extension:** https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server

---

**Happy Coding!** 🎉
