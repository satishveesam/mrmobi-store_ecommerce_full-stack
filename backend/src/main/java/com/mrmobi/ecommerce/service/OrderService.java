package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.OrderRequest;
import com.mrmobi.ecommerce.entity.Orders;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.OrderRepository;
import com.mrmobi.ecommerce.repository.ProductRepository;
import com.mrmobi.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Orders placeOrder(OrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        int requestedQuantity = request.getQuantity();
        int stock = product.getStock() == null ? 0 : product.getStock();
        if (stock < requestedQuantity) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }

        product.setStock(stock - requestedQuantity);
        productRepository.save(product);

        Orders order = new Orders();
        order.setCustomerName(request.getCustomerName());
        order.setMobile(request.getMobile());
        order.setAddress(request.getAddress());
        order.setProductName(product.getName());
        order.setProductId(product.getId());
        order.setQuantity(requestedQuantity);
        order.setTotalPrice(product.getPrice() * requestedQuantity);

        // If user is authenticated as a USER, attach userId for "verified purchase" reviews.
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getAuthorities() != null) {
            boolean isUser = auth.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority()));
            if (isUser) {
                String email = auth.getName();
                userRepository.findByEmail(email).ifPresent(u -> {
                    order.setUserId(u.getId());
                    // Save address/mobile to user profile if they changed
                    u.setMobile(request.getMobile());
                    u.setAddress(request.getAddress());
                    userRepository.save(u);
                });
            }
        }

        return orderRepository.save(order);
    }

    @Transactional
    public List<Orders> placeBulkOrders(List<OrderRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new IllegalArgumentException("Order items list cannot be empty");
        }

        var auth = SecurityContextHolder.getContext().getAuthentication();
        com.mrmobi.ecommerce.entity.User user = null;
        if (auth != null && auth.isAuthenticated() && auth.getAuthorities() != null) {
            boolean isUser = auth.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority()));
            if (isUser) {
                String email = auth.getName();
                user = userRepository.findByEmail(email).orElse(null);
            }
        }

        List<Orders> orders = new java.util.ArrayList<>();
        for (OrderRequest request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
            int requestedQuantity = request.getQuantity();
            int stock = product.getStock() == null ? 0 : product.getStock();
            if (stock < requestedQuantity) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(stock - requestedQuantity);
            productRepository.save(product);

            Orders order = new Orders();
            order.setCustomerName(request.getCustomerName());
            order.setMobile(request.getMobile());
            order.setAddress(request.getAddress());
            order.setProductName(product.getName());
            order.setProductId(product.getId());
            order.setQuantity(requestedQuantity);
            order.setTotalPrice(product.getPrice() * requestedQuantity);

            if (user != null) {
                order.setUserId(user.getId());
                user.setMobile(request.getMobile());
                user.setAddress(request.getAddress());
            }

            orders.add(orderRepository.save(order));
        }

        if (user != null) {
            userRepository.save(user);
        }

        return orders;
    }

    public List<Orders> getOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    public List<Orders> getMyOrders() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("Login required");
        }

        boolean isUser = auth.getAuthorities() != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority()));
        if (!isUser) {
            throw new SecurityException("Login required");
        }

        String email = auth.getName();
        Long userId = userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new SecurityException("Login required"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Orders updateStatus(Long orderId, String status) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        String oldStatus = order.getStatus();
        order.setStatus(status);
        Orders updatedOrder = orderRepository.save(order);

        // Send email if status changed to SHIPPED
        if ("SHIPPED".equalsIgnoreCase(status) && !"SHIPPED".equalsIgnoreCase(oldStatus) && order.getUserId() != null) {
            userRepository.findById(order.getUserId()).ifPresent(user -> {
                emailService.sendShipmentEmail(user.getEmail(), user.getFullName(), order.getProductName(), order.getId());
            });
        }

        return updatedOrder;
    }

    @Transactional
    public Orders cancelOrder(Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("Login required");
        }
        String email = auth.getName();
        Long currentUserId = userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new SecurityException("Login required"));

        if (order.getUserId() == null || !order.getUserId().equals(currentUserId)) {
            throw new SecurityException("You do not have permission to cancel this order");
        }

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("Order is already cancelled");
        }

        java.time.Instant now = java.time.Instant.now();
        java.time.Instant createdAt = order.getCreatedAt();
        if (createdAt != null) {
            long minutesElapsed = java.time.Duration.between(createdAt, now).toMinutes();
            if (minutesElapsed > 30) {
                throw new IllegalArgumentException("Orders can only be cancelled within 30 minutes of purchase.");
            }
        }

        if (order.getProductId() != null) {
            productRepository.findById(order.getProductId()).ifPresent(product -> {
                int currentStock = product.getStock() == null ? 0 : product.getStock();
                product.setStock(currentStock + order.getQuantity());
                productRepository.save(product);
            });
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }
}
