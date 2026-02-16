# MediNavi Logo Instructions

## How to Replace the Logo with Your Custom Icon

### Step 1: Prepare Your Logo File

Your custom logo should be:
- **Format**: PNG (recommended) or SVG
- **Size**: 32x32 pixels or 64x64 pixels (square recommended)
- **Background**: Transparent background preferred
- **File name**: `logo.png` or `logo.svg`

### Step 2: Replace the Logo File

**Location to place your custom logo:**

```
pharmacy-frontend/
  └── src/
      └── assets/
          └── logo.png    ← REPLACE THIS FILE WITH YOUR LOGO
          └── logo.svg    ← OR REPLACE THIS FILE (if using SVG)
```

**Full path:**
```
c:\Users\User\Desktop\pharmacy-frontend\src\assets\logo.png
```

### Step 3: Update the Code (if using PNG instead of SVG)

If you're using a **PNG** file instead of the SVG:

Open: `src/components/Navbar.jsx`

**Change line 4 from:**
```javascript
import logoSvg from '../assets/logo.svg'
```

**To:**
```javascript
import logoSvg from '../assets/logo.png'
```

That's it! The logo will automatically update when you save the file.

### No Code Changes Needed If:
- You keep the filename as `logo.svg` OR
- You just replace `logo.png` and update the import statement as shown above

---

## Current Branding

✅ App Name: **MediNavi**  
✅ Logo: Located at `src/assets/logo.svg` or `logo.png`  
✅ Browser Tab Title: "MediNavi - Smart Pharmacy System"  
✅ Navbar: Shows logo + "MediNavi" text

---

## Example Logo Specifications

### Good Logo Examples:
- Medical cross icon
- Pill/capsule icon
- Location pin with medical symbol
- Navigation compass with medical theme
- 32x32 or 64x64 PNG with transparent background

### Tips:
1. Keep it simple and recognizable
2. Use colors that match your brand (current: Blue #3B82F6)
3. Ensure it looks good at small sizes (32px)
4. Test on both light and dark backgrounds

---

**Need help?** Just replace the file at the path above and refresh your browser!
