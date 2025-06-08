// Main JavaScript file for Moroccan Shoe Store 2025

// Register Service Worker for offline support and caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Newsletter subscription
function subscribeNewsletter(event) {
    event.preventDefault();

    let isValid = true;

    // Get form elements
    const nameInput = document.getElementById('newsletter-name');
    const emailInput = document.getElementById('newsletter-email');
    const consentInput = document.getElementById('newsletter-consent');

    // Validate name
    if (!nameInput.value.trim()) {
        showNewsletterError(nameInput, 'الرجاء إدخال الاسم');
        isValid = false;
    } else if (nameInput.value.trim().length < 3) {
        showNewsletterError(nameInput, 'الاسم يجب أن يكون 3 أحرف على الأقل');
        isValid = false;
    } else {
        hideNewsletterError(nameInput);
    }

    // Validate email
    if (!emailInput.value.trim()) {
        showNewsletterError(emailInput, 'الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        showNewsletterError(emailInput, 'الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        hideNewsletterError(emailInput);
    }

    // Validate consent
    if (!consentInput.checked) {
        showNewsletterError(consentInput, 'يجب الموافقة على سياسة الخصوصية والشروط والأحكام');
        isValid = false;
    } else {
        hideNewsletterError(consentInput);
    }

    // If form is valid, save subscription
    if (isValid) {
        // Get existing subscribers
        let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];

        // Check if email already exists
        const emailExists = subscribers.some(subscriber => subscriber.email === emailInput.value.trim());

        if (emailExists) {
            alert('هذا البريد الإلكتروني مشترك بالفعل في النشرة البريدية!');
        } else {
            // Add new subscriber
            subscribers.push({
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                date: new Date().toISOString()
            });

            // Save to localStorage
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));

            // Reset form
            document.getElementById('newsletter-form').reset();

            // Show success message
            alert('تم الاشتراك في النشرة البريدية بنجاح! شكرًا لك.');
        }
    }

    return false;
}

// Show newsletter error
function showNewsletterError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    errorElement.textContent = message;
    errorElement.style.display = 'block';

    if (input.type !== 'checkbox') {
        input.style.borderColor = '#e74c3c';
    }
}

// Hide newsletter error
function hideNewsletterError(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    errorElement.textContent = '';
    errorElement.style.display = 'none';

    if (input.type !== 'checkbox') {
        input.style.borderColor = '#ddd';
    }
}

// Special offers countdown
function startCountdown() {
    // Set the end date (7 days from now)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 7);

    // Update countdown every second
    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = endDate - now;

        // Calculate days, hours, minutes, seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update countdown elements
        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');

        // If countdown is finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown-days').textContent = '00';
            document.getElementById('countdown-hours').textContent = '00';
            document.getElementById('countdown-minutes').textContent = '00';
            document.getElementById('countdown-seconds').textContent = '00';
        }
    }, 1000);
}

