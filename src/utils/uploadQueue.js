/**
 * Utility for handling upload retries and offline queue
 */

class UploadQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
  }

  async addToQueue(uploadFn, onProgress = null, onComplete = null, onError = null) {
    const uploadItem = {
      id: Date.now() + Math.random(),
      uploadFn,
      onProgress,
      onComplete,
      onError,
      retries: 0,
      status: 'pending'
    };

    this.queue.push(uploadItem);
    
    if (!this.isProcessing) {
      this.processQueue();
    }

    return uploadItem.id;
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        item.status = 'uploading';
        item.onProgress?.({ status: 'uploading', retries: item.retries });
        
        const result = await item.uploadFn();
        
        // Success - remove from queue
        this.queue.shift();
        item.status = 'completed';
        item.onComplete?.(result);
        
      } catch (error) {
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
          // Max retries reached - remove from queue
          this.queue.shift();
          item.status = 'failed';
          item.onError?.(error);
        } else {
          // Retry with exponential backoff
          item.status = 'retrying';
          item.onProgress?.({ 
            status: 'retrying', 
            retries: item.retries,
            nextRetryIn: this.retryDelay * item.retries 
          });
          
          await this.delay(this.retryDelay * item.retries);
        }
      }
    }

    this.isProcessing = false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.status === 'pending').length,
      uploading: this.queue.filter(item => item.status === 'uploading').length,
      retrying: this.queue.filter(item => item.status === 'retrying').length
    };
  }

  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }
}

// Create singleton instance
export const uploadQueue = new UploadQueue();

// Offline detection utility
export const createOfflineDetector = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('Connection restored');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('Connection lost');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Check if browser is currently online
export const isOnline = () => {
  return navigator.onLine;
};