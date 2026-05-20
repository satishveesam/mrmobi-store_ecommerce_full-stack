package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.entity.Category;
import com.mrmobi.ecommerce.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc();
    }

    public Category createCategory(Category category) {
        if (category.getSortOrder() == null) {
            category.setSortOrder((int) categoryRepository.count());
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updated) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        existing.setName(updated.getName());
        existing.setIcon(updated.getIcon());
        existing.setSlug(updated.getSlug());
        if (updated.getSortOrder() != null) existing.setSortOrder(updated.getSortOrder());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
