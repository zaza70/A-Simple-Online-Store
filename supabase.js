// Supabase Configuration
// This file contains the configuration and utility functions for Supabase

// Supabase URL and API Key
// In a production environment, these would be stored in environment variables
// For this demo, we're using public keys that are restricted by Row Level Security
const SUPABASE_URL = 'https://xyzcompany.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RrZXkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjM2MTY1NSwiZXhwIjoxOTI3OTM3NjU1fQ.aI9_PYs-qYj0yjQBhSUEE9S9XG5JPkbhKXLw6qUXZ9Q';

// Initialize Supabase Client
async function initSupabase() {
    // We're loading the Supabase client from CDN
    if (typeof supabase === 'undefined') {
        // Load Supabase from CDN if not already loaded
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }

    // Create Supabase client
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Helper function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Database Operations

// Products
async function getProducts() {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

async function getProduct(id) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return data;
}

async function createProduct(product) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

    if (error) {
        console.error('Error creating product:', error);
        return null;
    }

    return data[0];
}

async function updateProduct(id, updates) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error(`Error updating product ${id}:`, error);
        return null;
    }

    return data[0];
}

async function deleteProduct(id) {
    const supabase = await initSupabase();
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting product ${id}:`, error);
        return false;
    }

    return true;
}

// Orders
async function getOrders() {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getOrder(id) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching order ${id}:`, error);
        return { data: null, error };
    }

    return { data, error: null };
}

async function getOrderItems(orderId) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

    if (error) {
        console.error(`Error fetching items for order ${orderId}:`, error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getOrderStatusHistory(orderId) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching status history for order ${orderId}:`, error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function updateOrderStatus(id, status, note = '') {
    const supabase = await initSupabase();

    // First, update the order status
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

    if (orderError) {
        console.error(`Error updating order ${id} status:`, orderError);
        return { data: null, error: orderError };
    }

    // Then, add a new entry to the status history
    const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
            order_id: id,
            status: status,
            note: note || `تم تحديث الحالة إلى ${getStatusText(status)}`
        }]);

    if (historyError) {
        console.error(`Error adding status history for order ${id}:`, historyError);
        return { data: orderData[0], error: historyError };
    }

    return { data: orderData[0], error: null };
}

async function createOrder(orderData, orderItems) {
    const supabase = await initSupabase();

    // Start a transaction
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return { data: null, error: orderError };
    }

    // Add order items
    const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

    if (itemsError) {
        console.error('Error adding order items:', itemsError);
        return { data: order, error: itemsError };
    }

    // Add initial status history
    const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
            order_id: order.id,
            status: 'pending',
            note: 'تم إنشاء الطلب'
        }]);

    if (historyError) {
        console.error('Error adding status history:', historyError);
        return { data: order, error: historyError };
    }

    return { data: order, error: null };
}

// Helper function for status text
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
            return status;
    }
}

// Users
async function getUsers() {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('join_date', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getUser(id) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching user ${id}:`, error);
        return { data: null, error };
    }

    return { data, error: null };
}

