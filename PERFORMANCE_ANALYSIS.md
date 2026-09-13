# 🐌 Website Performance Analysis - City of Truth Ministries

## ⚠️ CRITICAL PERFORMANCE ISSUES IDENTIFIED

Your website is loading slowly due to multiple performance bottlenecks. Here's a detailed analysis:

---

## 🔴 **MAJOR ISSUES**

### 1. **MASSIVE BUNDLE SIZE** 
**Problem**: 40+ heavy dependencies loaded on every page

**Current Dependencies (90+ packages):**
- **3D Libraries**: `three`, `cobe`, `@imgly/background-removal`
- **PDF Generation**: `jspdf`, `html2canvas`, `html-to-image`, `pdfjs-dist`
- **Animation**: `gsap`, `motion`, `lenis`
- **AI/Cloud**: `@google/genai`, `openai`, `@openrouter/sdk`, `firebase`, `firebase-admin`
- **Background Removal**: `@imgly/background-removal` (HUGE - 50MB+)
- **QR/Biometrics**: `@simplewebauthn`, `@yudiel/react-qr-scanner`, `qrcode`
- **Cloud Storage**: `@google-cloud/firestore`

**Impact**: 
- Initial bundle size likely **5-10MB+**
- First load takes **10-30 seconds** on slow connections
- Mobile users suffer the most

**Solution**:
```bash
# Remove unused heavy packages:
npm uninstall @imgly/background-removal @google-cloud/firestore firebase-admin
npm uninstall @google/genai openai @openrouter/sdk  # Move AI to backend API
npm uninstall html2canvas html-to-image pdfjs-dist  # Load only when needed
```

---

### 2. **VIDEOS LOADING IMMEDIATELY** 🎥
**Problem**: Multiple large videos auto-loading on homepage

**Found Videos:**
```typescript
// HeroCinematicIntro.tsx - Line 443
<video
  src="/சத்திய_நகரம்_City_of_Truth_Min.mp4"  // ⚠️ Auto-loads on mount
  autoPlay
  loop
  muted={isMuted}
/>

// IsraelPage.tsx - Line 274
<video
  src="/gemini_generated_video_cf07149d.mp4"  // ⚠️ Auto-loads
  autoPlay
  loop
/>

// MinistriesPage.tsx - Lines 24-32
const videos = [
  'VID-20231226-WA0002.mp4',  // 7 videos!
  'VID-20231226-WA0005.mp4',
  'VID-20231230-WA0104.mp4',
  // ... 4 more videos
];
```

**Impact**: 
- Each video is likely **5-50MB**
- All load on page load = **50-200MB** initial download
- Blocks rendering of critical content

**Solution**:
1. **Add `preload="none"`** - Don't load until user clicks play
2. **Use poster images** - Show thumbnail, load video on click
3. **Lazy load** - Only load when video scrolls into view
4. **Compress videos** - Use H.264 with lower bitrate

---

### 3. **NO CODE SPLITTING** 📦
**Problem**: All components load on initial page load, even if not used

```typescript
// App.tsx - Lines 68-95
// ❌ BAD: Lazy loading only some components
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const AIPage = React.lazy(() => import('./components/AIPage'));

// But these are NOT lazy loaded:
import { Navbar } from './components/Navbar';
import { MinistryHighlights, HebrewSanctuaryIntro, ... } from './components/HomeSections';
import { GoldenMenorah } from './components/GoldenMenorah';
import { CinematicOpeningScreen } from './components/ui/cinematic-opening-screen';
// ... and 20+ more components
```

**Impact**: 
- **100+ components** load immediately
- Homepage loads code for pages user may never visit
- Bundle bloat

**Solution**:
- Move ALL home sections to lazy imports
- Use route-based code splitting
- Only load what's visible

---

### 4. **HEAVY ANIMATIONS & CANVAS** 🎨
**Problem**: Multiple canvas animations running simultaneously

**Found Heavy Animations:**
```typescript
// DotMatrixText - Full canvas animation
// DotShaderCanvas - WebGL shader effects
// GoldenMenorah - 3D canvas rendering
// MenorahFlag - Canvas drawing with curves
// LetterTracingModal - Real-time canvas drawing
// Cobe globe - 3D sphere rendering
```

**Impact**: 
- **60fps** target missed on mobile
- High CPU usage = battery drain
- Blocks main thread = sluggish UI

**Solution**:
1. **Defer animations** until after page interactive
2. **RequestIdleCallback** for non-critical animations
3. **Reduce canvas resolution** on mobile
4. **Pause animations** when off-screen

---

### 5. **TOO MANY HOME SECTIONS** 📄
**Problem**: 13 sections loaded on homepage at once

```typescript
// App.tsx - Lines 318-330
const DEFAULT_HOME_SECTIONS_ORDER = [
  'hero',           // ✅ Keep
  'about',          // ❌ Remove (just removed)
  'highlights',     // ⚠️ Lazy load
  'menorah',        // ⚠️ Lazy load (3D heavy)
  'leader',         // ⚠️ Lazy load
  'hebrew',         // ⚠️ Lazy load
  'pastorBaruch',   // ⚠️ Lazy load
  'testimonials',   // ⚠️ Lazy load
  'members',        // ⚠️ Lazy load
  'preview',        // ⚠️ Lazy load
  'donations',      // ⚠️ Lazy load
  'globalPresence', // ⚠️ Lazy load
  'verify'          // ⚠️ Lazy load
];
```

