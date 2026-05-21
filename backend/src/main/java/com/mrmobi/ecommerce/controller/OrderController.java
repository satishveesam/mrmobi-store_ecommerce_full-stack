package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.dto.OrderRequest;
import com.mrmobi.ecommerce.entity.Orders;
import com.mrmobi.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Orders placeOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    public List<Orders> getOrders() {
        return orderService.getOrders();
    }

    /**
     * User's own orders (requires USER login).
     */
    @GetMapping("/my")
    public List<Orders> myOrders() {
        return orderService.getMyOrders();
    }

    /**
     * Minimal admin workflow to mark orders as DELIVERED (required for verified-purchase reviews).
     * Example: PUT /api/orders/1/status?status=DELIVERED
     */
    @PutMapping("/{id}/status")
    public Orders updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }

    /**
     * User's own order cancel mapping (requires USER login).
     */
    @PostMapping("/{id}/cancel")
    public Orders cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}
