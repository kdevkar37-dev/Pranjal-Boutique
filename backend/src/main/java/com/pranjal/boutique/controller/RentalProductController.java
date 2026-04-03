package com.pranjal.boutique.controller;

import com.pranjal.boutique.model.RentalProduct;
import com.pranjal.boutique.service.RentalProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rental-products")
public class RentalProductController {

    private final RentalProductService rentalProductService;

    public RentalProductController(RentalProductService rentalProductService) {
        this.rentalProductService = rentalProductService;
    }

    @GetMapping
    public List<RentalProduct> getProducts(
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String category) {
        return rentalProductService.getProducts(section, category);
    }
}
