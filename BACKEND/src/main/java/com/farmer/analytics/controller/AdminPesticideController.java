package com.farmer.analytics.controller;

import com.farmer.analytics.security.AuthTokenUtil;
import com.farmer.analytics.service.PesticideDatasetService;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/pesticides")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
})
public class AdminPesticideController {

    private final PesticideDatasetService datasetService;
    private final AuthTokenUtil tokenUtil;

    public AdminPesticideController(PesticideDatasetService datasetService,
                                    AuthTokenUtil tokenUtil) {
        this.datasetService = datasetService;
        this.tokenUtil = tokenUtil;
    }

    @PostMapping("/import")
    public ResponseEntity<?> importDataset(
            @RequestPart("file") MultipartFile file,
            @RequestParam(name = "sourceSection", required = false, defaultValue = "Registered Products") String sourceSection,
            @RequestParam(name = "sourceYear", required = false) Integer sourceYear,
            @RequestParam(name = "sourceDate", required = false) String sourceDate,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);

        try {
            return ResponseEntity.ok(datasetService.importDataset(file, sourceSection, sourceYear, sourceDate));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> previewDataset(
            @RequestPart("file") MultipartFile file,
            @RequestParam(name = "sourceSection", required = false, defaultValue = "Registered Products") String sourceSection,
            @RequestParam(name = "sourceYear", required = false) Integer sourceYear,
            @RequestParam(name = "sourceDate", required = false) String sourceDate,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);

        try {
            return ResponseEntity.ok(datasetService.previewDataset(file, sourceSection, sourceYear, sourceDate));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/import-logs")
    public List<Map<String, Object>> importLogs(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);
        return datasetService.recentImportLogs();
    }

    private void requireAdmin(String authHeader) {
        try {
            if (!tokenUtil.isAdmin(authHeader)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
            }
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
        }
    }
}
