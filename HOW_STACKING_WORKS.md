# How the Antlion Stacking Effect Works

## Visual Explanation

```
═══════════════════════════════════════════════════════════════
                    BEFORE SCROLLING
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────┐
│                                             │
│           HERO SECTION                      │
│           "VALPARAI"                        │
│                                             │
└─────────────────────────────────────────────┘

    ▼ Scroll Down ▼

┌─────────────────────────────────────────────┐  ← Card 01
│ 01 | Grass Hills National Park              │    top: 100px
│    ┌────────┐ ┌──────────────────┐          │
│    │ img 1  │ │                  │          │
│    ├────────┤ │   tall image     │          │
│    │ img 2  │ │                  │          │
│    └────────┘ └──────────────────┘          │
└─────────────────────────────────────────────┘

    ▼ Scroll Down ▼

┌─────────────────────────────────────────────┐  ← Card 02
│ 02 | Sholayar Dam & Reservoir               │    top: 124px
│    ┌────────┐ ┌──────────────────┐          │
│    │ img 1  │ │                  │          │
│    ├────────┤ │   tall image     │          │
│    │ img 2  │ │                  │          │
│    └────────┘ └──────────────────┘          │
└─────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════
              AFTER SCROLLING (STACKING EFFECT)
═══════════════════════════════════════════════════════════════

Viewport Top (0px)
    │
    │  ┌─────────────────────────────────────────┐  ← Card 01 (STUCK at 100px)
    │  │ 01 | Grass Hills (visible top only)    │
100px ├──┴───────────────────────────────────────┴──┤
    │     │                                        │
    │     │  ┌─────────────────────────────────────┐  ← Card 02 (STUCK at 124px)
    │     │  │ 02 | Sholayar Dam (visible)        │
124px     ├──┴───────────────────────────────────────┴──┤
    │        │                                        │
    │        │  ┌─────────────────────────────────────┐  ← Card 03 (STUCK at 148px)
    │        │  │ 03 | Chinnakallar (visible)        │
148px        ├──┴───────────────────────────────────────┴──┤
    │           │                                        │
    │           │  ┌─────────────────────────────────────┐  ← Card 04 (STUCK at 172px)
    │           │  │ 04 | Loam's View (fully visible)   │
172px           └──┴───────────────────────────────────────┴──┘

═══════════════════════════════════════════════════════════════
```

## Step-by-Step Breakdown

### 1. Initial State
```
User at top of page
↓
All cards are below viewport
↓
Nothing is sticky yet
```

### 2. First Card Reaches Sticky Point
```
User scrolls down
↓
Card 01 reaches top: 100px
↓
Card 01 STICKS at 100px from top
↓
Card 01 stops scrolling, stays in place
↓
Content continues scrolling behind it
```

### 3. Second Card Reaches Sticky Point
```
User continues scrolling
↓
Card 02 reaches top: 124px (100px + 24px offset)
↓
Card 02 STICKS at 124px from top
↓
Card 02 appears BELOW Card 01 (creating stack)
↓
Both cards stay in place
↓
Content continues scrolling behind them
```

### 4. Full Stack Forms
```
All 4 cards reach their sticky points
↓
Card 01 at 100px (z-index: 10)
Card 02 at 124px (z-index: 11) ← slightly overlaps Card 01
Card 03 at 148px (z-index: 12) ← slightly overlaps Card 02
Card 04 at 172px (z-index: 13) ← slightly overlaps Card 03
↓
Creates cascading "stack" effect
```

## The Magic CSS

### Core Sticky Positioning
```css
.card {
    position: sticky;                          /* Makes element stick */
    top: calc(10vh + (var(--index) * 24px)); /* Where to stick */
    z-index: calc(10 + var(--index));        /* Stacking order */
}
```

### What Each Part Does

#### `position: sticky`
- Element behaves like `relative` until scroll threshold
- Then "sticks" like `fixed` at specified position
- Only within parent container bounds

#### `top: calc(10vh + (var(--index) * 24px))`
- `10vh` = Base offset (10% of viewport height)
- `var(--index)` = Card index (0, 1, 2, 3)
- `* 24px` = Spacing between each card
- **Result**:
  - Card 0: `top: calc(10vh + 0px)`   → ~100px
  - Card 1: `top: calc(10vh + 24px)`  → ~124px
  - Card 2: `top: calc(10vh + 48px)`  → ~148px
  - Card 3: `top: calc(10vh + 72px)`  → ~172px

#### `z-index: calc(10 + var(--index))`
- Ensures later cards appear on top
- Card 0: z-index 10
- Card 1: z-index 11
- Card 2: z-index 12
- Card 3: z-index 13

