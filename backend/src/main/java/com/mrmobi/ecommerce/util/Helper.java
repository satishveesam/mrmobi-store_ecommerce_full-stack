package com.mrmobi.ecommerce.util;

public final class Helper {

    private Helper() {
    }

    public static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
