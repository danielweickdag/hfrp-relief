# Mobile Testing Guide - Daily Giving Cards

## 📱 **Mobile Testing Checklist for Daily Giving**

### **Device Testing Matrix**

| Device Type | Screen Size | Test Focus |
|-------------|-------------|------------|
| **iPhone SE** | 375px × 667px | Small screen layout |
| **iPhone 12/13** | 390px × 844px | Standard mobile |
| **iPhone 12/13 Pro Max** | 428px × 926px | Large mobile |
| **Samsung Galaxy S21** | 384px × 854px | Android standard |
| **iPad Mini** | 768px × 1024px | Tablet portrait |
| **iPad Pro** | 1024px × 1366px | Large tablet |

### **Daily Giving Cards - Mobile Testing**

#### **📊 Card Layout Testing**
Test on each device:

1. **Card Grid Responsiveness**
   - [ ] **Mobile (< 768px)**: Cards display in 1 column
   - [ ] **Tablet (768px+)**: Cards display in 2 columns
   - [ ] **Large tablet (1024px+)**: Cards display in 3-4 columns
   - [ ] Cards maintain equal height across rows
   - [ ] Proper spacing between cards (4px on mobile, 6px on tablet)

2. **Card Content Scaling**
   - [ ] **Daily amount (16¢, 33¢, etc.)**: Large and readable (5xl font)
   - [ ] **"per day" text**: Visible but not overwhelming
   - [ ] **Card titles**: Fit on one line or wrap gracefully
   - [ ] **Descriptions**: Readable without being cramped
   - [ ] **Impact statements**: Clear and prominent with 📊 icon
   - [ ] **Buttons**: Full width and easy to tap (44px minimum height)

3. **Touch Targets**
   - [ ] **Donation buttons**: Minimum 44px tap target
   - [ ] **Card hover effects**: Work on touch devices
   - [ ] **Button text**: Clear and unambiguous
   - [ ] **No accidental touches**: Proper spacing between elements

### **Visual Testing Scenarios**

#### **16¢ Daily Card (Blue)**
```
Mobile Display Should Show:
┌─────────────────────┐
│       🍽️           │
│                     │
│       16¢           │  ← Large, prominent
│     per day         │  ← Clear subtext
│                     │
│   Daily Nutrition   │  ← Title fits
│                     │
│ Just 16¢ a day      │  ← Description
│ provides essential  │    readable
│ nutrition...        │
│                     │
│ 📊 Feeds 1 child    │  ← Impact clear
│ daily               │
│                     │
│ [Give 16¢ Daily]    │  ← Full width button
└─────────────────────┘
```

#### **Custom Amount Section - Mobile**
```
Mobile Layout:
┌─────────────────────┐
│  Daily Impact       │
│  Options            │
│                     │
│ ┌───┐ ┌───┐        │  ← 2x2 grid
│ │16¢│ │33¢│        │    on mobile
│ └───┘ └───┘        │
│ ┌───┐ ┌───┐        │
│ │50¢│ │66¢│        │
│ └───┘ └───┘        │
│                     │
│ [Choose Amount]     │  ← Full width
└─────────────────────┘
```

### **Functionality Testing**

#### **Donation Flow Testing**
Test each daily amount on mobile:

1. **16¢ Daily Option**
   - [ ] Tap card button opens Donorbox correctly
   - [ ] Form displays properly on mobile
   - [ ] Payment fields are accessible
   - [ ] Thank you page displays correctly

2. **33¢ Daily Option**
   - [ ] Button triggers correct amount
   - [ ] Mobile form navigation works
   - [ ] All payment methods available

3. **50¢ Daily Option**
   - [ ] Proper amount pre-selected
   - [ ] Mobile keyboard appropriate for payment fields
   - [ ] Form validation works on mobile

4. **66¢ Daily Option**
   - [ ] Highest amount processes correctly
   - [ ] Receipt email delivers properly

5. **Custom Amount**
   - [ ] Donorbox opens with custom amount option
   - [ ] Number input works on mobile keyboard
   - [ ] Can enter any amount easily

### **Performance Testing**

