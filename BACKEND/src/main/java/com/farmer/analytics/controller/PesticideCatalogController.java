package com.farmer.analytics.controller;

import com.farmer.analytics.service.PesticideDatasetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pesticides")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
})
public class PesticideCatalogController {

    private final PesticideDatasetService datasetService;

    public PesticideCatalogController(PesticideDatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "crop", required = false) String crop,
            @RequestParam(name = "pest", required = false) String pest,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "limit", required = false, defaultValue = "100") int limit
    ) {
        return datasetService.findProducts(query, crop, pest, status, limit);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return datasetService.stats();
    }
}
