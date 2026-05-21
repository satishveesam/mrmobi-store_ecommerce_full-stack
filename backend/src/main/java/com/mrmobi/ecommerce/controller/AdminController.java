package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.entity.Orders;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.service.OrderService;
import com.mrmobi.ecommerce.service.ProductService;
import com.mrmobi.ecommerce.service.UserService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;
    private final com.mrmobi.ecommerce.repository.SystemSettingRepository systemSettingRepository;
    private final com.mrmobi.ecommerce.repository.QuickDeliveryLocationRepository quickDeliveryLocationRepository;

    public AdminController(ProductService productService, 
                           OrderService orderService, 
                           UserService userService, 
                           com.mrmobi.ecommerce.repository.SystemSettingRepository systemSettingRepository,
                           com.mrmobi.ecommerce.repository.QuickDeliveryLocationRepository quickDeliveryLocationRepository) {
        this.productService = productService;
        this.orderService = orderService;
        this.userService = userService;
        this.systemSettingRepository = systemSettingRepository;
        this.quickDeliveryLocationRepository = quickDeliveryLocationRepository;
    }

    @PostMapping("/settings/quick-delivery-locations")
    public com.mrmobi.ecommerce.entity.QuickDeliveryLocation addOrUpdateQuickDeliveryLocation(@org.springframework.web.bind.annotation.RequestBody com.mrmobi.ecommerce.entity.QuickDeliveryLocation location) {
        return quickDeliveryLocationRepository.findByPincode(location.getPincode())
                .map(existing -> {
                    existing.setDeliveryFee(location.getDeliveryFee());
                    existing.setCityName(location.getCityName());
                    existing.setFreeThreshold(location.getFreeThreshold());
                    return quickDeliveryLocationRepository.save(existing);
                })
                .orElseGet(() -> quickDeliveryLocationRepository.save(location));
    }

    @DeleteMapping("/settings/quick-delivery-locations/{id}")
    public java.util.Map<String, String> deleteQuickDeliveryLocation(@PathVariable Long id) {
        quickDeliveryLocationRepository.deleteById(id);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Location deleted successfully");
        return response;
    }

    @PostMapping("/settings/global-delivery-fee")
    public java.util.Map<String, Object> updateGlobalDeliveryFee(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Object feeVal = body.get("globalDeliveryFee");
        String feeStr = feeVal != null ? feeVal.toString() : "0.0";
        double fee = Double.parseDouble(feeStr);
        com.mrmobi.ecommerce.entity.SystemSetting setting = new com.mrmobi.ecommerce.entity.SystemSetting("global_delivery_fee", String.valueOf(fee));
        systemSettingRepository.save(setting);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("globalDeliveryFee", fee);
        response.put("message", "Global delivery fee updated successfully");
        return response;
    }

    @PostMapping("/settings/free-delivery-threshold")
    public java.util.Map<String, Object> updateFreeDeliveryThreshold(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Object valObj = body.get("freeDeliveryThreshold");
        String valStr = valObj != null ? valObj.toString() : "0.0";
        double threshold = Double.parseDouble(valStr);
        com.mrmobi.ecommerce.entity.SystemSetting setting = new com.mrmobi.ecommerce.entity.SystemSetting("free_delivery_threshold", String.valueOf(threshold));
        systemSettingRepository.save(setting);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("freeDeliveryThreshold", threshold);
        response.put("message", "Free delivery threshold updated successfully");
        return response;
    }

    @PostMapping("/settings/announcement")
    public java.util.Map<String, Object> updateAnnouncementSettings(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Object activeObj = body.get("active");
        Object textObj = body.get("text");
        Object themeObj = body.get("theme");
        Object linkObj = body.get("link");

        String activeStr = activeObj != null ? activeObj.toString() : "false";
        String textStr = textObj != null ? textObj.toString() : "🎉 Special Offer: Flat 10% OFF on all smart watches today!";
        String themeStr = themeObj != null ? themeObj.toString() : "emerald";
        String linkStr = linkObj != null ? linkObj.toString() : "";

        systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("announcement_active", activeStr));
        systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("announcement_text", textStr));
        systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("announcement_theme", themeStr));
        systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("announcement_link", linkStr));

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("active", Boolean.parseBoolean(activeStr));
        response.put("text", textStr);
        response.put("theme", themeStr);
        response.put("link", linkStr);
        response.put("message", "Announcement settings updated successfully");
        return response;
    }

    @PostMapping("/settings/quick-delivery-fee")
    public java.util.Map<String, Object> updateQuickDeliveryFee(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Object feeVal = body.get("quickDeliveryFee");
        String feeStr = feeVal != null ? feeVal.toString() : "0.0";
        double fee = Double.parseDouble(feeStr);
        com.mrmobi.ecommerce.entity.SystemSetting setting = new com.mrmobi.ecommerce.entity.SystemSetting("quick_delivery_fee", String.valueOf(fee));
        systemSettingRepository.save(setting);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("quickDeliveryFee", fee);
        response.put("message", "Quick delivery fee updated successfully");
        return response;
    }

    @PostMapping("/settings/quick-delivery-free-threshold")
    public java.util.Map<String, Object> updateQuickDeliveryFreeThreshold(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        Object valObj = body.get("quickDeliveryFreeThreshold");
        String valStr = valObj != null ? valObj.toString() : "0.0";
        double threshold = Double.parseDouble(valStr);
        com.mrmobi.ecommerce.entity.SystemSetting setting = new com.mrmobi.ecommerce.entity.SystemSetting("quick_delivery_free_threshold", String.valueOf(threshold));
        systemSettingRepository.save(setting);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("quickDeliveryFreeThreshold", threshold);
        response.put("message", "Quick delivery free threshold updated successfully");
        return response;
    }

    @GetMapping("/users")
    public List<com.mrmobi.ecommerce.entity.User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/users/{id}/reset-password")
    public Map<String, String> resetPassword(@PathVariable Long id) {
        String newPassword = userService.resetPassword(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        response.put("newPassword", newPassword);
        return response;
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return response;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        try {
            List<Product> products = productService.getProducts(null);
            List<Orders> orders = orderService.getOrders();
            List<com.mrmobi.ecommerce.entity.User> users = userService.getAllUsers();
            
            double totalRevenue = orders.stream()
                    .filter(o -> o.getTotalPrice() != null)
                    .mapToDouble(Orders::getTotalPrice)
                    .sum();

            // Aggregate Revenue Data for Charts (Last 7 Days)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
            Map<String, Double> revenueByDate = orders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getTotalPrice() != null)
                    .collect(Collectors.groupingBy(
                            o -> o.getCreatedAt().atZone(ZoneId.systemDefault()).format(formatter),
                            TreeMap::new,
                            Collectors.summingDouble(Orders::getTotalPrice)
                    ));

            // Format for Recharts
            List<Map<String, Object>> revenueChartData = new ArrayList<>();
            revenueByDate.forEach((date, rev) -> {
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("name", date);
                dataPoint.put("revenue", rev);
                revenueChartData.add(dataPoint);
            });

            // Top Selling Categories (Split name safely)
            Map<String, Long> categoryCount = orders.stream()
                    .filter(o -> o.getProductName() != null)
                    .collect(Collectors.groupingBy(o -> {
                        String name = o.getProductName();
                        return name.contains(" ") ? name.split(" ")[0] : name;
                    }, Collectors.counting()));
            
            List<Map<String, Object>> categoryChartData = new ArrayList<>();
            categoryCount.forEach((cat, count) -> {
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("name", cat);
                dataPoint.put("value", count);
                categoryChartData.add(dataPoint);
            });

            // Sort orders safely
            List<Orders> recentOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null)
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(5)
                    .collect(Collectors.toList());

            Map<String, Object> dashboard = new LinkedHashMap<>();
            dashboard.put("totalProducts", products.size());
            dashboard.put("totalOrders", orders.size());
            dashboard.put("totalUsers", users.size());
            dashboard.put("revenue", totalRevenue);
            dashboard.put("revenueData", revenueChartData);
            dashboard.put("categoryData", categoryChartData);
            dashboard.put("recentOrders", recentOrders);
            return dashboard;
        } catch (Exception e) {
            // Log error and return fallback structure to prevent frontend crash
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to load dashboard data");
            errorResponse.put("totalProducts", 0);
            errorResponse.put("totalOrders", 0);
            errorResponse.put("totalUsers", 0);
            errorResponse.put("revenue", 0);
            errorResponse.put("revenueData", new ArrayList<>());
            errorResponse.put("categoryData", new ArrayList<>());
            errorResponse.put("recentOrders", new ArrayList<>());
            return errorResponse;
        }
    }

    @PostMapping("/settings/explore-collections")
    public List<java.util.Map<String, Object>> updateExploreCollections(@org.springframework.web.bind.annotation.RequestBody List<java.util.Map<String, Object>> collections) {
        for (java.util.Map<String, Object> col : collections) {
            Object idObj = col.get("id");
            Object titleObj = col.get("title");
            Object imageObj = col.get("image");

            if (idObj != null) {
                String idStr = idObj.toString();
                String titleStr = titleObj != null ? titleObj.toString() : "";
                String imageStr = imageObj != null ? imageObj.toString() : "";

                systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("explore_collection_" + idStr + "_name", titleStr));
                systemSettingRepository.save(new com.mrmobi.ecommerce.entity.SystemSetting("explore_collection_" + idStr + "_image", imageStr));
            }
        }
        
        List<java.util.Map<String, Object>> updated = new java.util.ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            String name = systemSettingRepository.findById("explore_collection_" + i + "_name")
                    .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                    .orElse("");
            String image = systemSettingRepository.findById("explore_collection_" + i + "_image")
                    .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                    .orElse("");

            java.util.Map<String, Object> c = new java.util.HashMap<>();
            c.put("id", i);
            c.put("title", name);
            c.put("image", image);
            updated.add(c);
        }
        return updated;
    }
}