#### **Loading Speed (Mobile)**
- [ ] **Cards load quickly**: < 2 seconds on 3G
- [ ] **Images optimize**: Icons display immediately
- [ ] **Buttons responsive**: No delay on tap
- [ ] **Smooth scrolling**: No lag between cards

#### **Connection Testing**
- [ ] **Slow 3G**: Cards still usable
- [ ] **2G connection**: Basic functionality maintained
- [ ] **Offline fallback**: Graceful error messages
- [ ] **Poor signal**: Retry mechanisms work

### **Accessibility Testing**

#### **Touch Accessibility**
- [ ] **Large finger targets**: All buttons 44px minimum
- [ ] **Proper spacing**: No accidental taps
- [ ] **Clear labels**: Button text describes action
- [ ] **Focus indicators**: Visible for keyboard users

#### **Visual Accessibility**
- [ ] **Color contrast**: Text readable on all backgrounds
- [ ] **Font sizes**: Readable without zooming
- [ ] **Icon clarity**: Emojis display correctly
- [ ] **Dark mode**: Compatible if device uses dark mode

### **Cross-Platform Testing**

#### **iOS Safari**
- [ ] Cards display correctly
- [ ] Donation buttons work
- [ ] Donorbox integration functions
- [ ] Payment methods available

#### **Android Chrome**
- [ ] Layout maintains integrity
- [ ] Touch events work properly
- [ ] Performance is acceptable
- [ ] All features functional

#### **Mobile Browsers**
- [ ] **Chrome Mobile**: Full functionality
- [ ] **Safari Mobile**: iOS compatibility
- [ ] **Samsung Internet**: Android compatibility
- [ ] **Firefox Mobile**: Cross-platform support

### **Testing Steps**

#### **Manual Testing Process**
1. **Open browser dev tools**: Set to mobile viewport
2. **Test each card size**: Resize to different mobile widths
3. **Check button functionality**: Tap each donation option
4. **Verify Donorbox opens**: Ensure mobile-friendly form
5. **Test payment flow**: Use test mode to complete donation
6. **Check receipt**: Verify email delivery and formatting

#### **Real Device Testing**
1. **Use actual devices**: Don't rely only on browser simulation
2. **Test on slow connections**: Use network throttling
3. **Check different orientations**: Portrait and landscape
4. **Test with real fingers**: Not just mouse simulation

### **Common Mobile Issues to Check**

#### **Layout Problems**
- [ ] **Cards too narrow**: Content cramped
- [ ] **Text too small**: Difficult to read
- [ ] **Buttons too small**: Hard to tap accurately
- [ ] **Poor spacing**: Elements too close together

#### **Functionality Issues**
- [ ] **Donation buttons don't work**: JavaScript errors
- [ ] **Form doesn't load**: Donorbox integration problems
- [ ] **Payment fails**: Mobile payment processing issues
- [ ] **Thank you page broken**: Mobile layout problems

#### **Performance Issues**
- [ ] **Slow loading**: Images or scripts too large
- [ ] **Laggy scrolling**: Heavy animations or effects
- [ ] **Memory issues**: Browser crashes or reloads
- [ ] **Battery drain**: Excessive processing

### **Sign-off Checklist**

#### **Mobile Approval Criteria**
- [ ] All daily giving amounts (16¢, 33¢, 50¢, 66¢) display perfectly
- [ ] Cards are easy to read and tap on smallest mobile screens
- [ ] Donation flow works smoothly on mobile devices
- [ ] Performance is acceptable on slower connections
- [ ] All major mobile browsers and devices tested

#### **Testing Sign-off**
- **Tester Name**: _______________
- **Devices Tested**: _______________
- **Date Completed**: _______________
- **Issues Found**: _______________
- **Ready for Production**: ☐ Yes ☐ No

---

## 🔧 **Quick Mobile Test**

**Fastest way to test daily giving cards on mobile:**

1. **Open Chrome DevTools** (F12)
2. **Click mobile icon** (📱)
3. **Select iPhone 12 Pro** (390px width)
4. **Navigate to** `/donate` page
5. **Check each card** displays properly
6. **Test one donation button** opens Donorbox
7. **Switch to tablet size** (768px) and retest

**All cards should be perfectly readable and tappable!**
