/**
 * Performance monitoring utilities for the Honda Delivery App
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  // Track page load performance
  trackPageLoad(pageName) {
    if (typeof window === 'undefined') return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.set(`${pageName}_load_time`, {
          value: navigation.loadEventEnd - navigation.loadEventStart,
          timestamp: Date.now(),
          type: 'page_load'
        });

        console.log(`Page load time for ${pageName}: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      }
    } catch (error) {
      console.warn('Performance tracking failed:', error);
    }
  }

  // Track custom operations
  startTiming(operation) {
    this.metrics.set(`${operation}_start`, performance.now());
  }

  endTiming(operation, additionalData = {}) {
    const startTime = this.metrics.get(`${operation}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(operation, {
        value: duration,
        timestamp: Date.now(),
        type: 'operation',
        ...additionalData
      });

      console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
      this.metrics.delete(`${operation}_start`);
      return duration;
    }
  }

  // Track image loading performance
  trackImageLoad(src, loadTime) {
    this.metrics.set(`image_load_${Date.now()}`, {
      value: loadTime,
      src,
      timestamp: Date.now(),
      type: 'image_load'
    });
  }

  // Get performance metrics
  getMetrics(type = null) {
    if (!type) return this.metrics;
    
    const filtered = new Map();
    for (const [key, value] of this.metrics) {
      if (value.type === type) {
        filtered.set(key, value);
      }
    }
    return filtered;
  }

  // Clear old metrics (keep last 100)
  cleanup() {
    if (this.metrics.size > 100) {
      const sorted = Array.from(this.metrics.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, 100);
      
      this.metrics.clear();
      sorted.forEach(([key, value]) => this.metrics.set(key, value));
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for tracking component render times
export const usePerformanceTracking = (componentName) => {
  const startTiming = (operation) => {
    performanceMonitor.startTiming(`${componentName}_${operation}`);
  };

  const endTiming = (operation, data) => {
    return performanceMonitor.endTiming(`${componentName}_${operation}`, data);
  };

  return { startTiming, endTiming };
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = performance.memory;
    console.log('Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
};