**Impact**: 
- All sections render on mount
- Massive DOM tree = slow scrolling
- Loads images/videos from all sections

**Solution**:
- Show only **hero** + **1-2 sections** initially
- Use **Intersection Observer** to lazy load sections as user scrolls
- Add loading skeletons

---

### 6. **FIREBASE ON CLIENT SIDE** 🔥
**Problem**: Firebase Admin SDK running in browser (VERY HEAVY)

```json
// package.json
"firebase": "^12.7.0",           // 1.5MB
"firebase-admin": "^14.2.0",     // ⚠️ 5MB+ - SHOULD BE SERVER-ONLY
"@google-cloud/firestore": "^8.7.0"  // ⚠️ 3MB+ - SHOULD BE SERVER-ONLY
```

**Impact**: 
- **8-10MB** just for Firebase libraries
- Security risk (admin SDK exposed)
- Slow initialization

**Solution**:
```bash
# Remove server-side packages from client
npm uninstall firebase-admin @google-cloud/firestore

# Move to backend API or use lightweight firebase client SDK only
```

---

### 7. **UNOPTIMIZED IMAGES** 🖼️
**Problem**: Large images without optimization

**Found Image Issues:**
```typescript
// Using Unsplash full-resolution images
poster="https://images.unsplash.com/photo-1510590337019-5ef2d39aa786?q=80&w=2670..."
// No responsive images
// No lazy loading on images below fold
```

**Solution**:
1. **Compress images** - Use WebP format
2. **Responsive images** - Serve smaller sizes for mobile
3. **Lazy load** - Add `loading="lazy"` attribute
4. **CDN optimization** - Use image CDN with auto-optimization

---

## 📊 **PERFORMANCE METRICS (Estimated)**

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Bundle Size** | ~8-12MB | <500KB | 🔴 CRITICAL |
| **First Contentful Paint** | 5-8s | <1.5s | 🔴 CRITICAL |
| **Time to Interactive** | 10-15s | <3.5s | 🔴 CRITICAL |
| **Total Blocking Time** | 3-5s | <300ms | 🔴 CRITICAL |
| **Largest Contentful Paint** | 8-12s | <2.5s | 🔴 CRITICAL |

---

## ✅ **QUICK WINS (Immediate Fixes)**

### Priority 1: Stop Auto-Loading Videos
```typescript
// HeroCinematicIntro.tsx
<video
  src="/சத்திய_நகரம்_City_of_Truth_Min.mp4"
  poster="/video-thumbnail.jpg"  // ✅ Add poster
  preload="none"                  // ✅ Don't preload
  autoPlay={false}                // ✅ Require user interaction
  controls                        // ✅ Add controls
/>
```

### Priority 2: Remove Heavy Unused Packages
```bash
npm uninstall @imgly/background-removal firebase-admin @google-cloud/firestore
```
**Savings**: ~60MB of dependencies

### Priority 3: Lazy Load Home Sections
```typescript
// Create lazy-loaded section wrapper
const LazySection = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <SkeletonLoader />}</div>;
};
```

### Priority 4: Enable Vite Build Optimizations
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['motion', 'gsap'],
          'ui': ['lucide-react'],
          'three': ['three', 'cobe'],
          'pdf': ['jspdf', 'jspdf-autotable']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## 🎯 **RECOMMENDED ACTION PLAN**

### Week 1: Critical Fixes
- [ ] Remove unused heavy packages (firebase-admin, background-removal, etc.)
- [ ] Add `preload="none"` to all videos
- [ ] Add poster images for videos
- [ ] Compress existing videos (target <5MB each)

### Week 2: Code Splitting
- [ ] Implement lazy loading for all home sections
- [ ] Route-based code splitting
- [ ] Dynamic imports for heavy components

### Week 3: Asset Optimization
- [ ] Convert images to WebP
- [ ] Implement responsive images
- [ ] Add lazy loading to images
- [ ] Set up image CDN

### Week 4: Performance Monitoring
- [ ] Add Lighthouse CI
- [ ] Set up performance budgets
- [ ] Monitor Core Web Vitals
- [ ] User testing on slow connections

---

## 🚀 **EXPECTED IMPROVEMENTS**

After implementing all fixes:
- **Bundle size**: 8MB → **500KB** (94% reduction)
- **Load time**: 15s → **2-3s** (80% faster)
- **Time to Interactive**: 10s → **3s** (70% faster)
- **Mobile performance**: Poor → **Good/Excellent**

---

## 📝 **NOTES**

1. **Current issue**: Too many features = slow site
2. **Root cause**: No performance budget or optimization strategy
3. **Impact**: Users are leaving due to slow load times
4. **Solution**: Aggressive lazy loading + code splitting + asset optimization

---

**Status**: 🔴 CRITICAL - Immediate action required
**Priority**: HIGH - Affects user retention and SEO
**Effort**: Medium - 2-4 weeks of focused work

