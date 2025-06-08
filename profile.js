// Profile Management

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Add event listeners for tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show selected tab content
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add event listener for profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Add event listener for change password form
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Add event listener for add address button
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            showAddAddressModal();
        });
    }
});

// Load user profile
function loadUserProfile() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));
    
    // Update profile header
    document.getElementById('profile-avatar').textContent = getInitials(currentUser.fullname);
    document.getElementById('profile-name').textContent = currentUser.fullname;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone || 'لم يتم تحديد رقم الهاتف';
    
    // Format join date
    const joinDate = new Date(currentUser.joinDate);
    document.getElementById('profile-member-since').textContent = joinDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update profile form
    document.getElementById('profile-fullname').value = currentUser.fullname;
    document.getElementById('profile-email-input').value = currentUser.email;
    document.getElementById('profile-phone-input').value = currentUser.phone || '';
    
    // Load orders
    loadOrders();
    
    // Load addresses
    loadAddresses();
}

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
    
    // Get only the latest 3 orders
    const latestOrders = userOrders.slice(0, 3);
    
    // Display orders
    const ordersContainer = document.getElementById('orders-container');
    
    if (latestOrders.length === 0) {
        ordersContainer.innerHTML = `
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
    
    latestOrders.forEach(order => {
        // Get order status class
        const statusClass = getStatusClass(order.status);
        
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        html += `
            <div class="order-card">
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
                    <a href="orders.html" class="track-order-btn">
                        <i class="fas fa-truck" style="margin-left: 5px;"></i> تتبع الطلب
                    </a>
                    <button class="reorder-btn" onclick="reorder(${order.id})">
                        <i class="fas fa-redo" style="margin-left: 5px;"></i> إعادة الطلب
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div style="text-align: center; margin-top: 20px;">
            <a href="orders.html" class="btn">عرض جميع الطلبات</a>
        </div>
    `;
    
    ordersContainer.innerHTML = html;
}

// Load addresses
function loadAddresses() {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));
    
    // Find user in users array
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) {
        return;
    }
    
    // Get addresses
    const addresses = user.addresses || [];
    
    // Display addresses
    const addressesContainer = document.getElementById('addresses-container');
    
    if (addresses.length === 0) {
        addressesContainer.innerHTML = `
            <div style="text-align: center; padding: 30px 0; color: #777;">
                <i class="fas fa-map-marker-alt" style="font-size: 40px; margin-bottom: 15px;"></i>
                <h3>لا توجد عناوين</h3>
                <p>لم تقم بإضافة أي عناوين بعد.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    addresses.forEach((address, index) => {
        html += `
            <div class="address-card ${address.isDefault ? 'default' : ''}">
                ${address.isDefault ? '<div class="address-default-badge">العنوان الافتراضي</div>' : ''}
                <h4>${address.name}</h4>
                <p>${address.street}</p>
                <p>${address.city}, ${address.state} ${address.postalCode}</p>
                <p>${address.country}</p>
                <p>${address.phone}</p>
                
                <div class="address-actions" style="position: absolute; top: 10px; left: 10px;">
                    <button onclick="editAddress(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAddress(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${!address.isDefault ? `<button onclick="setDefaultAddress(${index})">تعيين كافتراضي</button>` : ''}
                </div>
            </div>
        `;
    });
    
    addressesContainer.innerHTML = html;
}

// Update profile
function updateProfile() {
    // Get form values
    const fullname = document.getElementById('profile-fullname').value.trim();
    const email = document.getElementById('profile-email-input').value.trim();
    const phone = document.getElementById('profile-phone-input').value.trim();
    
    // Validate form
    let isValid = true;
    
    if (!fullname) {
        alert('الرجاء إدخال الاسم الكامل');
        isValid = false;
    } else if (fullname.length < 3) {
        alert('الاسم يجب أن يكون 3 أحرف على الأقل');
        isValid = false;
    }
    
    if (!email) {
        alert('الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    }
    
    if (phone && !/^[0-9+\s-]{8,15}$/.test(phone)) {
        alert('الرجاء إدخال رقم هاتف صحيح');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));
    
    // Find user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        alert('حدث خطأ أثناء تحديث الملف الشخصي');
        return;
    }
    
    // Check if email is already used by another user
    if (email !== currentUser.email && users.some(u => u.email === email && u.id !== currentUser.id)) {
        alert('البريد الإلكتروني مستخدم بالفعل');
        return;
    }
    
    // Update user
    users[userIndex].fullname = fullname;
    users[userIndex].email = email;
    users[userIndex].phone = phone;
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    currentUser.fullname = fullname;
    currentUser.email = email;
    currentUser.phone = phone;
    
    // Save current user to localStorage
    localStorage.setItem('userSession', JSON.stringify(currentUser));
    
    // Show success message
    alert('تم تحديث الملف الشخصي بنجاح');
    
    // Reload page
    window.location.reload();
}

// Change password
function changePassword() {
    // Get form values
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validate form
    if (!currentPassword) {
        alert('الرجاء إدخال كلمة المرور الحالية');
        return;
    }
    
    if (!newPassword) {
        alert('الرجاء إدخال كلمة المرور الجديدة');
        return;
    } else if (newPassword.length < 6) {
        alert('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    if (!confirmNewPassword) {
        alert('الرجاء تأكيد كلمة المرور الجديدة');
        return;
    } else if (confirmNewPassword !== newPassword) {
        alert('كلمة المرور الجديدة غير متطابقة');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('userSession'));
    
    // Find user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        alert('حدث خطأ أثناء تغيير كلمة المرور');
        return;
    }
    
    // Check current password
    if (users[userIndex].password !== currentPassword) {
        alert('كلمة المرور الحالية غير صحيحة');
        return;
    }
    
    // Update password
    users[userIndex].password = newPassword;
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    alert('تم تغيير كلمة المرور بنجاح');
    
    // Clear form
    document.getElementById('change-password-form').reset();
}

// Helper functions
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

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

// Reorder function
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
