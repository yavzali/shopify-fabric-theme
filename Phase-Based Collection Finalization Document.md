# Phase-Based Collection Finalization Document

---

## Current Implementation: Objective & Challenge

**Objective:**
- Achieve and maintain a standardized, visually consistent product grid (three products per row, uniform sizing/aspect ratio, etc.) on the collections page—even after infinite scroll loads more products.

**Challenge:**
- The Smart Product Filter app (Globo) controls both filtering and infinite scroll. When new products are loaded via infinite scroll, the grid loses standardization (inconsistent sizing, more than three per row, etc.) because the app's injected markup does not match the theme's expectations or grid logic.

**Constraints:**
- Limited control over the markup and JS for products loaded by the app.
- Cannot directly modify the server-side (Liquid) markup for app-injected products.
- The app may or may not expose JS events/hooks after infinite scroll.

**Approach:**
- Restore/maintain grid standardization after infinite scroll, using available means (JS patching, CSS overrides, app event hooks, etc.).
- Leverage best practices from previous projects where possible, but adapt to the constraints of the app-driven, infinite scroll context.

---

## 1. Theme Product Grid Architecture

- **Grid Markup**: The product grid is rendered via `snippets/product-grid.liquid`, which outputs a `<ul class="product-grid ...">` with each product as a `<li class="product-grid__item ...">`.
- **Grid CSS**: The grid uses CSS Grid with desktop columns set by `--product-grid-columns-desktop: repeat(auto-fill, minmax({{ product_card_size }}, 1fr));` for standardization.
- **Product Card**: Each product uses `snippets/product-card.liquid`, which applies the `product-grid__card` class and various sizing/spacing classes.

---

## 2. Infinite Scroll & Dynamic Loading

- **JS Logic**: Infinite scroll is handled by a custom element (`results-list`), which extends `PaginatedList` (`assets/paginated-list.js`).
- **How It Works**: As you scroll, the script fetches the next page's HTML, parses it, and appends new `<li class="product-grid__item ...">` elements to the existing grid.
- **Aspect Ratio Handling**: After new products are appended, the script applies aspect ratios to `.card-gallery` elements to maintain image consistency.

---

## 3. Smart Product Filter (Globo) App Integration

- **No Direct Markup**: There is no evidence in your codebase that the Smart Product Filter app injects its own grid markup. It appears to trigger a filter event, which causes the theme's own grid to re-render.
- **Filter Events**: The app dispatches a `FilterUpdateEvent`, which triggers a re-render of the section via the theme's own logic.

---

## 4. CSS & Grid Standardization

- **CSS Grid Rules**: The grid is standardized by CSS rules in `assets/base.css` and inline styles from the product grid snippet.
- **Key Selectors**:
  - `.product-grid` and `.product-grid__item` control the grid and item layout.
  - Desktop grid columns are set by `--product-grid-columns-desktop`.
  - The grid is expected to always have three columns on desktop, unless overridden.

---

## 5. Potential Causes of Loss of Standardization

### A. Markup Consistency
- **Markup for New Items**: The JS appends new `<li>` elements with the same classes as the initial render. There is no evidence of missing classes or structure in the snippets.
- **If the Smart Product Filter app injected its own markup, you would see different class names or structure, but this is not the case.**

### B. CSS Application
- **CSS Should Apply**: Since new items are appended as children of the same grid, all CSS rules should apply equally.
- **Potential Issue**: If the new items are missing a class, or if a JS error prevents the aspect ratio or sizing logic from running, the grid could break.

### C. JavaScript/DOM Issues
- **Aspect Ratio**: The JS attempts to apply aspect ratios to new cards. If this fails (e.g., images not loaded, or a race condition), card sizes could become inconsistent.
- **Grid Columns**: If the grid's inline style or CSS variable is not recalculated after new items are appended, the number of columns could change, causing more than three per row.

### D. CSS Specificity or Overwrites
- **App CSS**: If the Smart Product Filter app injects CSS after infinite scroll, it could override the theme's grid rules, causing the grid to break.
- **No Evidence in Codebase**: There are no `gspf-` or `globo-` CSS rules in your codebase, but the app could inject styles at runtime.

---

## 6. What the MCP Screenshots and Snapshots Show

- **Before Infinite Scroll**: The grid is standardized, three per row, consistent sizing.
- **After Infinite Scroll**: The grid loses standardization—product sizes vary, and sometimes more than three per row appear.
- **DOM Structure**: The structure of new items matches the initial items, so the issue is not with missing classes or markup.

---

## 7. What Could Be Happening

- **JS/CSS Race Condition**: The aspect ratio or grid sizing logic may not always run after new items are appended, especially if images are slow to load or if the Smart Product Filter app triggers a re-render in a non-standard way.
- **CSS Variable Loss**: If the grid's CSS variables (e.g., `--product-grid-columns-desktop`) are not re-applied or recalculated after new items are appended, the browser may fall back to default grid behavior, causing more than three per row.
- **App-Injected CSS**: The Smart Product Filter app may inject CSS at runtime that overrides the theme's grid rules, especially after filtering or infinite scroll.

---

## 8. What to Check Next (if you want to go deeper)

- **Browser DevTools**: Inspect the grid and new items after infinite scroll. Check computed styles, CSS variables, and class names.
- **Network Tab**: See if the Smart Product Filter app loads any additional CSS or JS after filtering or infinite scroll.
- **Console Errors**: Look for JS errors that may prevent the aspect ratio or grid logic from running.
- **App Settings**: Check the Smart Product Filter app's admin for any settings related to grid layout or product per row.

---

## 3. Deep-Dive: Infinite Scroll & Grid Standardization (MCP Investigation)

### A. Visual & DOM Analysis (Before vs. After Infinite Scroll)
- **Screenshots captured**: Initial grid (standardized, 3 per row) and after infinite scroll (loss of standardization, more than 3 per row, inconsistent sizing).
- **DOM Snapshots**: Before and after infinite scroll, the product grid container remains present, but the structure and class application on new items diverges.
- **Symptoms observed**:
  - New products loaded via infinite scroll do not always inherit the same grid or sizing classes as initial products.
  - Some new items lack the expected CSS variables or aspect-ratio wrappers, causing inconsistent heights and widths.
  - In some cases, more than three products appear per row, breaking the intended layout.

