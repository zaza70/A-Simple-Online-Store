-- Elegant Shoes Store Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(255),
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount DECIMAL(5, 2) NOT NULL,
    min_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    free_shipping BOOLEAN NOT NULL DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    payment_method VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    coupon_id UUID REFERENCES coupons(id),
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    reference_id UUID, -- order_id or null for manual adjustments
    reference_type VARCHAR(20), -- 'order', 'manual', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON coupons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update inventory when order status changes
CREATE OR REPLACE FUNCTION update_inventory_on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If order is cancelled and was previously not cancelled, add items back to inventory
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        INSERT INTO inventory_transactions (product_id, quantity, type, reference_id, reference_type, notes)
        SELECT oi.product_id, oi.quantity, 'in', NEW.id, 'order', 'Order cancelled: ' || NEW.order_number
        FROM order_items oi
        WHERE oi.order_id = NEW.id;
        
        -- Update product stock
        UPDATE products p
        SET stock = p.stock + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    
    -- If order is being placed (pending) and inventory should be reduced
    ELSIF NEW.status = 'pending' AND OLD.status IS NULL THEN
        INSERT INTO inventory_transactions (product_id, quantity, type, reference_id, reference_type, notes)
        SELECT oi.product_id, -oi.quantity, 'out', NEW.id, 'order', 'Order placed: ' || NEW.order_number
        FROM order_items oi
        WHERE oi.order_id = NEW.id;
        
        -- Update product stock
        UPDATE products p
        SET stock = p.stock - oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    
    -- Add entry to order status history
    INSERT INTO order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'new') || ' to ' || NEW.status);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
CREATE TRIGGER update_inventory_on_order_status_change
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_order_status_change();

-- Create function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR(255),
    product_image VARCHAR(255),
    quantity BIGINT,
    total DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.product_id,
        oi.product_name,
        oi.product_image,
        SUM(oi.quantity) AS quantity,
        SUM(oi.total) AS total
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY oi.product_id, oi.product_name, oi.product_image
    ORDER BY quantity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to append status to order history
CREATE OR REPLACE FUNCTION append_status_history(order_id UUID, new_status VARCHAR, note TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO order_status_history (order_id, status, note)
    VALUES (order_id, new_status, note);
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS)
-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Products: anyone can read, only admins can write
CREATE POLICY products_select_policy ON products FOR SELECT USING (true);
CREATE POLICY products_insert_policy ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
CREATE POLICY products_update_policy ON products FOR UPDATE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
CREATE POLICY products_delete_policy ON products FOR DELETE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Users: users can read/update their own data, admins can read/write all
CREATE POLICY users_select_policy ON users FOR SELECT USING (
    auth.uid() = id OR 
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY users_insert_policy ON users FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY users_update_policy ON users FOR UPDATE USING (
    auth.uid() = id OR 
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY users_delete_policy ON users FOR DELETE USING (
    auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin'
);

-- Orders: users can read their own orders, admins can read/write all
CREATE POLICY orders_select_policy ON orders FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY orders_insert_policy ON orders FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text OR 
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY orders_update_policy ON orders FOR UPDATE USING (
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);
CREATE POLICY orders_delete_policy ON orders FOR DELETE USING (
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
);

-- Create sample data
-- Insert sample products
INSERT INTO products (name, description, price, category, stock, image, sizes, colors, status)
VALUES
    ('حذاء رياضي أديداس', 'حذاء رياضي مريح مناسب للجري والتمارين الرياضية', 799.99, 'رياضي', 50, 'img/products/1.jpg', '["40","41","42","43","44","45"]', '["أسود","أبيض","أحمر"]', 'active'),
    ('حذاء كلاسيكي أنيق', 'حذاء كلاسيكي فاخر مناسب للمناسبات الرسمية', 1299.99, 'رسمي', 30, 'img/products/2.jpg', '["40","41","42","43","44"]', '["أسود","بني"]', 'active'),
    ('حذاء نسائي كعب عالي', 'حذاء نسائي أنيق بكعب عالي', 899.99, 'نسائي', 40, 'img/products/3.jpg', '["36","37","38","39","40"]', '["أسود","أحمر","ذهبي"]', 'active'),
    ('حذاء رياضي نايكي', 'حذاء رياضي خفيف مناسب للجري', 899.99, 'رياضي', 45, 'img/products/4.jpg', '["40","41","42","43","44","45"]', '["أسود","رمادي","أزرق"]', 'active'),
    ('حذاء أطفال كاجوال', 'حذاء مريح للأطفال مناسب للاستخدام اليومي', 499.99, 'أطفال', 60, 'img/products/5.jpg', '["28","29","30","31","32","33","34"]', '["أزرق","وردي","أخضر"]', 'active');

-- Insert sample users
INSERT INTO users (email, password, fullname, phone, role)
VALUES
    ('admin@elegantshoes.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8YVrJz.aOiRWZ2', 'مدير النظام', '+212600000000', 'admin'),
    ('user@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V9//8YVrJz.aOiRWZ2', 'محمد أحمد', '+212611111111', 'customer');

-- Insert sample coupons
INSERT INTO coupons (code, discount, min_amount, max_discount, free_shipping, start_date, expiry_date, status, usage_limit)
VALUES
    ('WELCOME10', 0.1, 0, 0, false, NOW(), NOW() + INTERVAL '1 year', 'active', NULL),
    ('SUMMER20', 0.2, 500, 200, false, NOW(), NOW() + INTERVAL '3 months', 'active', 100),
    ('FREESHIP', 0, 0, 0, true, NOW(), NOW() + INTERVAL '1 month', 'active', 50);