async function getUserAddresses(userId) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    if (error) {
        console.error(`Error fetching addresses for user ${userId}:`, error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getUserOrders(userId, limit = 5) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error(`Error fetching orders for user ${userId}:`, error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function createUser(userData) {
    const supabase = await initSupabase();

    // Hash password (in a real app, this would be done server-side)
    // For demo purposes, we're just using a simple hash
    if (userData.password) {
        // In a real app, use a proper password hashing library
        userData.password = await hashPassword(userData.password);
    }

    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

    if (error) {
        console.error('Error creating user:', error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

async function updateUser(id, updates) {
    const supabase = await initSupabase();

    // Hash password if provided (in a real app, this would be done server-side)
    if (updates.password) {
        // In a real app, use a proper password hashing library
        updates.password = await hashPassword(updates.password);
    }

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error(`Error updating user ${id}:`, error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

async function deleteUser(id) {
    const supabase = await initSupabase();
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting user ${id}:`, error);
        return { success: false, error };
    }

    return { success: true, error: null };
}

// Simple password hashing function (for demo purposes only)
// In a real app, use a proper password hashing library
async function hashPassword(password) {
    // This is a placeholder for a real password hashing function
    // In a real app, use bcrypt or similar
    return `hashed_${password}`;
}

// Inventory
async function updateInventory(productId, quantity) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .update({
            stock: quantity,
            updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();

    if (error) {
        console.error(`Error updating inventory for product ${productId}:`, error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

async function getLowStockProducts(threshold = 5) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('stock', threshold)
        .order('stock', { ascending: true });

    if (error) {
        console.error('Error fetching low stock products:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getInventoryTransactions(productId) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching inventory transactions for product ${productId}:`, error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function addInventoryTransaction(transaction) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('inventory_transactions')
        .insert([transaction])
        .select();

    if (error) {
        console.error('Error adding inventory transaction:', error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

// Coupons
async function getCoupons() {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching coupons:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getCoupon(id) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching coupon ${id}:`, error);
        return { data: null, error };
    }

    return { data, error: null };
}

async function getCouponByCode(code) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

    if (error) {
        console.error(`Error fetching coupon with code ${code}:`, error);
        return { data: null, error };
    }

    return { data, error: null };
}

async function createCoupon(couponData) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select();

    if (error) {
        console.error('Error creating coupon:', error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

async function updateCoupon(id, updates) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error(`Error updating coupon ${id}:`, error);
        return { data: null, error };
    }

    return { data: data[0], error: null };
}

async function deleteCoupon(id) {
    const supabase = await initSupabase();
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting coupon ${id}:`, error);
        return { success: false, error };
    }

    return { success: true, error: null };
}

async function validateCoupon(code, subtotal) {
    const supabase = await initSupabase();
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('status', 'active')
        .single();

    if (error) {
        console.error(`Error validating coupon ${code}:`, error);
        return { valid: false, message: 'كود الخصم غير صالح', error };
    }

    // Check if coupon exists
    if (!coupon) {
        return { valid: false, message: 'كود الخصم غير صالح', error: null };
    }

    // Check if coupon is expired
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const expiryDate = new Date(coupon.expiry_date);

    if (now < startDate) {
        return { valid: false, message: 'كود الخصم غير نشط بعد', error: null };
    }

    if (now > expiryDate) {
        return { valid: false, message: 'كود الخصم منتهي الصلاحية', error: null };
    }

    // Check if coupon has reached usage limit
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
        return { valid: false, message: 'تم استخدام كود الخصم الحد الأقصى من المرات', error: null };
    }

    // Check minimum order amount
    if (subtotal < coupon.min_amount) {
        return {
            valid: false,
            message: `الحد الأدنى للطلب هو ${coupon.min_amount} درهم`,
            error: null
        };
    }

    // Coupon is valid
    return {
        valid: true,
        coupon,
        message: 'كود الخصم صالح',
        error: null
    };
}

async function applyCoupon(couponId) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('coupons')
        .update({
            usage_count: supabase.rpc('increment', { x: 1 }),
            updated_at: new Date().toISOString()
        })
        .eq('id', couponId)
        .select();

    if (error) {
        console.error(`Error applying coupon ${couponId}:`, error);
        return { success: false, error };
    }

    return { success: true, data: data[0], error: null };
}

// Analytics
async function getSalesData(startDate, endDate) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (error) {
        console.error('Error fetching sales data:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

async function getTopSellingProducts(limit = 10) {
    const supabase = await initSupabase();
    const { data, error } = await supabase
        .rpc('get_top_selling_products', { limit_count: limit });

    if (error) {
        console.error('Error fetching top selling products:', error);
        return { data: [], error };
    }

    return { data, error: null };
}

// Export functions
window.db = {
    // Products
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,

    // Orders
    getOrders,
    getOrder,
    getOrderItems,
    getOrderStatusHistory,
    updateOrderStatus,
    createOrder,

    // Users
    getUsers,
    getUser,
    getUserAddresses,
    getUserOrders,
    createUser,
    updateUser,
    deleteUser,

    // Inventory
    updateInventory,
    getLowStockProducts,
    getInventoryTransactions,
    addInventoryTransaction,

    // Coupons
    getCoupons,
    getCoupon,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    applyCoupon,

    // Analytics
    getSalesData,
    getTopSellingProducts
};