## Why It's Called "Antlion"

The effect mimics how an antlion's pit-trap works:
1. Cards "cascade" like sliding sand grains
2. Each layer slightly overlaps the previous
3. Creates a funnel/pit visual as you scroll
4. Named after the original HTML file that inspired it

## Comparison to Other Stacking Methods

### Traditional Absolute Positioning
```
❌ All cards fixed at specific positions
❌ No scroll interaction
❌ Doesn't respond to content height
```

### Scroll-Triggered Animations
```
❌ Requires JavaScript
❌ Can be janky on mobile
❌ More complex to implement
```

### CSS Sticky (Antlion Method)
```
✅ Pure CSS solution
✅ Smooth 60fps performance
✅ Works with content flow
✅ Minimal JavaScript needed
✅ Accessible and semantic
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 56+     | ✅ Full |
| Firefox | 59+     | ✅ Full |
| Safari  | 13+     | ✅ Full |
| Edge    | 16+     | ✅ Full |
| Mobile  | All     | ✅ Full |

## Performance Notes

### Why It's Fast
1. **Hardware Accelerated**: Uses GPU for transforms
2. **No JavaScript Layout**: Pure CSS positioning
3. **Optimized Rendering**: Browser handles sticky natively
4. **Passive Scrolling**: Non-blocking event listeners

### Optimization Tips
```css
.card {
    will-change: transform;              /* Hints browser */
    transform: translateZ(0);            /* Force GPU layer */
    contain: layout style paint;         /* Isolate rendering */
}
```

## Accessibility Considerations

### Screen Readers
- Cards maintain semantic HTML order
- `position: sticky` doesn't affect DOM order
- Content remains accessible in sequence

### Keyboard Navigation
- Tab order follows natural document flow
- Focus indicators work normally
- No JavaScript keyboard traps

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
    .card {
        /* Disable transforms/transitions */
        transition: none;
    }
}
```

## Common Issues & Solutions

### Issue 1: Cards Not Sticking
**Problem**: Cards scroll normally, don't stick
**Solution**: Check parent container has enough height
```css
.stack-container {
    padding-bottom: 20vh;  /* Ensure enough scroll space */
}
```

### Issue 2: Cards Stack Too Close
**Problem**: Cards overlap too much
**Solution**: Increase offset multiplier
```css
/* Change from 24px to 40px */
top: calc(10vh + (var(--index) * 40px));
```

### Issue 3: Z-Index Not Working
**Problem**: Wrong card appears on top
**Solution**: Ensure stacking context is correct
```css
.stack-container {
    position: relative;  /* Creates stacking context */
    z-index: 1;
}
```

## Customization Examples

### Tighter Stack (Cards Closer)
```css
top: calc(10vh + (var(--index) * 16px));  /* 16px instead of 24px */
```

### Looser Stack (More Spacing)
```css
top: calc(10vh + (var(--index) * 48px));  /* 48px instead of 24px */
```

### Lower Start Position
```css
top: calc(5vh + (var(--index) * 24px));   /* 5vh instead of 10vh */
```

### Higher Start Position
```css
top: calc(15vh + (var(--index) * 24px));  /* 15vh instead of 10vh */
```

## React/TypeScript Implementation

```tsx
// Set CSS custom property for each card
<div
    style={{
        '--index': index,
        top: `calc(10vh + ${index * 24}px)`,
        zIndex: 10 + index
    } as React.CSSProperties}
    className="sticky-card"
>
    {/* Card content */}
</div>
```

## Testing the Effect

### Quick Test Checklist
1. ✅ Open page in browser
2. ✅ Scroll down slowly
3. ✅ Watch first card "stick" at top
4. ✅ Continue scrolling
5. ✅ Watch second card stick below first
6. ✅ Continue until all cards stacked
7. ✅ Scroll back up to see cards "peel off"

### Debug Mode
Add this to see sticky positions:
```css
.card {
    outline: 2px solid red;  /* Shows card boundaries */
}
.card::before {
    content: 'Index: ' attr(data-index);
    position: absolute;
    top: 0;
    left: 0;
    background: yellow;
    color: black;
}
```

---

## Live Examples in Project

1. **Valparai Page**: 4 tourist destination cards
   - `/valparai` → Scroll to see stack

2. **Israel Page**: 5 biblical region cards
   - `/israel` → Scroll to see stack

3. **Demo HTML**: Ministry values cards
   - Open `stacking-cards-demo.html` in browser

---

**Created**: September 12, 2026  
**For**: City of Truth Ministries  
**Based On**: Antlion Stacking Cards HTML Example
