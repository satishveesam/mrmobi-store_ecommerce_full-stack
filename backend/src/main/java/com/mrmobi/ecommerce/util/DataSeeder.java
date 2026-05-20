package com.mrmobi.ecommerce.util;

import com.mrmobi.ecommerce.entity.Banner;
import com.mrmobi.ecommerce.entity.Category;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.repository.BannerRepository;
import com.mrmobi.ecommerce.repository.CategoryRepository;
import com.mrmobi.ecommerce.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BannerRepository bannerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public DataSeeder(BannerRepository bannerRepository, ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.bannerRepository = bannerRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Categories
        if (categoryRepository.count() == 0) {
            seedCategories();
        }

        // 2. Seed Products if missing
        if (productRepository.count() == 0) {
            seedProductsByCategory();
        }

        // 3. Seed Banners
        seedBanners();
    }

    private void seedCategories() {
        List<Category> categories = List.of(
            new Category(null, "Mobiles",      "📱", "Mobiles",       0),
            new Category(null, "Audio",        "🎧", "Audio",         1),
            new Category(null, "Watches",      "⌚", "Smart Watches", 2),
            new Category(null, "Accessories",  "🎒", "Accessories",   3),
            new Category(null, "Computers",    "💻", "Computers",     4),
            new Category(null, "Cameras",      "📷", "Cameras",       5),
            new Category(null, "Gaming",       "🎮", "Gaming",        6),
            new Category(null, "Home",         "🏠", "Home",          7),
            new Category(null, "Food",         "🥗", "Food",          8),
            new Category(null, "Drones",       "🚁", "Drones",        9),
            new Category(null, "Toys",         "🧸", "Toys",          10)
        );
        categoryRepository.saveAll(categories);
    }

    private void seedProductsByCategory() {
        String[] categories = {
            "Mobiles",
            "Audio",
            "Smart Watches",
            "Accessories",
            "Computers",
            "Cameras",
            "Gaming",
            "Home",
            "Food",
            "Drones",
            "Toys"
        };

        String[][] productNames = {
            {"Galaxy Nova", "iPhone 15 Pro", "Pixel Vision", "OnePlus Horizon", "Razr Fold", "Moto Edge", "Nokia Breeze", "Vivo Photon", "Realme Swift", "Oppo Spark"},
            {"WH-1000XM5", "Buds Pro", "Sound Core", "Beats Studio", "JBL Charge", "Bose QuietComfort", "Sony Pulse", "Anker Harmony", "Audio Wave", "Skullcandy Venue"},
            {"Fit Watch", "Active Band", "Classic Watch", "Sport Tracker", "Smart Pulse", "Zen Watch", "Wave Band", "Pulse Lite", "Health Watch", "Time Pro"},
            {"Wireless Charger", "Phone Case", "Power Bank", "Bluetooth Mouse", "Laptop Sleeve", "USB-C Hub", "Gaming Pad", "Travel Adapter", "Cable Organizer", "Screen Protector"},
            {"UltraBook X", "Gaming PC", "Workstation Pro", "Mini Desktop", "Laptop Air", "Convertible Book", "Desktop Titan", "Notebook Flex", "Studio PC", "CloudBook"},
            {"Mirrorless Zoom", "Action Camera", "DSLR Pro", "Compact Capture", "Drone Cam", "Photo Lens", "Camera Bag", "Tripod Stand", "Studio Flash", "Video Rig"},
            {"Console Blade", "Gaming Mouse", "RGB Keyboard", "Pro Controller", "Gaming Chair", "Headset Fury", "VR Explorer", "Collector Edition", "Speed Pad", "Power Band"},
            {"Robot Vacuum", "Smart Light", "Air Purifier", "Kitchen Scale", "Security Cam", "Smart Lock", "Bluetooth Speaker", "Ambient Lamp", "Plant Sensor", "Home Hub"},
            {"Organic Snacks", "Protein Powder", "Green Tea", "Meal Kit", "Baked Chips", "Energy Bars", "Fruit Box", "Herbal Mix", "Coffee Beans", "Spice Pack"},
            {"Racing Drone", "Camera Drone", "Delivery Drone", "Mini Quadcopter", "Explorer Drone", "Foldable Flyer", "Aerial Scout", "Pro Quadcopter", "Speed Drone", "Cargo Drone"},
            {"Toy Train Set", "Building Blocks XL", "Remote Car Racer", "Dino World Figure Pack", "Magnetic Tiles 100", "Space Explorer Helmet", "Teddy Bear Plush", "Robot Buddy Kit", "Puzzle Quest 500pcs", "Coloring Art Studio"}
        };

        for (int catIndex = 0; catIndex < categories.length; catIndex++) {
            String category = categories[catIndex];
            String[] names = productNames[catIndex];

            for (int i = 0; i < names.length; i++) {
                String name = names[i];
                String desc = "Premium " + category.toLowerCase() + " product with modern features and reliable performance.";
                int stock = 30 + (i * 10);
                double price = 50 + (catIndex * 40) + (i * 20);
                double discount = 5 + ((i * 3) % 25);
                String seed = category.replaceAll("\\s+", "") + (i + 1);
                String imgUrl = "https://images.unsplash.com/seed/" + seed + "/800/800";

                productRepository.save(createProduct(name, desc, category, stock, price, discount, imgUrl));
            }
        }
    }

    private void seedBanners() {
        long mainCount = bannerRepository.findAll().stream().filter(b -> "MAIN".equals(b.getType()) || b.getType() == null).count();
        long secondaryCount = bannerRepository.findAll().stream().filter(b -> "SECONDARY".equals(b.getType())).count();

        if (mainCount == 0) {
            bannerRepository.save(new Banner(null, "New Arrivals", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80", "/products", "MAIN"));
            bannerRepository.save(new Banner(null, "Premium Tech", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", "/products", "MAIN"));
        }

        if (secondaryCount == 0) {
            bannerRepository.save(new Banner(null, "Vivo Sale", "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80", "/search?q=vivo", "SECONDARY"));
            bannerRepository.save(new Banner(null, "Intel Power", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80", "/search?q=intel", "SECONDARY"));
            bannerRepository.save(new Banner(null, "Pulse 2", "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80", "/search?q=pulse", "SECONDARY"));
            bannerRepository.save(new Banner(null, "Home Smart", "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", "/search?q=home", "SECONDARY"));
            bannerRepository.save(new Banner(null, "Gaming Zone", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80", "/search?q=gaming", "SECONDARY"));
        }
    }

    private Product createProduct(String name, String desc, String cat, int stock, double price, double discount, String img) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setCategory(cat);
        p.setStock(stock);
        p.setOriginalPrice(price);
        p.setDiscountPercentage(discount);
        p.setImageUrl(img);
        p.recalculatePricing();
        return p;
    }
}