// Display special offers products
function displaySpecialOffers() {
    const specialOffersContainer = document.getElementById('special-offers-products');
    if (!specialOffersContainer) return;

    // Get products with discount (for demo, we'll use the first 4 products)
    const specialProducts = products.slice(0, 4).map(product => {
        // Create a copy of the product with a discount
        const discountedProduct = { ...product };

        // Add discount (20-40%)
        const discountPercent = Math.floor(Math.random() * 21) + 20; // 20-40%
        const originalPrice = product.price;
        const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

        discountedProduct.originalPrice = originalPrice;
        discountedProduct.discountedPrice = discountedPrice;
        discountedProduct.discountPercent = discountPercent;

        return discountedProduct;
    });

    // Create HTML for special offers
    let html = '<div class="products-grid">';

    specialProducts.forEach(product => {
        html += `
            <div class="product-card" data-id="${product.id}">
                <div class="product-img">
                    <img class="img-lazy" src="${product.image}" data-src="${product.image}" alt="${product.name}">
                    <div class="discount-badge" style="position: absolute; top: 10px; right: 10px; background-color: #d35400; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">
                        -${product.discountPercent}%
                    </div>
                    <div class="product-actions">
                        <button class="favorite-btn" data-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="compare-btn" data-id="${product.id}">
                            <i class="fas fa-exchange-alt"></i> إضافة للمقارنة
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price" style="display: flex; gap: 10px; align-items: center;">
                        <span style="font-weight: bold; color: #d35400;">${product.discountedPrice} درهم</span>
                        <span style="text-decoration: line-through; color: #999; font-size: 14px;">${product.originalPrice} درهم</span>
                    </div>
                    <div class="product-buttons">
                        <a href="product-details.html?id=${product.id}" class="btn">عرض التفاصيل</a>
                        <button class="add-to-cart-quick" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    specialOffersContainer.innerHTML = html;

    // Initialize lazy loading for images
    if (typeof initLazyLoading === 'function') {
        initLazyLoading();
    }

    // Add event listeners for favorite buttons
    const favoriteButtons = specialOffersContainer.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            toggleFavorite(productId, this);
        });
    });

    // Add event listeners for quick add to cart
    const quickAddButtons = specialOffersContainer.querySelectorAll('.add-to-cart-quick');
    quickAddButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                // Add first available size
                addToCart(product, product.sizes[0], 1);
            }
        });
    });
}

// Data caching functionality
const CACHE_VERSION = 'v1';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get data from cache or source
function getDataWithCache(key, defaultData, fetchFunction = null) {
    // Try to get from cache first
    const cachedData = getCachedData(key);

    if (cachedData) {
        console.log(`Using cached data for ${key}`);
        return cachedData;
    }

    // If no cache or expired, use default data or fetch new data
    const data = fetchFunction ? fetchFunction() : defaultData;

    // Cache the data
    cacheData(key, data);

    return data;
}

// Get data from cache
function getCachedData(key) {
    const cacheKey = `${key}_${CACHE_VERSION}`;
    const cachedItem = localStorage.getItem(cacheKey);

    if (!cachedItem) {
        return null;
    }

    try {
        const { data, timestamp } = JSON.parse(cachedItem);

        // Check if cache is expired
        if (Date.now() - timestamp > CACHE_EXPIRATION) {
            console.log(`Cache expired for ${key}`);
            localStorage.removeItem(cacheKey);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error parsing cached data:', error);
        localStorage.removeItem(cacheKey);
        return null;
    }
}

// Cache data
function cacheData(key, data) {
    const cacheKey = `${key}_${CACHE_VERSION}`;
    const cacheItem = {
        data,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
        console.log(`Data cached for ${key}`);
    } catch (error) {
        console.error('Error caching data:', error);
        // If localStorage is full, clear old caches
        clearOldCaches();
        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
        } catch (e) {
            console.error('Still unable to cache data after clearing old caches');
        }
    }
}

// Clear old caches
function clearOldCaches() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('_v') && !key.includes(`_${CACHE_VERSION}`)) {
            localStorage.removeItem(key);
        }
    }
}

// Products data
const productsData = [
    {
        id: 1,
        name: "حذاء رياضي أديداس",
        price: 899,
        image: "images/shoe1.jpg",
        description: "حذاء رياضي مريح من أديداس، مثالي للجري والتمارين الرياضية. مصنوع من مواد عالية الجودة لضمان الراحة والمتانة.",
        sizes: [39, 40, 41, 42, 43, 44],
        featured: true
    },
    {
        id: 2,
        name: "حذاء كلاسيكي جلدي",
        price: 1299,
        image: "images/shoe2.jpg",
        description: "حذاء كلاسيكي أنيق مصنوع من الجلد الطبيعي. مثالي للمناسبات الرسمية والعمل. تصميم أنيق يناسب جميع الأذواق.",
        sizes: [40, 41, 42, 43, 44],
        featured: true
    },
    {
        id: 3,
        name: "حذاء رياضي نايكي",
        price: 999,
        image: "images/shoe3.jpg",
        description: "حذاء رياضي من نايكي بتصميم عصري وألوان جذابة. مناسب للاستخدام اليومي والأنشطة الرياضية المختلفة.",
        sizes: [39, 40, 41, 42, 43],
        featured: true
    },
    {
        id: 4,
        name: "حذاء كاجوال",
        price: 699,
        image: "images/shoe4.jpg",
        description: "حذاء كاجوال مريح للاستخدام اليومي. خفيف الوزن ومصنوع من مواد متينة تدوم طويلاً.",
        sizes: [39, 40, 41, 42, 43, 44, 45],
        featured: false
    },
    {
        id: 5,
        name: "حذاء رسمي أسود",
        price: 1499,
        image: "images/shoe5.jpg",
        description: "حذاء رسمي أنيق باللون الأسود، مصنوع من الجلد الفاخر. مثالي للمناسبات الرسمية والاجتماعات المهمة.",
        sizes: [40, 41, 42, 43, 44],
        featured: false
    },
    {
        id: 6,
        name: "حذاء رياضي بوما",
        price: 849,
        image: "images/shoe6.jpg",
        description: "حذاء رياضي من بوما بتصميم رياضي أنيق. مناسب للجري والتمارين الرياضية المختلفة.",
        sizes: [39, 40, 41, 42, 43, 44],
        featured: true
    },
    {
        id: 7,
        name: "حذاء صحراوي",
        price: 599,
        image: "images/shoe7.jpg",
        description: "حذاء صحراوي تقليدي مغربي مصنوع يدويًا من الجلد الطبيعي. مريح ومتين ويعكس الثقافة المغربية الأصيلة.",
        sizes: [40, 41, 42, 43, 44, 45],
        featured: false
    },
    {
        id: 8,
        name: "حذاء رياضي خفيف",
        price: 749,
        image: "images/shoe8.jpg",
        description: "حذاء رياضي خفيف الوزن مناسب للجري والمشي لمسافات طويلة. مصمم لتوفير أقصى درجات الراحة.",
        sizes: [39, 40, 41, 42, 43],
        featured: false
    }
];

// Get products with caching
const products = getDataWithCache('products', productsData);

// Cart functionality with caching
let cart = getDataWithCache('cart', []);

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();

    // Start countdown for special offers
    startCountdown();

    // Display special offers
    displaySpecialOffers();

    // Display featured products on homepage
    const featuredProductsContainer = document.getElementById('featured-products');
    if (featuredProductsContainer) {
        const featuredProducts = products.filter(product => product.featured);
        displayProducts(featuredProducts, featuredProductsContainer);
    }

    // Display all products on products page
    const allProductsContainer = document.getElementById('all-products');
    if (allProductsContainer) {
        displayProducts(products, allProductsContainer);
    }

    // Display product details on product details page
    const productDetailsContainer = document.getElementById('product-details-container');
    if (productDetailsContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        displayProductDetails(productId, productDetailsContainer);
    }

    // Display cart items on cart page
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        displayCartItems(cartItemsContainer);
    }
});

// Display products in a container with lazy loading
function displayProducts(productsArray, container) {
    let html = '<div class="products-grid">';

    productsArray.forEach(product => {
        html += `
            <div class="product-card" data-id="${product.id}">
                <div class="product-img">
                    <img class="img-lazy" src="${product.image}" data-src="${product.image}" alt="${product.name}">
                    <div class="product-actions">
                        <button class="favorite-btn" data-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="compare-btn" data-id="${product.id}">
                            <i class="fas fa-exchange-alt"></i> إضافة للمقارنة
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${product.price} درهم</div>
                    <div class="product-buttons">
                        <a href="product-details.html?id=${product.id}" class="btn">عرض التفاصيل</a>
                        <button class="add-to-cart-quick" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Initialize lazy loading for images
    initLazyLoading();

    // Add event listeners for favorite buttons
    const favoriteButtons = container.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            toggleFavorite(productId, this);
        });
    });

    // Add event listeners for quick add to cart
    const quickAddButtons = container.querySelectorAll('.add-to-cart-quick');
    quickAddButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                // Add first available size
                addToCart(product, product.sizes[0], 1);
            }
        });
    });
}

