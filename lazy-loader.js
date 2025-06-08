/**
 * Lazy Loader Library
 * 
 * This library provides lazy loading functionality for images and other elements.
 * It uses the Intersection Observer API to detect when elements enter the viewport.
 */

// Lazy Loader Namespace
const LazyLoader = {
    // Default options
    defaultOptions: {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-error',
        onLoad: null,
        onError: null
    },
    
    // Observer instance
    observer: null,
    
    // Initialize lazy loading
    init: function(selector = '.lazy', options = {}) {
        // Merge options with defaults
        const settings = { ...this.defaultOptions, ...options };
        
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            this._loadAllImmediately(selector);
            return;
        }
        
        // Create observer
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Load element
                    this._loadElement(element, settings);
                    
                    // Unobserve element
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: settings.rootMargin,
            threshold: settings.threshold
        });
        
        // Get all lazy elements
        const lazyElements = document.querySelectorAll(selector);
        
        // Observe each element
        lazyElements.forEach(element => {
            // Add loading class
            element.classList.add(settings.loadingClass);
            
            // Observe element
            this.observer.observe(element);
        });
    },
    
    // Load all elements immediately
    _loadAllImmediately: function(selector) {
        const lazyElements = document.querySelectorAll(selector);
        
        lazyElements.forEach(element => {
            this._loadElement(element, this.defaultOptions);
        });
    },
    
    // Load element
    _loadElement: function(element, settings) {
        // Check element type
        if (element.tagName === 'IMG') {
            this._loadImage(element, settings);
        } else if (element.tagName === 'IFRAME') {
            this._loadIframe(element, settings);
        } else if (element.dataset.background) {
            this._loadBackground(element, settings);
        } else if (element.dataset.component) {
            this._loadComponent(element, settings);
        }
    },
    
    // Load image
    _loadImage: function(img, settings) {
        // Get source from data-src attribute
        const src = img.dataset.src;
        
        if (!src) return;
        
        // Set up load event
        img.onload = function() {
            // Remove loading class
            img.classList.remove(settings.loadingClass);
            
            // Add loaded class
            img.classList.add(settings.loadedClass);
            
            // Call onLoad callback
            if (settings.onLoad) settings.onLoad(img);
        };
        
        // Set up error event
        img.onerror = function() {
            // Remove loading class
            img.classList.remove(settings.loadingClass);
            
            // Add error class
            img.classList.add(settings.errorClass);
            
            // Call onError callback
            if (settings.onError) settings.onError(img);
        };
        
        // Set source
        img.src = src;
        
        // Remove data-src attribute
        img.removeAttribute('data-src');
        
        // Load srcset if available
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }
        
        // Load sizes if available
        if (img.dataset.sizes) {
            img.sizes = img.dataset.sizes;
            img.removeAttribute('data-sizes');
        }
    },
    
    // Load iframe
    _loadIframe: function(iframe, settings) {
        // Get source from data-src attribute
        const src = iframe.dataset.src;
        
        if (!src) return;
        
        // Set up load event
        iframe.onload = function() {
            // Remove loading class
            iframe.classList.remove(settings.loadingClass);
            
            // Add loaded class
            iframe.classList.add(settings.loadedClass);
            
            // Call onLoad callback
            if (settings.onLoad) settings.onLoad(iframe);
        };
        
        // Set up error event
        iframe.onerror = function() {
            // Remove loading class
            iframe.classList.remove(settings.loadingClass);
            
            // Add error class
            iframe.classList.add(settings.errorClass);
            
            // Call onError callback
            if (settings.onError) settings.onError(iframe);
        };
        
        // Set source
        iframe.src = src;
        
        // Remove data-src attribute
        iframe.removeAttribute('data-src');
    },
    
    // Load background image
    _loadBackground: function(element, settings) {
        // Get source from data-background attribute
        const src = element.dataset.background;
        
        if (!src) return;
        
        // Create image to preload
        const img = new Image();
        
        // Set up load event
        img.onload = function() {
            // Set background image
            element.style.backgroundImage = `url(${src})`;
            
            // Remove loading class
            element.classList.remove(settings.loadingClass);
            
            // Add loaded class
            element.classList.add(settings.loadedClass);
            
            // Call onLoad callback
            if (settings.onLoad) settings.onLoad(element);
        };
        
        // Set up error event
        img.onerror = function() {
            // Remove loading class
            element.classList.remove(settings.loadingClass);
            
            // Add error class
            element.classList.add(settings.errorClass);
            
            // Call onError callback
            if (settings.onError) settings.onError(element);
        };
        
        // Load image
        img.src = src;
        
        // Remove data-background attribute
        element.removeAttribute('data-background');
    },
    
    // Load component
    _loadComponent: function(element, settings) {
        // Get component name from data-component attribute
        const componentName = element.dataset.component;
        
        if (!componentName) return;
        
        // Get component URL from data-url attribute
        const url = element.dataset.url;
        
        if (!url) return;
        
        // Fetch component
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Insert component HTML
                element.innerHTML = html;
                
                // Remove loading class
                element.classList.remove(settings.loadingClass);
                
                // Add loaded class
                element.classList.add(settings.loadedClass);
                
                // Call onLoad callback
                if (settings.onLoad) settings.onLoad(element);
                
                // Initialize lazy loading for new elements
                this.init('.lazy', settings);
            })
            .catch(error => {
                console.error('Error loading component:', error);
                
                // Remove loading class
                element.classList.remove(settings.loadingClass);
                
                // Add error class
                element.classList.add(settings.errorClass);
                
                // Call onError callback
                if (settings.onError) settings.onError(element);
            });
        
        // Remove data attributes
        element.removeAttribute('data-component');
        element.removeAttribute('data-url');
    },
    
    // Refresh observer (call this when new lazy elements are added to the DOM)
    refresh: function(selector = '.lazy') {
        if (!this.observer) {
            this.init(selector);
            return;
        }
        
        // Get all lazy elements that are not already observed
        const lazyElements = document.querySelectorAll(`${selector}:not(.lazy-loading):not(.lazy-loaded):not(.lazy-error)`);
        
        // Observe each element
        lazyElements.forEach(element => {
            // Add loading class
            element.classList.add(this.defaultOptions.loadingClass);
            
            // Observe element
            this.observer.observe(element);
        });
    },
    
    // Destroy observer
    destroy: function() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
};

// Add CSS for lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .lazy-loading {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .lazy-loaded {
            opacity: 1;
        }
        
        .lazy-error {
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize lazy loading
    LazyLoader.init();
});

// Export LazyLoader
window.LazyLoader = LazyLoader;
