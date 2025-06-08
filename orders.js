// Orders Management

// Initialize orders page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        window.location.href = 'login.html';
        return;
    }

    // Load orders
    loadOrders();

    // Add event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Filter orders
            const filter = this.dataset.filter;
            filterOrders(filter);
        });
    });

    // Add event listener for order details modal close button
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            const modal = document.getElementById('order-details-modal');
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('order-details-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Load orders
function loadOrders() {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));

    // Filter orders for current user
    const userOrders = orders.filter(order => order.customer.email === currentUser.email);

    // Sort orders by date (newest first)
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display orders
    displayOrders(userOrders);
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-bag"></i>
                <h3>لا توجد طلبات</h3>
                <p>لم تقم بإجراء أي طلبات بعد.</p>
                <a href="products.html" class="btn" style="margin-top: 20px;">تسوق الآن</a>
            </div>
        `;
        return;
    }

    let html = '';

    orders.forEach(order => {
        // Get order status class
        const statusClass = getStatusClass(order.status);

        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get order items
        const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);

        html += `
            <div class="order-card" data-status="${order.status}">
                <div class="order-header">
                    <div>
                        <div class="order-id">طلب #${order.id}</div>
                        <div class="order-date">${formattedDate}</div>
                    </div>
                    <div class="order-status ${statusClass}">${getStatusText(order.status)}</div>
                </div>

                <div class="order-products">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="order-product">
                            <div class="order-product-img">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="order-product-info">
                                <div class="order-product-name">${item.name}</div>
                                <div class="order-product-details">
                                    المقاس: ${item.size} | الكمية: ${item.quantity}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<div style="text-align: center; margin-top: 10px; font-size: 14px; color: #666;">+ ${order.items.length - 2} منتجات أخرى</div>` : ''}
                </div>

                <div class="order-total">
                    الإجمالي: ${order.total} درهم
                </div>

                <div class="order-actions">
                    <button class="track-order-btn" onclick="showOrderDetails(${order.id})">
                        <i class="fas fa-truck" style="margin-left: 5px;"></i> تتبع الطلب
                    </button>
                    <button class="reorder-btn" onclick="reorder(${order.id})">
                        <i class="fas fa-redo" style="margin-left: 5px;"></i> إعادة الطلب
                    </button>
                </div>
            </div>
        `;
    });

    ordersList.innerHTML = html;
}

// Filter orders
function filterOrders(filter) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));

    // Filter orders for current user
    let userOrders = orders.filter(order => order.customer.email === currentUser.email);

    // Apply status filter
    if (filter !== 'all') {
        userOrders = userOrders.filter(order => order.status === filter);
    }

    // Sort orders by date (newest first)
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display orders
    displayOrders(userOrders);
}

