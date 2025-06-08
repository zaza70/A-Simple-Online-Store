/**
 * Image Optimizer for Elegant Shoes Store
 * This script optimizes images for better performance
 */

// Configuration
const IMAGE_QUALITY = 0.8; // 80% quality for JPEG/WebP
const MAX_WIDTH = 800; // Maximum width for product images
const THUMBNAIL_WIDTH = 200; // Width for thumbnails
const USE_WEBP = true; // Use WebP format if supported

// Check WebP support
function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

// Lazy load images
function lazyLoadImages() {
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        // If WebP is supported and enabled, try to load WebP version
                        if (USE_WEBP && checkWebPSupport() && !src.endsWith('.svg')) {
                            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                            
                            // Try to load WebP version first
                            const tempImg = new Image();
                            tempImg.onerror = function() {
                                // WebP not available, fallback to original
                                img.src = src;
                            };
                            tempImg.onload = function() {
                                img.src = webpSrc;
                            };
                            tempImg.src = webpSrc;
                        } else {
                            img.src = src;
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px', // Load images 50px before they appear in viewport
            threshold: 0.01
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'images/hero-bg.jpg',
        'images/logo.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize image optimization
document.addEventListener('DOMContentLoaded', function() {
    // Preload critical images
    preloadCriticalImages();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Re-check for new images every 2 seconds (for dynamically added content)
    setInterval(() => {
        document.querySelectorAll('img[data-src]:not(.observed)').forEach(img => {
            img.classList.add('observed');
            lazyLoadImages();
        });
    }, 2000);
});

// Add responsive image support
function createResponsiveImage(src, alt, sizes) {
    // Default sizes if not provided
    sizes = sizes || [
        { width: THUMBNAIL_WIDTH, suffix: '-thumb' },
        { width: MAX_WIDTH, suffix: '' }
    ];
    
    // Create srcset attribute
    let srcset = '';
    sizes.forEach(size => {
        const imgSrc = src.replace(/\.(jpg|jpeg|png)$/i, `${size.suffix}.$1`);
        srcset += `${imgSrc} ${size.width}w, `;
    });
    
    // Remove trailing comma and space
    srcset = srcset.slice(0, -2);
    
    return `<img class="img-lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${src}" srcset="${srcset}" alt="${alt}" loading="lazy">`;
}

// Export functions for use in other scripts
window.imageOptimizer = {
    lazyLoadImages,
    createResponsiveImage,
    checkWebPSupport
};
