package com.mrmobi.ecommerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;       // e.g. "Mobiles"
    private String icon;       // emoji or image URL, e.g. "📱" or "https://..."
    private String slug;       // e.g. "Mobiles" (used for product filter)
    private Integer sortOrder; // display order
}
