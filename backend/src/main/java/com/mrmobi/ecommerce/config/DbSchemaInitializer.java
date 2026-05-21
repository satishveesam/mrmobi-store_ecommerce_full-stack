package com.mrmobi.ecommerce.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Check if product_images table exists, if not, create it
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS product_images (" +
                "  product_id BIGINT NOT NULL," +
                "  image_url VARCHAR(1024) NOT NULL," +
                "  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
            );
            System.out.println("DbSchemaInitializer: Table 'product_images' ensured successfully.");
        } catch (Exception e) {
            System.err.println("DbSchemaInitializer: Error ensuring 'product_images' table: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
