/**
 * Collection Grid Standardization Engine
 * Maintains consistent product grid layout with Smart Product Filter app
 */
class CollectionGridStandardization {
  constructor() {
    this.config = {
      gridSelector: '.product-grid, .gspf-product-list, [class*="globo-filter"] .product-grid',
      itemSelector: '.product-grid__item, .gspf-product-item, li.product-grid__item, .product-grid > li',
      imageWrapperSelector: '.product-card__image-wrapper, .card__media, .gspf-product-image, .product-card__image',
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
    
    // Handle list items specifically
    if (item.tagName === 'LI') {
      item.style.listStyle = 'none';
      item.style.margin = '0';
      item.style.padding = '0';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
    }
    
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