// Show order details
function showOrderDetails(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Find order
    const order = orders.find(order => order.id === orderId);

    if (!order) {
        alert('الطلب غير موجود');
        return;
    }

    // Update modal content
    document.getElementById('modal-order-id').textContent = order.id;

    // Update timeline
    const orderDate = new Date(order.date);
    document.getElementById('timeline-order-date').textContent = orderDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Update timeline icons based on status
    const processingIcon = document.getElementById('timeline-processing-icon');
    const shippedIcon = document.getElementById('timeline-shipped-icon');
    const deliveredIcon = document.getElementById('timeline-delivered-icon');

    // Reset all icons
    processingIcon.classList.remove('active');
    shippedIcon.classList.remove('active');
    deliveredIcon.classList.remove('active');

    // Set active icons based on status
    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
        processingIcon.classList.add('active');
        document.getElementById('timeline-processing-date').textContent = getStatusDate(order, 'processing');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
        shippedIcon.classList.add('active');
        document.getElementById('timeline-shipped-date').textContent = getStatusDate(order, 'shipped');
    }

    if (order.status === 'delivered') {
        deliveredIcon.classList.add('active');
        document.getElementById('timeline-delivered-date').textContent = getStatusDate(order, 'delivered');
    }

    // Update order details
    const modalOrderDetails = document.getElementById('modal-order-details');

    let html = `
        <h3 style="margin-top: 30px;">تفاصيل الطلب</h3>

        <div style="margin-top: 20px;">
            <h4>معلومات الشحن</h4>
            <p><strong>الاسم:</strong> ${order.customer.name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${order.customer.email}</p>
            <p><strong>رقم الهاتف:</strong> ${order.customer.phone}</p>
            <p><strong>العنوان:</strong> ${order.customer.address}, ${order.customer.city}</p>
            ${order.customer.postalCode ? `<p><strong>الرمز البريدي:</strong> ${order.customer.postalCode}</p>` : ''}
        </div>

        <div style="margin-top: 20px;">
            <h4>المنتجات</h4>
            <div class="order-products" style="margin-top: 10px;">
                ${order.items.map(item => `
                    <div class="order-product">
                        <div class="order-product-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-product-info">
                            <div class="order-product-name">${item.name}</div>
                            <div class="order-product-details">
                                المقاس: ${item.size} | الكمية: ${item.quantity}
                            </div>
                        </div>
                        <div style="text-align: left; font-weight: bold;">
                            ${item.price * item.quantity} درهم
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 20px; text-align: left;">
            <p><strong>طريقة الدفع:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
            ${order.coupon ? `
            <div style="margin-top: 10px;">
                <p><strong>كود الخصم:</strong> ${order.coupon.code}</p>
                <p><strong>قيمة الخصم:</strong> ${order.coupon.discountAmount.toFixed(2)} درهم (${order.coupon.discount * 100}%)</p>
            </div>
            ` : ''}
            <div style="margin-top: 10px;">
                <p><strong>المجموع الفرعي:</strong> ${order.subtotal ? order.subtotal.toFixed(2) : order.total.toFixed(2)} درهم</p>
                ${order.discount ? `<p><strong>الخصم:</strong> ${order.discount.toFixed(2)} درهم</p>` : ''}
                <p style="font-size: 18px; font-weight: bold; margin-top: 5px;">الإجمالي: ${order.total.toFixed(2)} درهم</p>
            </div>
        </div>
    `;

    modalOrderDetails.innerHTML = html;

    // Show modal
    document.getElementById('order-details-modal').style.display = 'block';
}

// Reorder
function reorder(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Find order
    const order = orders.find(order => order.id === orderId);

    if (!order) {
        alert('الطلب غير موجود');
        return;
    }

    // Get current cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add order items to cart
    order.items.forEach(item => {
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem =>
            cartItem.id === item.id && cartItem.size === item.size
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            cart[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item
            cart.push({...item});
        }
    });

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    // Show success message
    alert('تمت إضافة المنتجات إلى السلة');

    // Redirect to cart page
    window.location.href = 'cart.html';
}

// Helper functions
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'processing':
            return 'status-processing';
        case 'shipped':
            return 'status-shipped';
        case 'delivered':
            return 'status-delivered';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return '';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'قيد الانتظار';
        case 'processing':
            return 'قيد المعالجة';
        case 'shipped':
            return 'تم الشحن';
        case 'delivered':
            return 'تم التسليم';
        case 'cancelled':
            return 'ملغي';
        default:
            return '';
    }
}

function getPaymentMethodText(method) {
    switch (method) {
        case 'cash':
            return 'الدفع عند الاستلام';
        case 'card':
            return 'بطاقة ائتمان';
        case 'paypal':
            return 'PayPal';
        case 'stripe':
            return 'Stripe';
        default:
            return '';
    }
}

function getStatusDate(order, status) {
    const statusHistory = order.statusHistory.find(history => history.status === status);
    if (statusHistory) {
        const date = new Date(statusHistory.date);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return 'قريبًا';
}