// Initialize lazy loading for images
function initLazyLoading() {
    console.log('Initializing lazy loading...');

    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    console.log('Loading image:', lazyImage.dataset.src);

                    // Make sure data-src exists before setting src
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.add('loaded');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('.img-lazy');
        console.log('Found lazy images:', lazyImages.length);

        lazyImages.forEach(image => {
            // Make sure we're not observing images that already have src set to data-src
            if (image.src !== image.dataset.src) {
                lazyImageObserver.observe(image);
            }
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const lazyImages = document.querySelectorAll('.img-lazy');
        console.log('Fallback: Found lazy images:', lazyImages.length);

        lazyImages.forEach(image => {
            // Make sure data-src exists before setting src
            if (image.dataset.src) {
                image.src = image.dataset.src;
                image.classList.add('loaded');
            }
        });
    }

    // Immediate load for images that are already visible
    setTimeout(() => {
        const lazyImages = document.querySelectorAll('.img-lazy:not(.loaded)');
        lazyImages.forEach(image => {
            if (image.dataset.src) {
                image.src = image.dataset.src;
                image.classList.add('loaded');
            }
        });
    }, 1000);
}

// Display product details
function displayProductDetails(productId, container) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<p>المنتج غير موجود</p>';
        return;
    }

    // Log product details for debugging
    console.log('Product details:', product);
    console.log('Image path:', product.image);

    let sizesHtml = '';
    product.sizes.forEach(size => {
        sizesHtml += `<div class="size-option">${size}</div>`;
    });

    const html = `
        <div class="product-details-container">
            <div class="product-details-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details-info">
                <h1>${product.name}</h1>
                <div class="product-details-price">${product.price} درهم</div>
                <div class="product-details-desc">
                    <p>${product.description}</p>
                </div>
                <div class="product-details-sizes">
                    <h3>المقاسات المتوفرة:</h3>
                    <div class="size-options">
                        ${sizesHtml}
                    </div>
                </div>
                <div class="quantity-selector">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="10">
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="btn add-to-cart-btn" data-id="${product.id}">إضافة إلى السلة</button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners
    const sizeOptions = container.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const quantityInput = container.querySelector('.quantity-input');
    const minusBtn = container.querySelector('.minus');
    const plusBtn = container.querySelector('.plus');

    minusBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value < 10) {
            quantityInput.value = value + 1;
        }
    });

    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', function() {
        const selectedSize = container.querySelector('.size-option.active');
        if (!selectedSize) {
            alert('الرجاء اختيار المقاس');
            return;
        }

        const size = selectedSize.textContent;
        const quantity = parseInt(quantityInput.value);

        addToCart(product, size, quantity);
    });
}

// Add product to cart
function addToCart(product, size, quantity) {
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        quantity: quantity
    };

    const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    cacheData('cart', cart);
    updateCartCount();

    alert('تمت إضافة المنتج إلى السلة');
}

// Update cart count
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Favorites functionality with caching
let favorites = getDataWithCache('favorites', []);

// Toggle favorite
function toggleFavorite(productId, button) {
    const index = favorites.indexOf(productId);

    if (index === -1) {
        // Add to favorites
        favorites.push(productId);
        if (button) {
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.classList.add('active');
        }
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        if (button) {
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('active');
        }
    }

    // Save to cache
    cacheData('favorites', favorites);

    // Update favorites count
    updateFavoritesCount();
}

// Update favorites count
function updateFavoritesCount() {
    const favoritesCountElement = document.querySelector('.favorites-count');
    if (favoritesCountElement) {
        favoritesCountElement.textContent = favorites.length;
    }
}

// Initialize favorites
document.addEventListener('DOMContentLoaded', function() {
    updateFavoritesCount();

    // Update favorite buttons state
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        const productId = parseInt(btn.dataset.id);
        if (favorites.includes(productId)) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add('active');
        }
    });
});

// Display cart items
function displayCartItems(container) {
    if (cart.length === 0) {
        container.innerHTML = '<p>سلة التسوق فارغة</p>';
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }

    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>السعر</th>
                    <th>المقاس</th>
                    <th>الكمية</th>
                    <th>المجموع</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <tr>
                <td data-label="المنتج">
                    <div class="cart-product">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                        </div>
                    </div>
                </td>
                <td data-label="السعر">${item.price} درهم</td>
                <td data-label="المقاس">${item.size}</td>
                <td data-label="الكمية">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </td>
                <td data-label="المجموع">${itemTotal} درهم</td>
                <td>
                    <button class="remove-btn" data-index="${index}">×</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // Update cart summary
    const cartSummary = document.querySelector('.cart-summary');
    cartSummary.style.display = 'block';

    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    subtotalElement.textContent = `${total} درهم`;
    totalElement.textContent = `${total} درهم`;

    // Add event listeners
    const minusBtns = container.querySelectorAll('.minus');
    const plusBtns = container.querySelectorAll('.plus');
    const quantityInputs = container.querySelectorAll('.quantity-input');
    const removeBtns = container.querySelectorAll('.remove-btn');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                updateCart();
            }
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity < 10) {
                cart[index].quantity++;
                updateCart();
            }
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const value = parseInt(this.value);

            if (value >= 1 && value <= 10) {
                cart[index].quantity = value;
                updateCart();
            }
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            cart.splice(index, 1);
            updateCart();
        });
    });
}

// Update cart
function updateCart() {
    cacheData('cart', cart);
    updateCartCount();

    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        displayCartItems(cartItemsContainer);
    }
}

// Checkout form validation
function validateCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');

    let isValid = true;

    if (nameInput.value.trim() === '') {
        showError(nameInput, 'الرجاء إدخال الاسم الكامل');
        isValid = false;
    } else {
        removeError(nameInput);
    }

    if (emailInput.value.trim() === '') {
        showError(emailInput, 'الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        removeError(emailInput);
    }

    if (phoneInput.value.trim() === '') {
        showError(phoneInput, 'الرجاء إدخال رقم الهاتف');
        isValid = false;
    } else {
        removeError(phoneInput);
    }

    if (addressInput.value.trim() === '') {
        showError(addressInput, 'الرجاء إدخال العنوان');
        isValid = false;
    } else {
        removeError(addressInput);
    }

    if (cityInput.value.trim() === '') {
        showError(cityInput, 'الرجاء إدخال المدينة');
        isValid = false;
    } else {
        removeError(cityInput);
    }

    if (isValid) {
        alert('تم إرسال الطلب بنجاح! سيتم التواصل معك قريبًا.');
        cart = [];
        cacheData('cart', cart);
        window.location.href = 'index.html';
    }

    return isValid;
}

// Show error message
function showError(input, message) {
    const formGroup = input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');

    if (errorElement) {
        errorElement.textContent = message;
    } else {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        formGroup.appendChild(error);
    }

    input.classList.add('error');
}

// Remove error message
function removeError(input) {
    const formGroup = input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');

    if (errorElement) {
        formGroup.removeChild(errorElement);
    }

    input.classList.remove('error');
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Contact form validation
let captchaText = '';

// Generate CAPTCHA
function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    captchaText = '';

    for (let i = 0; i < 6; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const captchaContainer = document.getElementById('captcha-container');
    if (captchaContainer) {
        captchaContainer.textContent = captchaText;
    }
}

// Initialize CAPTCHA on page load
document.addEventListener('DOMContentLoaded', function() {
    generateCaptcha();

    // Add event listener to refresh CAPTCHA
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', generateCaptcha);
    }
});

// Validate contact form
function validateContactForm() {
    let isValid = true;

    // Get form elements
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const messageInput = document.getElementById('contact-message');
    const captchaInput = document.getElementById('contact-captcha');
    const privacyConsent = document.getElementById('privacy-consent');

    // Validate name
    if (!nameInput.value.trim()) {
        showFormError(nameInput, 'الرجاء إدخال الاسم الكامل');
        isValid = false;
    } else if (nameInput.value.trim().length < 3) {
        showFormError(nameInput, 'الاسم يجب أن يكون 3 أحرف على الأقل');
        isValid = false;
    } else {
        hideFormError(nameInput);
    }

    // Validate email
    if (!emailInput.value.trim()) {
        showFormError(emailInput, 'الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        showFormError(emailInput, 'الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        hideFormError(emailInput);
    }

    // Validate phone (optional)
    if (phoneInput.value.trim() && !/^[0-9+\s-]{8,15}$/.test(phoneInput.value.trim())) {
        showFormError(phoneInput, 'الرجاء إدخال رقم هاتف صحيح');
        isValid = false;
    } else {
        hideFormError(phoneInput);
    }

    // Validate message
    if (!messageInput.value.trim()) {
        showFormError(messageInput, 'الرجاء إدخال رسالتك');
        isValid = false;
    } else if (messageInput.value.trim().length < 10) {
        showFormError(messageInput, 'الرسالة يجب أن تكون 10 أحرف على الأقل');
        isValid = false;
    } else {
        hideFormError(messageInput);
    }

    // Validate CAPTCHA
    if (!captchaInput.value.trim()) {
        showFormError(captchaInput, 'الرجاء إدخال رمز التحقق');
        isValid = false;
    } else if (captchaInput.value.trim() !== captchaText) {
        showFormError(captchaInput, 'رمز التحقق غير صحيح');
        isValid = false;
        generateCaptcha(); // Generate new CAPTCHA
    } else {
        hideFormError(captchaInput);
    }

    // Validate privacy consent
    if (!privacyConsent.checked) {
        showFormError(privacyConsent, 'يجب الموافقة على سياسة الخصوصية والشروط والأحكام');
        isValid = false;
    } else {
        hideFormError(privacyConsent);
    }

    // If form is valid, show success message and reset form
    if (isValid) {
        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.');
        document.getElementById('contact-form').reset();
        generateCaptcha(); // Generate new CAPTCHA
    }

    return false; // Prevent form submission (we would use AJAX in a real application)
}

// Show form error
function showFormError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.style.borderColor = '#e74c3c';
}

// Hide form error
function hideFormError(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    errorElement.textContent = '';
    errorElement.style.display = 'none';
    input.style.borderColor = '#ddd';
}
