package com.mrmobi.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class JwtService {

    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public String generateToken(String username, String role) {
        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = issuedAt + (expirationMs / 1000);
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"" + escape(username) + "\",\"role\":\"" + escape(role) + "\",\"iat\":" + issuedAt + ",\"exp\":" + expiresAt + "}";
        String unsignedToken = encode(header) + "." + encode(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public boolean isTokenValid(String token) {
        try {
            String[] parts = splitToken(token);
            String unsignedToken = parts[0] + "." + parts[1];
            if (!sign(unsignedToken).equals(parts[2])) {
                return false;
            }
            Long expiration = extractLong(decode(parts[1]), "exp");
            return expiration != null && expiration > Instant.now().getEpochSecond();
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractString(decode(splitToken(token)[1]), "sub");
    }

    public String extractRole(String token) {
        return extractString(decode(splitToken(token)[1]), "role");
    }

    private String[] splitToken(String token) {
        String[] parts = token == null ? new String[0] : token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT");
        }
        return parts;
    }

    private String encode(String value) {
        return URL_ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decode(String value) {
        return new String(URL_DECODER.decode(value), StandardCharsets.UTF_8);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign JWT", ex);
        }
    }

    private String extractString(String json, String key) {
        String marker = "\"" + key + "\":\"";
        int start = json.indexOf(marker);
        if (start < 0) {
            return null;
        }
        start += marker.length();
        int end = json.indexOf('"', start);
        return end < 0 ? null : json.substring(start, end);
    }

    private Long extractLong(String json, String key) {
        String marker = "\"" + key + "\":";
        int start = json.indexOf(marker);
        if (start < 0) {
            return null;
        }
        start += marker.length();
        int end = start;
        while (end < json.length() && Character.isDigit(json.charAt(end))) {
            end++;
        }
        return Long.parseLong(json.substring(start, end));
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
