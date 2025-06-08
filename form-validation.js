/**
 * Form Validation Library
 * 
 * This library provides form validation functionality for the Elegant Shoes website.
 * It includes validation for common form fields like name, email, phone, password, etc.
 */

// Form Validation Namespace
const FormValidator = {
    // Regular expressions for validation
    patterns: {
        // Allows Arabic, English letters, and spaces
        name: /^[\u0600-\u06FF\s\w]{3,50}$/,
        
        // Standard email validation
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        
        // International phone number format
        phone: /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        
        // Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        
        // Postal code format (varies by country, this is a general one)
        postalCode: /^[0-9]{5,10}$/,
        
        // Credit card number (simplified)
        creditCard: /^[0-9]{13,19}$/,
        
        // CVV code (3 or 4 digits)
        cvv: /^[0-9]{3,4}$/,
        
        // Expiry date (MM/YY format)
        expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
        
        // URL validation
        url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/
    },
    
    // Error messages
    errorMessages: {
        name: {
            ar: 'يرجى إدخال اسم صحيح (3-50 حرفًا)',
            en: 'Please enter a valid name (3-50 characters)'
        },
        email: {
            ar: 'يرجى إدخال بريد إلكتروني صحيح',
            en: 'Please enter a valid email address'
        },
        phone: {
            ar: 'يرجى إدخال رقم هاتف صحيح',
            en: 'Please enter a valid phone number'
        },
        password: {
            ar: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، بما في ذلك حرف كبير، حرف صغير، رقم، وحرف خاص',
            en: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
        },
        passwordMatch: {
            ar: 'كلمات المرور غير متطابقة',
            en: 'Passwords do not match'
        },
        required: {
            ar: 'هذا الحقل مطلوب',
            en: 'This field is required'
        },
        postalCode: {
            ar: 'يرجى إدخال رمز بريدي صحيح',
            en: 'Please enter a valid postal code'
        },
        creditCard: {
            ar: 'يرجى إدخال رقم بطاقة ائتمان صحيح',
            en: 'Please enter a valid credit card number'
        },
        cvv: {
            ar: 'يرجى إدخال رمز CVV صحيح',
            en: 'Please enter a valid CVV code'
        },
        expiryDate: {
            ar: 'يرجى إدخال تاريخ انتهاء صلاحية صحيح (MM/YY)',
            en: 'Please enter a valid expiry date (MM/YY)'
        },
        url: {
            ar: 'يرجى إدخال رابط صحيح',
            en: 'Please enter a valid URL'
        }
    },
    
    // Language for error messages (default: Arabic)
    language: 'ar',
    
    // Set language
    setLanguage: function(lang) {
        if (lang === 'ar' || lang === 'en') {
            this.language = lang;
        }
    },
    
    // Get error message
    getErrorMessage: function(type) {
        return this.errorMessages[type][this.language];
    },
    
    // Validate a field
    validateField: function(field, type) {
        // Check if field is required and empty
        if (field.required && field.value.trim() === '') {
            return {
                valid: false,
                message: this.getErrorMessage('required')
            };
        }
        
        // If field is not required and empty, it's valid
        if (!field.required && field.value.trim() === '') {
            return {
                valid: true,
                message: ''
            };
        }
        
        // Validate based on type
        switch (type) {
            case 'name':
                return {
                    valid: this.patterns.name.test(field.value),
                    message: this.getErrorMessage('name')
                };
            
            case 'email':
                return {
                    valid: this.patterns.email.test(field.value),
                    message: this.getErrorMessage('email')
                };
            
            case 'phone':
                return {
                    valid: this.patterns.phone.test(field.value),
                    message: this.getErrorMessage('phone')
                };
            
            case 'password':
                return {
                    valid: this.patterns.password.test(field.value),
                    message: this.getErrorMessage('password')
                };
            
            case 'passwordMatch':
                const passwordField = document.getElementById(field.dataset.matchWith);
                return {
                    valid: passwordField && field.value === passwordField.value,
                    message: this.getErrorMessage('passwordMatch')
                };
            
            case 'postalCode':
                return {
                    valid: this.patterns.postalCode.test(field.value),
                    message: this.getErrorMessage('postalCode')
                };
            
            case 'creditCard':
                return {
                    valid: this.patterns.creditCard.test(field.value.replace(/\s/g, '')),
                    message: this.getErrorMessage('creditCard')
                };
            
            case 'cvv':
                return {
                    valid: this.patterns.cvv.test(field.value),
                    message: this.getErrorMessage('cvv')
                };
            
            case 'expiryDate':
                if (this.patterns.expiryDate.test(field.value)) {
                    // Check if the expiry date is in the future
                    const [month, year] = field.value.split('/');
                    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
                    const today = new Date();
                    
                    return {
                        valid: expiryDate > today,
                        message: this.getErrorMessage('expiryDate')
                    };
                }
                
                return {
                    valid: false,
                    message: this.getErrorMessage('expiryDate')
                };
            
            case 'url':
                return {
                    valid: this.patterns.url.test(field.value),
                    message: this.getErrorMessage('url')
                };
            
            default:
                return {
                    valid: true,
                    message: ''
                };
        }
    },
    
    // Show error message
    showError: function(field, message) {
        // Remove existing error message
        this.removeError(field);
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Add error class to field
        field.classList.add('error');
        
        // Insert error message after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    },
    
    // Remove error message
    removeError: function(field) {
        // Remove error class from field
        field.classList.remove('error');
        
        // Remove error message element
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.className === 'error-message') {
            errorElement.parentNode.removeChild(errorElement);
        }
    },
    
    // Validate form
    validateForm: function(form) {
        let isValid = true;
        
        // Get all form fields
        const fields = form.querySelectorAll('input, select, textarea');
        
        // Validate each field
        fields.forEach(field => {
            // Skip submit buttons and hidden fields
            if (field.type === 'submit' || field.type === 'hidden') {
                return;
            }
            
            // Get validation type from data attribute
            const validationType = field.dataset.validate;
            
            // Skip fields without validation type
            if (!validationType) {
                return;
            }
            
            // Validate field
            const result = this.validateField(field, validationType);
            
            // Show error message if invalid
            if (!result.valid) {
                this.showError(field, result.message);
                isValid = false;
            } else {
                this.removeError(field);
            }
        });
        
        return isValid;
    },
    
    // Initialize form validation
    init: function(formId, options = {}) {
        const form = document.getElementById(formId);
        
        if (!form) {
            console.error(`Form with ID "${formId}" not found.`);
            return;
        }
        
        // Set language if provided
        if (options.language) {
            this.setLanguage(options.language);
        }
        
        // Add submit event listener
        form.addEventListener('submit', (e) => {
            // Prevent form submission
            e.preventDefault();
            
            // Validate form
            const isValid = this.validateForm(form);
            
            // If form is valid, submit it
            if (isValid) {
                // If onSuccess callback is provided, call it
                if (typeof options.onSuccess === 'function') {
                    options.onSuccess(form);
                } else {
                    // Otherwise, submit the form
                    form.submit();
                }
            } else {
                // If onError callback is provided, call it
                if (typeof options.onError === 'function') {
                    options.onError(form);
                }
            }
        });
        
        // Add input event listeners for real-time validation
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Skip submit buttons and hidden fields
            if (field.type === 'submit' || field.type === 'hidden') {
                return;
            }
            
            // Get validation type from data attribute
            const validationType = field.dataset.validate;
            
            // Skip fields without validation type
            if (!validationType) {
                return;
            }
            
            // Add input event listener
            field.addEventListener('input', () => {
                // Validate field
                const result = this.validateField(field, validationType);
                
                // Show error message if invalid
                if (!result.valid && field.value.trim() !== '') {
                    this.showError(field, result.message);
                } else {
                    this.removeError(field);
                }
            });
            
            // Add blur event listener
            field.addEventListener('blur', () => {
                // Validate field
                const result = this.validateField(field, validationType);
                
                // Show error message if invalid
                if (!result.valid && (field.required || field.value.trim() !== '')) {
                    this.showError(field, result.message);
                } else {
                    this.removeError(field);
                }
            });
        });
    }
};

// Add CSS for error messages
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #e74c3c !important;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 12px;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
});

// Export FormValidator
window.FormValidator = FormValidator;