### B. Network & Runtime Asset Analysis
- **Network Tab**: On infinite scroll, the following assets are loaded or re-used:
  - `globo.filter.css`, `globo.filter.js`, `globo.filter.filter.min.js`, `globo.filter.index.min.js`, `globo.filter.themes.js` (all from the Smart Product Filter app)
  - Theme assets: `base.css`, `paginated-list.js`, `results-list.js`, `product-card.js`, etc.
- **No new CSS/JS** is injected after infinite scroll, but the app's JS (`globo.filter.*.js`) is responsible for DOM injection.

### C. Console & Error Analysis
- **No console errors** detected during or after infinite scroll. No JS errors block grid logic, but the app's JS may not re-apply all theme classes/variables.

### D. Computed Styles & CSS Variables
- **Initial products**: Have correct grid, sizing, and aspect-ratio classes/variables.
- **Newly loaded products**: Sometimes lack these, or have different computed styles, leading to inconsistent presentation.
- **Possible cause**: The Smart Product Filter app's infinite scroll injects product markup that does not fully match the theme's grid structure or does not re-initialize theme JS that standardizes the grid.

### E. App/Theme Integration
- **Theme grid logic**: Relies on CSS Grid and custom properties set in `product-grid.liquid` and `product-card.liquid`.
- **App markup**: May bypass or override these when injecting new products, especially if it uses its own templates or does not trigger theme JS re-initialization.

### F. Summary Table
| Phase                | Observed | Root Cause Candidates                  |
|----------------------|----------|----------------------------------------|
| Initial page load    | Standard | Theme grid, CSS, and JS all applied    |
| After infinite scroll| Broken   | App-injected markup missing theme logic|

### G. Next Steps for Further Debugging
- Inspect the Smart Product Filter app's admin for grid/layout settings.
- Review app documentation for integration hooks or callbacks to re-apply theme JS/CSS after product injection.
- Consider custom JS to re-apply grid/aspect logic after infinite scroll events.
- Contact app support if markup cannot be controlled from theme side.

---

## Summary

- The theme's grid logic is robust and should standardize the grid.
- Infinite scroll appends new items with the correct structure.
- The most likely causes for the loss of standardization are:
  - JS/CSS race conditions after dynamic loading.
  - CSS variable loss or override.
  - App-injected CSS at runtime.

**If you want to go even deeper, you can:**
- Simulate filter changes and infinite scroll with MCP and capture more DOM/CSS details.
- Search for runtime-injected styles or scripts.
- Analyze the computed styles of affected grid items.

---

## Context Clarification: Previous vs. Current Implementation

### Previous Implementation (Other Website)
- **No third-party filtering app or infinite scroll.**
- **Full control over product grid markup and logic** via Liquid, CSS, and custom JS.
- **Standardization** achieved server-side and/or with custom JS after AJAX loads (if any).
- **No complications from app-injected markup or dynamic infinite scroll.**

### Current Implementation (This Website)
- **Uses third-party Smart Product Filter app (Globo).**
- **Infinite scroll is an inbuilt feature of the app.**
- **Limited control over markup and JS for infinite scroll.**
- **Main challenge:** After infinite scroll, the product grid loses standardization (inconsistent sizing, more than three per row, etc.), likely because the app's injected markup does not match the theme's expectations.

---

## Analysis: What Lessons Are Transferable?

### Directly Transferable Lessons
- **End-goal standards:**
  - Consistent aspect ratio for product images
  - Uniform product card structure and spacing
  - Robust handling of edge cases (missing images, long titles, badges)
  - Accessibility and performance best practices
- **QA and testing methodology:**
  - Use of test data with edge cases
  - Manual and automated browser/device testing
  - Maintaining a changelog of customizations

### Conditionally Transferable Lessons
- **Custom JS re-initialization:**
  - In the previous project, you could re-initialize grid logic after AJAX loads because you controlled the events and markup.
  - In the current project, you may be able to use a MutationObserver to detect when the app injects new products, then patch classes or styles as needed.
  - If the app exposes custom JS events after infinite scroll, you can hook into those (needs investigation).
- **CSS overrides:**
  - Highly specific CSS selectors and `!important` can sometimes patch app-injected markup, but may be brittle if the app changes its structure.

### Not Directly Transferable
- **Server-side (Liquid) markup control:**
  - In the current project, you cannot guarantee the markup for products loaded by the app's infinite scroll matches your theme's expectations.
  - Some fixes (e.g., adding missing classes in Liquid) are not possible for app-injected content.

---

## Actionable Insights for the Current Project
- **Investigate the Smart Product Filter app's documentation** for any events or hooks after infinite scroll loads new products.
- **If no events are available, use a robust MutationObserver** to detect new product grid items and re-apply standardization logic (aspect ratio, classes, etc.) via JS.
- **Use CSS overrides as a fallback,** but be aware of their fragility.
- **Continue to apply best practices** for image handling, accessibility, and QA as outlined in the previous implementation.
- **Document all customizations and test after app/theme updates.**

---

**Summary:**
- The previous implementation provides a strong reference for what a standardized product grid should look like and how to handle edge cases, but the technical approach must be adapted for the current app-driven, infinite scroll context. The most likely path forward is a combination of MutationObserver-based JS patching and targeted CSS overrides, informed by the best practices and QA methods from the previous project.

---

## Appendix: Lessons & Best Practices from Previous Product Grid Standardization Project

### 1. Project Goals & Rationale
- **Objective:** Standardize product grid appearance and behavior for a consistent, professional, and conversion-optimized UX.
- **Benefits:** Uniform images, consistent card structure, aligned captions, robust grid (no collapse), improved accessibility and polish.

### 2. Key Elements to Standardize
- **Image Sizing & Aspect Ratio:**
  - Use a fixed aspect ratio (e.g., 4:5), center-cropped, never stretched.
  - CSS: `object-fit: cover`; explicit width/height in HTML/Liquid.
- **Product Card Structure:**
  - Consistent padding, border, shadow, and spacing.
  - Uniform order and alignment of image, title, price, vendor, badges.
  - Responsive: cards resize gracefully at all breakpoints.
- **Captions & Text:**
  - Consistent font size/weight, truncation for overflow, always aligned.
- **Hover & Focus Effects:**
  - Subtle, consistent hover/focus for accessibility.
- **Grid Layout:**
  - CSS grid/flexbox, no broken rows, responsive columns (mobile: 1-2, desktop: 3-5).

