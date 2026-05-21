USE defaultdb;

-- 1. Disable foreign key checks temporarily to allow clean delete
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Clear all products and images
TRUNCATE TABLE product_images;
TRUNCATE TABLE product;

-- 3. Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 4. Insert exactly 10 new high-quality products
INSERT INTO product (id, name, description, discounted_price, original_price, discount_percentage, image_url, stock, category, quick_delivery, delivery_fee) VALUES
(1, 'iPhone 15 Pro Max', 'Experience the powerful Titanium design, super-advanced camera systems, and the revolutionary A17 Pro chip.', 139999.00, 159999.00, 12.5, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 50, 'Mobiles', 1, 0.0),
(2, 'Samsung Galaxy S24 Ultra', 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display.', 119999.00, 129999.00, 7.69, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 45, 'Mobiles', 1, 0.0),
(3, 'Google Pixel 8 Pro', 'The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever.', 99999.00, 109999.00, 9.09, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', 30, 'Mobiles', 1, 0.0),
(4, 'OnePlus 12', 'Boasting a flagship Snapdragon 8 Gen 3, a gorgeous 2K 120Hz ProXDR display, and 100W SUPERVOOC charging.', 64999.00, 69999.00, 7.14, 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=800&q=80', 60, 'Mobiles', 1, 0.0),
(5, 'MacBook Air M3', 'Strikingly thin and fast, so you can work, play, or create anywhere with the power of the M3 chip.', 104900.00, 114900.00, 8.70, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 25, 'Laptops', 1, 0.0),
(6, 'iPad Pro M4', 'Impossibly thin design with outrageous performance from the Apple M4 chip and the breakthrough Ultra Retina XDR display.', 89900.00, 99900.00, 10.01, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 35, 'Tablets', 1, 0.0),
(7, 'Sony WH-1000XM5', 'Sony\'s premium wireless noise-canceling headphones redefine distraction-free listening with industry-leading audio.', 29990.00, 34990.00, 14.29, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 40, 'Audio', 1, 0.0),
(8, 'Apple Watch Series 9', 'Smarter, brighter, mightier. A magical new way to use your watch without touching the screen.', 39900.00, 41900.00, 4.77, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', 50, 'Wearables', 1, 0.0),
(9, 'Nintendo Switch OLED', 'Featuring a vibrant 7-inch OLED screen, a wide adjustable stand, a wired LAN port, and 64 GB of internal storage.', 28999.00, 31999.00, 9.38, 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80', 20, 'Gaming', 1, 0.0),
(10, 'Sony PlayStation 5 Slim', 'Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with haptic feedback, and 3D Audio.', 44990.00, 54990.00, 18.18, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', 15, 'Gaming', 1, 0.0);

-- 5. Insert their corresponding secondary images in product_images
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'),
(3, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'),
(4, 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=800&q=80'),
(5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'),
(6, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'),
(7, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
(8, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'),
(9, 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80'),
(10, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80');
