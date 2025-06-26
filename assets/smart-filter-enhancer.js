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
      modestFilterValue: 'modest',
      allProductsPath: '/collections/all',
      debugMode: true
    };
    
    this.log('🚀 Smart Filter Enhancer starting...');
    
    // Simple, immediate initialization
    this.init();
  }
  
  /**
   * Simple initialization - no complex waiting
   */
  init() {
    try {
      this.log('🔍 Checking if modest filter should be applied...');
      
      // Check if we should apply the filter
      if (this.shouldApplyModestFilter()) {
        this.log('✅ Conditions met - applying modest filter');
        this.applyModestFilter();
      } else {
        this.log('ℹ️ Filter not needed - already applied or wrong page');
      }
      
    } catch (error) {
      this.log('❌ Error during initialization:', error);
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
    this.log('🔄 Applying modest filter via URL...');
    
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set(this.config.modestFilterParam, this.config.modestFilterValue);
    
    this.log(`🔄 Redirecting to: ${currentUrl.toString()}`);
    
    // Use replace to avoid adding to browser history
    window.location.replace(currentUrl.toString());
  }
  
  /**
   * Logging utility
   */
  log(...args) {
    if (this.config.debugMode) {
      console.log('[Smart Filter Enhancer]', ...args);
    }
  }
  
  /**
   * Get current status for debugging
   */
  getStatus() {
    return {
      currentPath: window.location.pathname,
      currentParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      isAllProductsPage: window.location.pathname === this.config.allProductsPath,
      modestFilterApplied: new URLSearchParams(window.location.search).get(this.config.modestFilterParam) === this.config.modestFilterValue
    };
  }
}

// Initialize immediately when script loads
const smartFilterEnhancer = new SmartFilterEnhancer();

// Expose for debugging
window.SmartFilterEnhancer = smartFilterEnhancer;
window.smartFilterStatus = () => smartFilterEnhancer.getStatus(); 