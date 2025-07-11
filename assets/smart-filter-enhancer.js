/**
 * Smart Filter Enhancer - Phase 1: Modest Filter Auto-Apply
 * Simple, reliable auto-application of modest filter on All Products page
 * Preserves existing grid standardization and Smart Product Filter functionality
 */
class SmartFilterEnhancer {
  constructor() {
    this.config = {
      // Filter parameters discovered via MCP testing
      modestFilterParam: 'gf_516964',
      modestFilterValue: 'Modest',
      retailerFilterParam: 'gf_516921',
      allProductsPath: '/collections/all',
      debugMode: true
    };
    
    this.init();
  }
  
  /**
   * Simple initialization - no complex waiting
   */
  init() {
    this.log('🚀 Smart Filter Enhancer starting...');
    
    // Phase 1: Auto-apply modest filter on All Products collection
    if (this.shouldApplyModestFilter()) {
      this.applyModestFilter();
    }
    
    // Phase 2: Handle retailer collection redirects
    if (this.shouldRedirectRetailerCollection()) {
      this.redirectToFilteredAllProducts();
    }
  }
  
  /**
   * Check if we should apply the modest filter
   */
  shouldApplyModestFilter() {
    const isAllProductsPage = window.location.pathname === this.config.allProductsPath;
    const urlParams = new URLSearchParams(window.location.search);
    const modestFilterAlreadyApplied = urlParams.get(this.config.modestFilterParam) === this.config.modestFilterValue;
    
    this.log(`📍 Page Analysis:`);
    this.log(`   - Current path: ${window.location.pathname}`);
    this.log(`   - Is All Products: ${isAllProductsPage}`);
    this.log(`   - Modest filter applied: ${modestFilterAlreadyApplied}`);
    
    const shouldApply = isAllProductsPage && !modestFilterAlreadyApplied;
    this.log(`🎯 Should apply filter: ${shouldApply}`);
    
    return shouldApply;
  }
  
  /**
   * Apply modest filter immediately via URL redirect
   */
  applyModestFilter() {
    this.log('✅ Conditions met - applying modest filter');
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(this.config.modestFilterParam, this.config.modestFilterValue);
    
    const newUrl = this.config.allProductsPath + '?' + urlParams.toString();
    this.log(`🔄 Redirecting to: ${window.location.origin}${newUrl}`);
    window.location.href = newUrl;
  }
  
  /**
   * Check if we should redirect to a filtered All Products page
   */
  shouldRedirectRetailerCollection() {
    const currentPath = window.location.pathname;
    
    // Check if we're on a retailer collection page
    if (currentPath === '/collections/asos') return true;
    if (currentPath === '/collections/uniqlo') return true;
    if (currentPath === '/collections/mango') return true;
    if (currentPath === '/collections/revolve') return true;
    
    return false;
  }
  
  /**
   * Redirect to a filtered All Products page
   */
  redirectToFilteredAllProducts() {
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract retailer from current path
    let retailerName = '';
    if (currentPath === '/collections/asos') retailerName = 'ASOS';
    else if (currentPath === '/collections/uniqlo') retailerName = 'Uniqlo';
    else if (currentPath === '/collections/mango') retailerName = 'Mango';
    else if (currentPath === '/collections/revolve') retailerName = 'Revolve';
    
    if (!retailerName) {
      this.log('❌ Unknown retailer collection');
      return;
    }
    
    this.log(`🏪 Retailer collection detected: ${retailerName}`);
    
    // Build new URL with both filters
    const newParams = new URLSearchParams();
    
    // Add modest filter
    newParams.set(this.config.modestFilterParam, this.config.modestFilterValue);
    
    // Add retailer filter
    newParams.set(this.config.retailerFilterParam, retailerName);
    
    // Preserve existing page parameter if it exists
    const page = urlParams.get('page');
    if (page) {
      newParams.set('page', page);
    }
    
    const newUrl = this.config.allProductsPath + '?' + newParams.toString();
    this.log(`🔄 Redirecting retailer collection to: ${window.location.origin}${newUrl}`);
    window.location.href = newUrl;
  }
  
  log(message) {
    if (this.config.debugMode) {
      console.log('[Smart Filter Enhancer] ' + message);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    new SmartFilterEnhancer();
  });
} else {
  new SmartFilterEnhancer();
}