// Authentication and User Management

// User session management
let currentUser = null;

// Initialize authentication
function initAuth() {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            currentUser = JSON.parse(userSession);
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error parsing user session:', error);
            logout();
        }
    } else {
        updateUIForLoggedOutUser();
    }
    
    // Add event listener for logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Add event listener for user menu toggle
    const userMenuToggle = document.getElementById('user-menu-toggle');
    if (userMenuToggle) {
        userMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const userDropdown = document.querySelector('.user-dropdown');
            if (userDropdown) {
                userDropdown.classList.toggle('active');
            }
        });
    }
    
    // Close user dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            const userDropdown = document.querySelector('.user-dropdown');
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        }
    });
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const userMenus = document.querySelectorAll('.user-menu');
    userMenus.forEach(menu => {
        const link = menu.querySelector('a');
        if (link) {
            link.href = 'profile.html';
            link.innerHTML = `<i class="fas fa-user"></i> ${currentUser.fullname.split(' ')[0]}`;
        }
    });
    
    // Show user dropdown if it exists
    const userDropdowns = document.querySelectorAll('.user-dropdown');
    userDropdowns.forEach(dropdown => {
        dropdown.style.display = 'block';
    });
    
    // Update profile page if we're on it
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }
    
    // Redirect from login/register pages if already logged in
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        window.location.href = 'profile.html';
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userMenus = document.querySelectorAll('.user-menu');
    userMenus.forEach(menu => {
        const link = menu.querySelector('a');
        if (link) {
            link.href = 'login.html';
            link.innerHTML = '<i class="fas fa-user"></i>';
        }
    });
    
    // Hide user dropdown if it exists
    const userDropdowns = document.querySelectorAll('.user-dropdown');
    userDropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
    });
    
    // Redirect from profile page if not logged in
    if (window.location.pathname.includes('profile.html') || 
        window.location.pathname.includes('orders.html')) {
        window.location.href = 'login.html';
    }
}

// Login user
function loginUser(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    // Validate form
    let isValid = true;
    
    if (!email) {
        showAuthError('email', 'الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError('email', 'الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        hideAuthError('email');
    }
    
    if (!password) {
        showAuthError('password', 'الرجاء إدخال كلمة المرور');
        isValid = false;
    } else {
        hideAuthError('password');
    }
    
    if (!isValid) {
        return false;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showAuthError('email', 'البريد الإلكتروني غير مسجل');
        return false;
    }
    
    // Check password
    if (user.password !== password) {
        showAuthError('password', 'كلمة المرور غير صحيحة');
        return false;
    }
    
    // Login successful
    currentUser = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        joinDate: user.joinDate
    };
    
    // Save user session to localStorage
    localStorage.setItem('userSession', JSON.stringify(currentUser));
    
    // Redirect to profile page
    window.location.href = 'profile.html';
    
    return false;
}

// Register user
function registerUser(event) {
    event.preventDefault();
    
    // Get form values
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAgree = document.getElementById('terms-agree').checked;
    
    // Validate form
    let isValid = true;
    
    if (!fullname) {
        showAuthError('fullname', 'الرجاء إدخال الاسم الكامل');
        isValid = false;
    } else if (fullname.length < 3) {
        showAuthError('fullname', 'الاسم يجب أن يكون 3 أحرف على الأقل');
        isValid = false;
    } else {
        hideAuthError('fullname');
    }
    
    if (!email) {
        showAuthError('email', 'الرجاء إدخال البريد الإلكتروني');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError('email', 'الرجاء إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        hideAuthError('email');
    }
    
    if (!phone) {
        showAuthError('phone', 'الرجاء إدخال رقم الهاتف');
        isValid = false;
    } else if (!/^[0-9+\s-]{8,15}$/.test(phone)) {
        showAuthError('phone', 'الرجاء إدخال رقم هاتف صحيح');
        isValid = false;
    } else {
        hideAuthError('phone');
    }
    
    if (!password) {
        showAuthError('password', 'الرجاء إدخال كلمة المرور');
        isValid = false;
    } else if (password.length < 6) {
        showAuthError('password', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        isValid = false;
    } else {
        hideAuthError('password');
    }
    
    if (!confirmPassword) {
        showAuthError('confirm-password', 'الرجاء تأكيد كلمة المرور');
        isValid = false;
    } else if (confirmPassword !== password) {
        showAuthError('confirm-password', 'كلمة المرور غير متطابقة');
        isValid = false;
    } else {
        hideAuthError('confirm-password');
    }
    
    if (!termsAgree) {
        showAuthError('terms-agree', 'يجب الموافقة على الشروط والأحكام');
        isValid = false;
    } else {
        hideAuthError('terms-agree');
    }
    
    if (!isValid) {
        return false;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showAuthError('email', 'البريد الإلكتروني مسجل بالفعل');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        fullname,
        email,
        phone,
        password,
        joinDate: new Date().toISOString(),
        addresses: []
    };
    
    // Add user to users array
    users.push(newUser);
    
    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Login user
    currentUser = {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        joinDate: newUser.joinDate
    };
    
    // Save user session to localStorage
    localStorage.setItem('userSession', JSON.stringify(currentUser));
    
    // Show success message
    alert('تم إنشاء الحساب بنجاح!');
    
    // Redirect to profile page
    window.location.href = 'profile.html';
    
    return false;
}

// Logout user
function logout() {
    // Clear user session
    localStorage.removeItem('userSession');
    currentUser = null;
    
    // Update UI
    updateUIForLoggedOutUser();
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Social login (mock)
function socialLogin(provider) {
    // In a real app, this would redirect to the provider's OAuth flow
    alert(`سيتم تحويلك إلى صفحة تسجيل الدخول عبر ${provider === 'facebook' ? 'فيسبوك' : 'جوجل'}`);
    
    // Mock successful login after 1 second
    setTimeout(() => {
        // Create mock user
        const mockUser = {
            id: Date.now(),
            fullname: provider === 'facebook' ? 'مستخدم فيسبوك' : 'مستخدم جوجل',
            email: `user@${provider}.com`,
            phone: '',
            joinDate: new Date().toISOString()
        };
        
        // Set current user
        currentUser = mockUser;
        
        // Save user session to localStorage
        localStorage.setItem('userSession', JSON.stringify(currentUser));
        
        // Redirect to profile page
        window.location.href = 'profile.html';
    }, 1000);
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    
    if (!password) {
        strengthBar.style.width = '0';
        strengthBar.style.backgroundColor = '#eee';
        strengthText.textContent = '';
        return;
    }
    
    // Calculate strength
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Update UI
    const percent = (strength / 6) * 100;
    strengthBar.style.width = `${percent}%`;
    
    if (strength < 2) {
        strengthBar.style.backgroundColor = '#e74c3c';
        strengthText.textContent = 'ضعيفة';
        strengthText.style.color = '#e74c3c';
    } else if (strength < 4) {
        strengthBar.style.backgroundColor = '#f39c12';
        strengthText.textContent = 'متوسطة';
        strengthText.style.color = '#f39c12';
    } else {
        strengthBar.style.backgroundColor = '#2ecc71';
        strengthText.textContent = 'قوية';
        strengthText.style.color = '#2ecc71';
    }
}

// Show authentication error
function showAuthError(inputId, message) {
    const input = document.getElementById(inputId);
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    if (input.type !== 'checkbox') {
        input.style.borderColor = '#e74c3c';
    }
}

// Hide authentication error
function hideAuthError(inputId) {
    const input = document.getElementById(inputId);
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    
    if (input.type !== 'checkbox') {
        input.style.borderColor = '#ddd';
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', initAuth);