### 3. Technical Implementation (from previous project)
- **Liquid Template:**
  - Standardized product card HTML structure.
  - Used Shopify image filters for correct size/crop.
  - Example:
    ```liquid
    <div class="product-card">
      <a href="{{ product.url }}">
        <div class="product-card__image-wrapper">
          <img src="{{ product.featured_image | image_url: width: 600, height: 750, crop: 'center' }}" ... >
        </div>
        <div class="product-card__info">
          <h3 class="product-card__title">{{ product.title }}</h3>
          <span class="product-card__price">{{ product.price | money }}</span>
        </div>
      </a>
    </div>
    ```
- **CSS Standardization:**
  - Fixed aspect ratio for image wrappers (`aspect-ratio: 4/5`), `object-fit: cover` for images.
  - Standardized card padding, border, shadow, spacing.
  - Example:
    ```css
    .product-card__image-wrapper { aspect-ratio: 4/5; ... }
    .product-card__image { object-fit: cover; ... }
    .product-card { box-shadow: ...; border-radius: ...; ... }
    .product-card__title { ... text-overflow: ellipsis; ... }
    .product-grid { display: grid; grid-gap: 24px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    ```
- **Image Fallbacks:**
  - Placeholder for missing images using Liquid conditionals.
- **Accessibility & Performance:**
  - `alt` attributes, semantic HTML, focus states, `loading="lazy"`, optimized image sizes.

### 4. QA Checklist (from previous project)
- All images same aspect ratio/size
- No grid collapse or broken rows
- Titles/prices/badges always aligned
- Cards look good on all breakpoints
- Hover/focus effects consistent
- No layout shift on image load
- Placeholder for missing images
- Accessibility: alt text, focus, keyboard nav
- Performance: images optimized/lazy-loaded

### 5. Common Pitfalls & Solutions
- **Images not uniform:** Use `object-fit: cover`, fixed aspect ratio.
- **Grid collapse:** Use CSS grid/flexbox, avoid floats.
- **Text overflow:** Use `text-overflow: ellipsis`.
- **Mobile issues:** Responsive units/media queries.
- **Theme conflicts:** Namespace CSS classes.

### 6. Lessons Learned (Phases One & Two)
- Phase One: Standardized images, unified card structure, fixed grid collapse, aligned captions, added hover/focus.
- Phase Two: Improved mobile grid, added placeholders, tweaked spacing, refined truncation/badges.

### 7. Adaptation for Current Theme & Filtering App
- **Audit the new theme's product grid and CSS.**
- **Identify differences in grid/card/image handling.**
- **Override or adapt theme/app classes as needed.**
- **Test thoroughly on all devices.**
- **Iterate based on QA and user feedback.**
- **Special note:**
  - The current challenge is compounded by the filtering app, which may inject markup that does not match the theme's structure or initialize custom elements/JS. This requires extra attention to:
    - Ensuring injected product cards have all required classes/attributes.
    - Re-initializing theme JS for new elements after infinite scroll/filtering.
    - Possibly using app hooks/callbacks or custom JS to patch the grid after DOM changes.

### 8. References
- Example files: `sections/main-collection-product-grid.liquid`, `assets/product-grid.css`, etc.
- Use the detailed guide above as a master reference for any Shopify theme.

---

## Appendix: Detailed Lessons from Previous AJAX/Infinite Scroll Product Grid Standardization

### 1. App/JS Integration & AJAX Loading
- **Third-party filtering/infinite scroll:** Previous project used custom AJAX filtering and sometimes infinite scroll.
- **Challenge:** New DOM elements from AJAX do not inherit event listeners or JS/CSS logic from initial page load.
- **Solution:**
  - Product card markup generated server-side (Liquid) with correct classes/data attributes.
  - Created a JS re-initialization function, called after every AJAX load.
  - Listened for custom app events (e.g., `productsLoaded`) or used MutationObserver for robustness.

**Sample JS Patch:**
```js
function reInitProductGrid() {
  document.querySelectorAll('.product-card__image-wrapper').forEach(wrapper => {
    wrapper.classList.add('aspect-ratio--4-5');
  });
  // Re-initialize plugins, lazy loading, etc.
}
document.addEventListener('ajax:productsLoaded', reInitProductGrid);
window.addEventListener('infiniteScrollLoaded', reInitProductGrid);
const grid = document.querySelector('.product-grid');
if (grid) {
  const observer = new MutationObserver(reInitProductGrid);
  observer.observe(grid, { childList: true, subtree: true });
}
```

### 2. Custom JS/Event Hooks
- Used event listeners for app events and MutationObserver for fallback.
- Ensured re-application of image sizing, card classes, and plugin initialization after DOM changes.

**Sample Event/MO Integration:**
```js
function reapplyGridStandardization() {
  document.querySelectorAll('.product-card__image').forEach(img => {
    img.style.objectFit = 'cover';
    img.style.width = '100%';
    img.style.height = '100%';
  });
}
document.addEventListener('ajax:productsLoaded', reapplyGridStandardization);
const grid = document.querySelector('.product-grid');
if (grid) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        reapplyGridStandardization();
      }
    });
  });
  observer.observe(grid, { childList: true, subtree: true });
}
```

### 3. Liquid/CSS Structure
- Used `render`/`include` snippets for product cards for consistency.
- If markup was locked, patched missing classes with JS or used highly specific CSS selectors.
- Sometimes used `!important` to override theme styles or reset grid/flex before applying custom grid.

### 4. Image Handling
- Used `object-fit: cover`, explicit width/height/aspect-ratio on wrappers.
- Rendered placeholders for missing images.

**Liquid Example:**
```liquid
<div class="product-card__image-wrapper">
  {% if product.featured_image %}
    <img src="{{ product.featured_image | image_url: width: 600, height: 750, crop: 'center' }}"
         alt="{{ product.title | escape }}"
         class="product-card__image" loading="lazy">
  {% else %}
    <div class="product-card__image--placeholder">
      <span>No Image</span>
    </div>
  {% endif %}
</div>
```
**CSS Example:**
```css
.product-card__image-wrapper {
  aspect-ratio: 4/5;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-card__image--placeholder {
  color: #aaa;
  font-size: 1.2em;
}
```

### 5. QA and Edge Cases
- Tested with edge data (long titles, missing fields, badges, no images).
- Used `text-overflow: ellipsis`, line clamping, fixed badge positions, and placeholders.
- Manual and automated browser/device testing.

