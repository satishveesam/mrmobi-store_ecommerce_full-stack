package com.mrmobi.ecommerce.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("MrMobi Store <" + fromEmail + ">");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Email failed for " + to + ". Reason: " + e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to MrMobi!";
        String body = "Hello " + name + ",\n\n" +
                      "Thank you for joining MrMobi Store. We are excited to have you with us!\n\n" +
                      "Explore our latest collection of mobile accessories and gadgets.\n\n" +
                      "Happy Shopping,\n" +
                      "Team MrMobi";
        sendEmail(to, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String to, String newPassword) {
        String subject = "Your Password Has Been Reset";
        String body = "Hello,\n\n" +
                      "As requested, your password has been reset. Your temporary password is:\n\n" +
                      newPassword + "\n\n" +
                      "Please log in and change your password immediately for security.\n\n" +
                      "Regards,\n" +
                      "Team MrMobi";
        sendEmail(to, subject, body);
    }

    @Async
    public void sendShipmentEmail(String to, String name, String productName, Long orderId) {
        String subject = "Your Order Has Been Shipped!";
        String body = "Hello " + name + ",\n\n" +
                      "Great news! Your order #" + orderId + " containing '" + productName + "' has been shipped.\n\n" +
                      "You can check the status of your order in your account.\n\n" +
                      "Thank you for shopping with us!\n\n" +
                      "Regards,\n" +
                      "Team MrMobi";
        sendEmail(to, subject, body);
    }
}
