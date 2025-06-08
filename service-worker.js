/**
 * Service Worker for Elegant Shoes Store
 * Provides offline support and resource caching
 */

// Cache names
const STATIC_CACHE_NAME = 'elegant-shoes-static-v1';
const IMAGES_CACHE_NAME = 'elegant-shoes-images-v1';
const FONTS_CACHE_NAME = 'elegant-shoes-fonts-v1';
const API_CACHE_NAME = 'elegant-shoes-api-v1';

// Resources to cache on install
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/products.html',
    '/cart.html',
    '/checkout.html',
    '/favorites.html',
    '/product-details.html',
    '/privacy-policy.html',
    '/terms.html',
    '/css/style.css',
    '/js/main.js',
    '/js/image-optimizer.js'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const currentCaches = [
        STATIC_CACHE_NAME,
        IMAGES_CACHE_NAME,
        FONTS_CACHE_NAME,
        API_CACHE_NAME
    ];

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            })
            .then(cachesToDelete => {
                return Promise.all(cachesToDelete.map(cacheToDelete => {
                    console.log('Deleting old cache:', cacheToDelete);
                    return caches.delete(cacheToDelete);
                }));
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (isImageRequest(event.request)) {
        // Image caching strategy
        event.respondWith(handleImageRequest(event.request));
    } else if (isFontRequest(event.request)) {
        // Font caching strategy
        event.respondWith(handleFontRequest(event.request));
    } else if (isApiRequest(event.request)) {
        // API caching strategy
        event.respondWith(handleApiRequest(event.request));
    } else {
        // Static resources caching strategy
        event.respondWith(handleStaticRequest(event.request));
    }
});

// Check if request is for an image
function isImageRequest(request) {
    return request.destination === 'image' || 
           request.url.match(/\.(jpe?g|png|gif|svg|webp)$/i);
}

// Check if request is for a font
function isFontRequest(request) {
    return request.destination === 'font' || 
           request.url.match(/\.(woff2?|ttf|eot)$/i) ||
           request.url.includes('fonts.googleapis.com') ||
           request.url.includes('fonts.gstatic.com');
}

// Check if request is for API data
function isApiRequest(request) {
    return request.url.includes('/api/') || 
           (request.method === 'POST' && request.headers.get('Content-Type')?.includes('application/json'));
}

// Handle image requests - Cache first, then network
function handleImageRequest(request) {
    return caches.open(IMAGES_CACHE_NAME)
        .then(cache => {
            return cache.match(request)
                .then(response => {
                    if (response) {
                        // Return cached image
                        return response;
                    }
                    
                    // Fetch from network and cache
                    return fetch(request)
                        .then(networkResponse => {
                            // Cache a copy of the response
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error('Failed to fetch image:', error);
                            // Return a fallback image if available
                            return caches.match('/images/placeholder.jpg');
                        });
                });
        });
}

// Handle font requests - Cache first, then network
function handleFontRequest(request) {
    return caches.open(FONTS_CACHE_NAME)
        .then(cache => {
            return cache.match(request)
                .then(response => {
                    if (response) {
                        // Return cached font
                        return response;
                    }
                    
                    // Fetch from network and cache
                    return fetch(request)
                        .then(networkResponse => {
                            // Cache a copy of the response
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error('Failed to fetch font:', error);
                            // No fallback for fonts
                            throw error;
                        });
                });
        });
}

// Handle API requests - Network first, then cache
function handleApiRequest(request) {
    // Only cache GET requests
    if (request.method !== 'GET') {
        return fetch(request);
    }
    
    return fetch(request)
        .then(response => {
            // Cache a copy of the response
            caches.open(API_CACHE_NAME)
                .then(cache => cache.put(request, response.clone()));
            return response;
        })
        .catch(error => {
            console.error('Failed to fetch API data:', error);
            // Try to get from cache
            return caches.open(API_CACHE_NAME)
                .then(cache => cache.match(request));
        });
}

// Handle static requests - Cache first, then network
function handleStaticRequest(request) {
    return caches.open(STATIC_CACHE_NAME)
        .then(cache => {
            return cache.match(request)
                .then(response => {
                    if (response) {
                        // Return cached response
                        return response;
                    }
                    
                    // Fetch from network and cache
                    return fetch(request)
                        .then(networkResponse => {
                            // Cache a copy of the response for static resources
                            if (request.method === 'GET') {
                                cache.put(request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error('Failed to fetch static resource:', error);
                            // Return offline page for HTML requests
                            if (request.destination === 'document') {
                                return caches.match('/offline.html');
                            }
                            throw error;
                        });
                });
        });
}