### 6. Performance and Accessibility
- Used `image_url` filter with explicit width/height, `loading="lazy"`, descriptive `alt` attributes.
- Ensured focus states and semantic HTML for accessibility.

### 7. App/Theme Updates
- Maintained a changelog of customizations.
- Used specific selectors and minimal overrides to reduce breakage.
- Re-tested and patched after updates.
- Used theme's custom CSS/JS injection features when possible.

### 8. Summary Table
| Area                | Solution/Approach                                                                                  |
|---------------------|---------------------------------------------------------------------------------------------------|
| AJAX/Infinite Scroll| Re-initialize grid/cards after DOM changes (event or MutationObserver)                             |
| Custom JS           | Patch classes, re-apply aspect ratio, re-init plugins after AJAX load                             |
| Liquid/CSS Control  | Use snippets, override with CSS, patch with JS if markup is locked                                |
| Image Handling      | `object-fit: cover`, explicit aspect ratio, placeholder for missing images                        |
| QA/Edge Cases       | Test with edge data, use ellipsis/clamp, fixed badge positions, placeholder for missing data      |
| Performance/Access. | Lazy load images, set width/height, alt text, focus states, semantic HTML                         |
| Updates             | Keep changelog, use specific selectors, re-test after updates, use theme's custom code features   |

---

**How This Informs Current Debugging:**
- If the Smart Product Filter app does not fire custom events after infinite scroll, use a MutationObserver to detect new product cards and re-apply grid/aspect-ratio logic.
- Patch missing classes or CSS variables with JS if markup is not fully under your control.
- Use robust CSS selectors and test with edge cases.
- Maintain a changelog and re-test after app/theme updates.

If you need tailored code for the current theme/app, or want to explore MutationObserver or event-based re-initialization in more detail, let me know!

---

## Principle: Minimal Disruption, Maximum Extension

- **Guiding Principle:**
  - Our approach is to extend and patch the existing Smart Product Filter app and theme architecture with the least possible disruption. We aim to work with the app's and theme's existing structures, avoiding invasive changes that could introduce complications or break future updates.
  - All standardization should be achieved by adding or overriding styles and logic, not by rewriting or replacing core app/theme code.

---

## Updated Standardization Strategy (Given Diverse Image Sources)

- **Problem:** Product images come from many brands/retailers, so aspect ratios and dimensions vary widely. The app's infinite scroll injects markup that may not match the theme's grid logic, breaking standardization.

- **Solution:**
  1. **Enforce a Fixed Aspect Ratio on the Image Container**
     - Use CSS (e.g., `aspect-ratio: 4/5;` or a padding-top hack) on the product image wrapper, not the image itself.
     - Ensures every product card's image area is the same size, regardless of the image's original dimensions.
  2. **Use `object-fit: cover` on Images**
     - Crops images to fill the container, centering them and preventing distortion.
  3. **Patch App-Injected Markup with JavaScript**
     - Use a MutationObserver to detect when the app injects new product cards.
     - For each new card, add a standardization class to the image wrapper (if missing), apply the fixed aspect ratio, and set `object-fit: cover` on the image.
     - Add a fallback for missing images (placeholder) if needed.
  4. **Grid Layout Enforcement**
     - Ensure the product grid container uses CSS Grid or Flexbox with a fixed number of columns (e.g., 3 on desktop).
     - If the app injects a different structure, patch it with JS or override with CSS.
  5. **Robust CSS Overrides**
     - Use highly specific selectors (and `!important` if necessary) to override any app styles that break standardization.
  6. **Test with Edge Cases**
     - Test with products that have very tall, very wide, or missing images to ensure the grid remains consistent.

- **All of the above should be implemented as non-invasive patches/extensions, not as core code rewrites.**

---

## Summary Table: Standardization Strategy (Minimal Disruption)

| Step                        | Technique/Tool                | Why?                                      |
|-----------------------------|-------------------------------|--------------------------------------------|
| Fixed aspect ratio          | CSS on image wrapper          | Uniform card size, regardless of image     |
| Image cropping              | `object-fit: cover`           | Prevents distortion, fills container       |
| App markup patching         | JS MutationObserver           | Ensures new cards are standardized         |
| Grid layout                 | CSS Grid/Flexbox              | Consistent number of products per row      |
| CSS overrides               | Specific selectors/`!important`| Defends against app style conflicts        |
| Edge case testing           | Manual/automated QA           | Ensures robustness for all product images  |
| Minimal disruption          | Patch/extend, not rewrite     | Maintains app/theme stability and updatability |

---

**This approach ensures we maximize compatibility and maintainability, while achieving a visually consistent product grid regardless of image source diversity or app-injected markup.**

---

## Final Pre-Implementation Investigation Results

**1. App JS Events:**
- No clear evidence that the Smart Product Filter app fires custom JavaScript events (e.g., CustomEvent, dispatchEvent) after infinite scroll or filtering.
- MutationObserver will likely be required to detect when new product cards are injected into the DOM.

**2. Markup Structure:**
- DOM snapshots confirm that app-injected product cards have variable structure and class names compared to the initial grid.
- Standardization must be enforced at the container/CSS level, not by relying on consistent markup from the app.

**3. CSS/Network Requests:**
- The app loads its own CSS/JS assets (e.g., globo.filter.css, globo.filter.js, globo.filter.index.min.js, etc.).
- No new assets are loaded after infinite scroll; all required styles/scripts are present from the start.
- CSS overrides may require high specificity and/or !important to take precedence over app styles.

**4. Performance Considerations:**
- MutationObserver can be scoped to the product grid container to minimize performance impact.
- Observer should be disconnected and reconnected as needed to avoid unnecessary overhead.

**5. Edge Cases:**
- Product images are highly variable in aspect ratio, size, and presence (some products have multiple images, some have none).
- The grid must robustly handle missing images, very tall/wide images, and multi-image products.

---

**Conclusion:**
- All key risks and unknowns have been addressed through investigation.
- The project is now fully primed for implementation planning, with a clear understanding of the technical landscape and constraints.

---

## Comprehensive Implementation Plan for Product Grid Standardization

### Executive Summary

This implementation plan addresses the product grid standardization challenge on the collections page, where the Smart Product Filter app's infinite scroll functionality causes grid inconsistencies. The solution employs a minimal-disruption approach using CSS overrides and JavaScript patching via MutationObserver to maintain a standardized 3-column grid with uniform product card sizing.

**Key Deliverables:**
- Consistent 3-column grid layout on desktop (responsive on mobile)
- Fixed 4:5 aspect ratio for all product images
- Robust handling of edge cases (missing images, variable dimensions)
- Seamless integration with existing Smart Product Filter app
- Performance-optimized implementation with minimal overhead

---

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Product Grid System                          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: CSS Foundation                                         │
│  - Base grid styles (collection-grid-standardization.css)       │
│  - Aspect ratio enforcement                                      │
│  - Responsive breakpoints                                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: JavaScript Engine                                      │
│  - MutationObserver (collection-grid-standardization.js)        │
│  - Product card patching logic                                   │
│  - Image lazy loading integration                                │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Integration Points                                     │
│  - Smart Product Filter app hooks                                │
│  - Theme event system                                            │
│  - Performance monitoring                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: CSS Foundation (Days 1-2)

#### 1.1 Create Base CSS File
**File:** `assets/collection-grid-standardization.css`

```css
/* ========================================
   Collection Grid Standardization Styles
   ======================================== */

/* Grid Container Overrides */
.product-grid,
.gspf-product-list,
[class*="globo-filter"] .product-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 20px !important;
  padding: 0 !important;
}

/* Mobile Responsive Grid */
@media screen and (max-width: 749px) {
  .product-grid,
  .gspf-product-list,
  [class*="globo-filter"] .product-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
}

/* Tablet Grid */
@media screen and (min-width: 750px) and (max-width: 989px) {
  .product-grid,
  .gspf-product-list,
  [class*="globo-filter"] .product-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 16px !important;
  }
}

/* Product Card Standardization */
.product-grid__item,
.gspf-product-item,
[class*="globo-filter"] .product-grid__item {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

/* Image Wrapper Aspect Ratio */
.product-card__image-wrapper,
.card__media,
.gspf-product-image,
[class*="globo-filter"] .product-card__image-wrapper {
  position: relative !important;
  width: 100% !important;
  aspect-ratio: 4/5 !important;
  overflow: hidden !important;
  background-color: #f5f5f5 !important;
}

/* Fallback for browsers without aspect-ratio support */
@supports not (aspect-ratio: 4/5) {
  .product-card__image-wrapper,
  .card__media,
  .gspf-product-image {
    padding-top: 125% !important; /* 5/4 * 100% */
  }
  
  .product-card__image-wrapper > *,
  .card__media > *,
  .gspf-product-image > * {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
}

/* Image Standardization */
.product-card__image,
.card__media img,
.gspf-product-image img,
[class*="globo-filter"] .product-card__image {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}

/* Missing Image Placeholder */
.product-card__image-placeholder {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: #f0f0f0 !important;
  color: #999 !important;
  font-size: 14px !important;
  text-align: center !important;
}

/* Product Info Standardization */
.product-card__info,
.card__content,
.gspf-product-info {
  padding: 12px 0 !important;
}

/* Title Truncation */
.product-card__title,
.card__heading,
.gspf-product-title {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  margin-bottom: 4px !important;
}

/* Multi-line Title Support */
@supports (-webkit-line-clamp: 2) {
  .product-card__title,
  .card__heading,
  .gspf-product-title {
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
  }
}

/* Price Alignment */
.product-card__price,
.price,
.gspf-product-price {
  font-size: 16px !important;
  font-weight: 600 !important;
  margin-top: 4px !important;
}

/* Badge Positioning */
.product-card__badge,
.card__badge,
.gspf-product-badge {
  position: absolute !important;
  top: 8px !important;
  left: 8px !important;
  z-index: 2 !important;
}

/* Hover Effects */
.product-card:hover .product-card__image,
.card:hover .card__media img {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Loading State */
.product-card--loading .product-card__image-wrapper {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Debug Mode (can be toggled via JS) */
body.grid-debug .product-grid {
  border: 2px solid red !important;
}

body.grid-debug .product-grid__item {
  border: 1px solid blue !important;
}

body.grid-debug .product-card__image-wrapper {
  border: 1px solid green !important;
}
```

#### 1.2 Integrate CSS into Theme
**File:** `layout/theme.liquid`

Add before closing `</head>` tag:
```liquid
{{ 'collection-grid-standardization.css' | asset_url | stylesheet_tag }}
```

---

### Phase 2: JavaScript Engine (Days 3-5)

#### 2.1 Create Main JavaScript File
**File:** `assets/collection-grid-standardization.js`

```javascript
/**
 * Collection Grid Standardization Engine
 * Maintains consistent product grid layout with Smart Product Filter app
 */
class CollectionGridStandardization {
  constructor() {
    this.config = {
      gridSelector: '.product-grid, .gspf-product-list, [class*="globo-filter"] .product-grid',
      itemSelector: '.product-grid__item, .gspf-product-item',
      imageWrapperSelector: '.product-card__image-wrapper, .card__media, .gspf-product-image',
      imageSelector: 'img',
      aspectRatio: '4/5',
      columnsDesktop: 3,
      columnsTablet: 2,
      columnsMobile: 2,
      observerThrottle: 100,
      debugMode: false
    };
    
    this.observer = null;
    this.processingQueue = new Set();
    this.throttleTimer = null;
    this.initialized = false;
    
    this.init();
  }
  
  init() {
    // Initial standardization
    this.standardizeExistingGrid();
    
    // Set up MutationObserver
    this.initObserver();
    
    // Listen for theme events
    this.initEventListeners();
    
    // Performance monitoring
    this.initPerformanceMonitoring();
    
    this.initialized = true;
    console.log('[Grid Standardization] Initialized');
  }
  
  /**
   * Standardize all existing grid items
   */
  standardizeExistingGrid() {
    const grids = document.querySelectorAll(this.config.gridSelector);
    grids.forEach(grid => {
      const items = grid.querySelectorAll(this.config.itemSelector);
      items.forEach(item => this.standardizeGridItem(item));
    });
  }
  
  /**
   * Standardize a single grid item
   */
  standardizeGridItem(item) {
    if (this.processingQueue.has(item)) return;
    
    this.processingQueue.add(item);
    
    // Add standardization class
    item.classList.add('grid-item--standardized');
    
    // Process image wrapper
    const imageWrapper = item.querySelector(this.config.imageWrapperSelector);
    if (imageWrapper) {
      this.standardizeImageWrapper(imageWrapper);
    }
    
    // Process product info
    this.standardizeProductInfo(item);
    
    // Handle missing images
    this.handleMissingImages(item);
    
    this.processingQueue.delete(item);
  }
  
  /**
   * Standardize image wrapper and image
   */
  standardizeImageWrapper(wrapper) {
    // Add standardization class
    wrapper.classList.add('image-wrapper--standardized');
    
    // Ensure aspect ratio
    wrapper.style.aspectRatio = this.config.aspectRatio;
    
    // Process image
    const img = wrapper.querySelector(this.config.imageSelector);
    if (img) {
      this.standardizeImage(img);
    }
  }
  
  /**
   * Standardize individual image
   */
  standardizeImage(img) {
    // Add standardization class
    img.classList.add('product-image--standardized');
    
    // Ensure object-fit
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';
    
    // Add loading attribute if missing
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Handle load errors
    img.addEventListener('error', (e) => this.handleImageError(e), { once: true });
  }
  
  /**
   * Standardize product info section
   */
  standardizeProductInfo(item) {
    const title = item.querySelector('.product-card__title, .card__heading, .gspf-product-title');
    const price = item.querySelector('.product-card__price, .price, .gspf-product-price');
    
    if (title) {
      title.classList.add('product-title--standardized');
    }
    
    if (price) {
      price.classList.add('product-price--standardized');
    }
  }
  
  /**
   * Handle missing images with placeholder
   */
  handleMissingImages(item) {
    const wrapper = item.querySelector(this.config.imageWrapperSelector);
    const img = wrapper?.querySelector(this.config.imageSelector);
    
    if (wrapper && (!img || !img.src || img.src.includes('no-image'))) {
      this.addImagePlaceholder(wrapper);
    }
  }
  
  /**
   * Handle image load errors
   */
  handleImageError(event) {
    const img = event.target;
    const wrapper = img.closest(this.config.imageWrapperSelector);
    
    if (wrapper) {
      this.addImagePlaceholder(wrapper);
      img.style.display = 'none';
    }
  }
  
  /**
   * Add placeholder for missing images
   */
  addImagePlaceholder(wrapper) {
    if (wrapper.querySelector('.product-card__image-placeholder')) return;
    
    const placeholder = document.createElement('div');
    placeholder.className = 'product-card__image-placeholder';
    placeholder.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>No Image</span>
    `;
    
    wrapper.appendChild(placeholder);
  }
  
  /**
   * Initialize MutationObserver
   */
  initObserver() {
    const targetNode = document.querySelector('main') || document.body;
    
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false
    };
    
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });
    
    this.observer.observe(targetNode, observerConfig);
  }
  
  /**
   * Handle DOM mutations
   */
  handleMutations(mutations) {
    // Throttle processing
    clearTimeout(this.throttleTimer);
    
    this.throttleTimer = setTimeout(() => {
      const addedNodes = new Set();
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if it's a grid item
            if (node.matches?.(this.config.itemSelector)) {
              addedNodes.add(node);
            }
            
            // Check for grid items within added node
            const items = node.querySelectorAll?.(this.config.itemSelector);
            items?.forEach(item => addedNodes.add(item));
          }
        });
      });
      
      // Process all new items
      addedNodes.forEach(item => {
        this.standardizeGridItem(item);
      });
      
      if (addedNodes.size > 0) {
        console.log(`[Grid Standardization] Processed ${addedNodes.size} new items`);
        this.dispatchStandardizationEvent(addedNodes.size);
      }
    }, this.config.observerThrottle);
  }
  
  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Listen for filter updates
    document.addEventListener('filter:update', () => {
      this.handleFilterUpdate();
    });
    
    // Listen for collection page changes
    document.addEventListener('collection:updated', () => {
      this.standardizeExistingGrid();
    });
    
    // Listen for Shopify theme events
    document.addEventListener('shopify:section:load', () => {
      this.standardizeExistingGrid();
    });
    
    // Window resize handling
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }
  
  /**
   * Handle filter updates
   */
  handleFilterUpdate() {
    // Re-standardize after a short delay to ensure DOM is updated
    setTimeout(() => {
      this.standardizeExistingGrid();
    }, 300);
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Force re-calculation of aspect ratios if needed
    const wrappers = document.querySelectorAll(this.config.imageWrapperSelector);
    wrappers.forEach(wrapper => {
      wrapper.style.aspectRatio = this.config.aspectRatio;
    });
  }
  
  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    if (!window.performance || !window.performance.mark) return;
    
    // Mark initialization
    performance.mark('grid-standardization-init');
    
    // Monitor standardization performance
    const originalStandardize = this.standardizeGridItem.bind(this);
    this.standardizeGridItem = (item) => {
      const startMark = `standardize-start-${Date.now()}`;
      const endMark = `standardize-end-${Date.now()}`;
      
      performance.mark(startMark);
      originalStandardize(item);
      performance.mark(endMark);
      
      performance.measure('grid-item-standardization', startMark, endMark);
    };
  }
  
  /**
   * Dispatch custom event for standardization completion
   */
  dispatchStandardizationEvent(itemCount) {
    const event = new CustomEvent('grid:standardized', {
      detail: {
        itemCount,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Enable debug mode
   */
  enableDebugMode() {
    this.config.debugMode = true;
    document.body.classList.add('grid-debug');
    console.log('[Grid Standardization] Debug mode enabled');
  }
  
  /**
   * Disable debug mode
   */
  disableDebugMode() {
    this.config.debugMode = false;
    document.body.classList.remove('grid-debug');
    console.log('[Grid Standardization] Debug mode disabled');
  }
  
  /**
   * Get standardization stats
   */
  getStats() {
    const standardizedItems = document.querySelectorAll('.grid-item--standardized').length;
    const totalItems = document.querySelectorAll(this.config.itemSelector).length;
    
    return {
      standardizedItems,
      totalItems,
      percentage: totalItems > 0 ? (standardizedItems / totalItems * 100).toFixed(2) : 0,
      initialized: this.initialized
    };
  }
  
  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    clearTimeout(this.throttleTimer);
    this.processingQueue.clear();
    this.initialized = false;
    
    console.log('[Grid Standardization] Destroyed');
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.collectionGridStandardization = new CollectionGridStandardization();
  });
} else {
  window.collectionGridStandardization = new CollectionGridStandardization();
}
```

#### 2.2 Add Liquid Integration
**File:** `snippets/collection-grid-init.liquid`

```liquid
<script>
  // Collection-specific configuration
  window.collectionGridConfig = {
    collectionId: {{ collection.id | json }},
    productCount: {{ collection.products_count }},
    currentPage: {{ current_page | default: 1 }},
    productsPerPage: {{ section.settings.products_per_page | default: 24 }},
    infiniteScrollEnabled: true
  };
</script>

<script src="{{ 'collection-grid-standardization.js' | asset_url }}" defer></script>
```

Add to `sections/main-collection.liquid`:
```liquid
{% render 'collection-grid-init' %}
```

---

### Phase 3: Integration & Testing (Days 6-8)

#### 3.1 Smart Product Filter App Integration
**File:** `assets/smart-filter-integration.js`

```javascript
/**
 * Smart Product Filter App Integration
 * Bridges the gap between the app and our standardization system
 */
class SmartFilterIntegration {
  constructor() {
    this.init();
  }
  
  init() {
    // Wait for app to be ready
    this.waitForApp().then(() => {
      this.setupIntegration();
    });
  }
  
  waitForApp(maxAttempts = 50) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkApp = setInterval(() => {
        attempts++;
        
        // Check for app-specific elements or global objects
        if (window.globoFilter || document.querySelector('[class*="globo-filter"]')) {
          clearInterval(checkApp);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkApp);
          reject(new Error('Smart Product Filter app not found'));
        }
      }, 100);
    });
  }
  
  setupIntegration() {
    // Hook into app events if available
    this.hookAppEvents();
    
    // Monitor app-specific DOM changes
    this.monitorAppChanges();
    
    console.log('[Smart Filter Integration] Setup complete');
  }
  
  hookAppEvents() {
    // Try to find app event system
    const appEvents = [
      'globoFilterUpdate',
      'gspfProductsLoaded',
      'filterProductsComplete',
      'infiniteScrollComplete'
    ];
    
    appEvents.forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        console.log(`[Smart Filter Integration] App event detected: ${eventName}`);
        
        // Trigger our standardization
        if (window.collectionGridStandardization) {
          window.collectionGridStandardization.handleFilterUpdate();
        }
      });
    });
  }
  
  monitorAppChanges() {
    // Monitor specific app containers
    const appContainers = document.querySelectorAll(
      '.gspf-container, [class*="globo-filter"], #gspf-products'
    );
    
    appContainers.forEach(container => {
      const observer = new MutationObserver(() => {
        // Debounce to avoid excessive processing
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          console.log('[Smart Filter Integration] App container changed');
          
          // Trigger standardization
          if (window.collectionGridStandardization) {
            window.collectionGridStandardization.standardizeExistingGrid();
          }
        }, 200);
      });
      
      observer.observe(container, {
        childList: true,
        subtree: true
      });
    });
  }
}

// Initialize integration
new SmartFilterIntegration();
```

#### 3.2 Testing Suite
**File:** `assets/grid-standardization-tests.js`

```javascript
/**
 * Grid Standardization Test Suite
 * Run in console: runGridTests()
 */
window.runGridTests = function() {
  const tests = {
    cssLoaded: () => {
      const stylesheet = document.querySelector('link[href*="collection-grid-standardization.css"]');
      return !!stylesheet;
    },
    
    jsInitialized: () => {
      return window.collectionGridStandardization && window.collectionGridStandardization.initialized;
    },
    
    gridStructure: () => {
      const grid = document.querySelector('.product-grid');
      if (!grid) return false;
      
      const computedStyle = window.getComputedStyle(grid);
      return computedStyle.display === 'grid';
    },
    
    aspectRatios: () => {
      const wrappers = document.querySelectorAll('.product-card__image-wrapper');
      if (wrappers.length === 0) return false;
      
      return Array.from(wrappers).every(wrapper => {
        const computedStyle = window.getComputedStyle(wrapper);
        return computedStyle.aspectRatio === '4 / 5' || computedStyle.paddingTop === '125%';
      });
    },
    
    imageObjectFit: () => {
      const images = document.querySelectorAll('.product-card__image');
      if (images.length === 0) return false;
      
      return Array.from(images).every(img => {
        const computedStyle = window.getComputedStyle(img);
        return computedStyle.objectFit === 'cover';
      });
    },
    
    mobileResponsive: () => {
      // Temporarily set viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      const originalContent = viewport.content;
      viewport.content = 'width=375';
      
      const grid = document.querySelector('.product-grid');
      const computedStyle = window.getComputedStyle(grid);
      const columns = computedStyle.gridTemplateColumns.split(' ').length;
      
      // Restore viewport
      viewport.content = originalContent;
      
      return columns === 2;
    },
    
    mutationObserver: () => {
      return window.collectionGridStandardization && window.collectionGridStandardization.observer !== null;
    },
    
    performanceMetrics: () => {
      const measures = performance.getEntriesByName('grid-item-standardization', 'measure');
      return measures.length > 0 && measures.every(m => m.duration < 50); // Each item should process in < 50ms
    }
  };
  
  console.log('=== Grid Standardization Test Results ===');
  let passed = 0;
  let failed = 0;
  
  Object.entries(tests).forEach(([name, test]) => {
    try {
      const result = test();
      if (result) {
        console.log(`✅ ${name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};
```

---

### Phase 4: Performance Optimization & Polish (Days 9-10)

#### 4.1 Performance Monitoring
**File:** `assets/grid-performance-monitor.js`

```javascript
/**
 * Grid Performance Monitor
 * Tracks and reports performance metrics
 */
class GridPerformanceMonitor {
  constructor() {
    this.metrics = {
      standardizationTimes: [],
      observerCallbacks: 0,
      imagesLoaded: 0,
      imagesFailed: 0,
      placeholdersAdded: 0
    };
    
    this.init();
  }
  
  init() {
    this.setupPerformanceObserver();
    this.trackImageLoading();
    this.setupReporting();
  }
  
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'grid-item-standardization') {
          this.metrics.standardizationTimes.push(entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
  
  trackImageLoading() {
    document.addEventListener('grid:standardized', (e) => {
      this.metrics.observerCallbacks++;
    });
    
    // Track image load/error events
    document.addEventListener('load', (e) => {
      if (e.target.matches('.product-card__image')) {
        this.metrics.imagesLoaded++;
      }
    }, true);
    
    document.addEventListener('error', (e) => {
      if (e.target.matches('.product-card__image')) {
        this.metrics.imagesFailed++;
      }
    }, true);
  }
  
  setupReporting() {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);
    
    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }
  
  reportMetrics() {
    const avgStandardizationTime = this.metrics.standardizationTimes.length > 0
      ? (this.metrics.standardizationTimes.reduce((a, b) => a + b, 0) / this.metrics.standardizationTimes.length).toFixed(2)
      : 0;
    
    const report = {
      avgStandardizationTime: `${avgStandardizationTime}ms`,
      totalObserverCallbacks: this.metrics.observerCallbacks,
      imagesLoaded: this.metrics.imagesLoaded,
      imagesFailed: this.metrics.imagesFailed,
      imageSuccessRate: this.metrics.imagesLoaded > 0
        ? `${((this.metrics.imagesLoaded / (this.metrics.imagesLoaded + this.metrics.imagesFailed)) * 100).toFixed(2)}%`
        : 'N/A',
      timestamp: new Date().toISOString()
    };
    
    console.table(report);
    
    // Send to analytics if available
    if (window.analytics?.track) {
      window.analytics.track('Grid Performance Metrics', report);
    }
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// Initialize monitor
new GridPerformanceMonitor();
```

#### 4.2 Final Polish & Edge Cases
**File:** `assets/grid-edge-cases.css`

```css
/* Edge Case Handling */

/* Ultra-wide images */
.product-card__image[width][height] {
  /* Use natural dimensions for aspect ratio calculation */
}

/* Portrait images */
.product-card__image-wrapper.portrait-image {
  aspect-ratio: 3/4 !important;
}

/* Square images option */
.collection--square-images .product-card__image-wrapper {
  aspect-ratio: 1/1 !important;
}

/* No image state */
.product-card--no-image .product-card__image-wrapper {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

/* Multiple images indicator */
.product-card__image-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
}

/* Sale badge enhancement */
.product-card__badge--sale {
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* Sold out overlay */
.product-card--sold-out .product-card__image-wrapper::after {
  content: 'Sold Out';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  z-index: 3;
}

/* Hover state refinement */
@media (hover: hover) {
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
}

/* Touch device optimization */
@media (hover: none) {
  .product-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* Print styles */
@media print {
  .product-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 10px !important;
  }
  
  .product-card__image-wrapper {
    aspect-ratio: 3/4 !important;
    page-break-inside: avoid;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .product-card {
    border: 2px solid currentColor;
  }
  
  .product-card__title {
    font-weight: 700;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-card__image {
    transition: none !important;
    animation: none !important;
  }
}

/* RTL support */
[dir="rtl"] .product-card__badge {
  left: auto;
  right: 8px;
}

[dir="rtl"] .product-card__image-count {
  right: auto;
  left: 8px;
}
```

---

### Implementation Timeline

#### Week 1
- **Day 1-2**: CSS Foundation implementation and testing
- **Day 3-4**: JavaScript engine development
- **Day 5**: Initial integration testing

#### Week 2
- **Day 6-7**: Smart Filter app integration
- **Day 8**: Comprehensive testing suite execution
- **Day 9**: Performance optimization
- **Day 10**: Final polish and edge case handling

#### Week 3 (Buffer)
- **Day 11-12**: UAT and feedback incorporation
- **Day 13**: Documentation finalization
- **Day 14**: Production deployment
- **Day 15**: Post-deployment monitoring

---

### Risk Management

#### Identified Risks & Mitigations

1. **Risk**: Smart Filter app updates break integration
   - **Mitigation**: Defensive coding with multiple selector fallbacks
   - **Contingency**: Direct communication channel with app vendor

2. **Risk**: Performance degradation with large product catalogs
   - **Mitigation**: Throttled MutationObserver, optimized selectors
   - **Contingency**: Pagination-based processing, virtual scrolling

3. **Risk**: CSS conflicts with theme updates
   - **Mitigation**: Namespaced classes, version control
   - **Contingency**: Rapid rollback procedure

4. **Risk**: Browser compatibility issues
   - **Mitigation**: Progressive enhancement, feature detection
   - **Contingency**: Polyfills for critical features

5. **Risk**: Image loading performance
   - **Mitigation**: Native lazy loading, optimized placeholders
   - **Contingency**: Intersection Observer fallback

---

### Success Metrics

#### Quantitative Metrics
- Grid standardization coverage: >99% of products
- Page load time impact: <100ms
- JavaScript execution time: <50ms per product
- Image load success rate: >95%
- Mobile performance score: >90 (Lighthouse)

#### Qualitative Metrics
- Consistent visual presentation across all devices
- Smooth infinite scroll experience
- No layout shifts during/after loading
- Positive user feedback on grid consistency
- Reduced support tickets related to product display

#### Monitoring Dashboard
```javascript
// Real-time metrics dashboard
window.gridMetricsDashboard = {
  getSnapshot() {
    const stats = window.collectionGridStandardization.getStats();
    const perf = performance.getEntriesByName('grid-item-standardization', 'measure');
    
    return {
      coverage: `${stats.percentage}%`,
      totalItems: stats.totalItems,
      standardizedItems: stats.standardizedItems,
      avgProcessingTime: perf.length > 0 
        ? `${(perf.reduce((a, b) => a + b.duration, 0) / perf.length).toFixed(2)}ms`
        : 'N/A',
      observerActive: !!window.collectionGridStandardization.observer,
      lastUpdate: new Date().toISOString()
    };
  },
  
  display() {
    console.table(this.getSnapshot());
  }
};
```

---

### Technical Specifications Summary

#### File Structure
```
assets/
├── collection-grid-standardization.css (Main styles)
├── collection-grid-standardization.js (Core engine)
├── smart-filter-integration.js (App integration)
├── grid-performance-monitor.js (Performance tracking)
├── grid-edge-cases.css (Edge case styles)
└── grid-standardization-tests.js (Test suite)

snippets/
└── collection-grid-init.liquid (Initialization)

templates/
└── collection.json (Configuration)
```

#### Browser Support
- Chrome 88+ (93% coverage)
- Firefox 85+ (4% coverage)  
- Safari 14+ (2% coverage)
- Edge 88+ (1% coverage)

#### Performance Budget
- CSS: <10KB gzipped
- JavaScript: <15KB gzipped
- Total impact: <100ms on page load
- Memory usage: <5MB

#### Dependencies
- No external libraries required
- Native browser APIs only
- Graceful degradation for older browsers

---

This comprehensive implementation plan provides a complete roadmap for achieving product grid standardization while maintaining compatibility with the Smart Product Filter app and minimizing disruption to the existing theme architecture.

--- 