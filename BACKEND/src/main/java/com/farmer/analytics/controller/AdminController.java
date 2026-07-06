package com.farmer.analytics.controller;

import com.farmer.analytics.model.ContactMessage;
import com.farmer.analytics.model.User;
import com.farmer.analytics.repository.ContactMessageRepository;
import com.farmer.analytics.repository.MarketPriceLiveRepository;
import com.farmer.analytics.repository.UserRepository;
import com.farmer.analytics.security.AuthTokenUtil;
import com.farmer.analytics.service.AutoHistoryService;
import com.farmer.analytics.service.LiveMarketFetcher;
import io.jsonwebtoken.JwtException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
})
public class AdminController {

    private static final long INSIGHTS_CACHE_TTL_MS = 120_000;

    private final UserRepository userRepository;
    private final MarketPriceLiveRepository marketRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final AuthTokenUtil tokenUtil;
    private final LiveMarketFetcher liveMarketFetcher;
    private final AutoHistoryService autoHistoryService;
    private final Object insightsLock = new Object();

    private volatile Map<String, Object> insightsCache;
    private volatile long insightsCacheAt;

    public AdminController(UserRepository userRepository,
                           MarketPriceLiveRepository marketRepository,
                           ContactMessageRepository contactMessageRepository,
                           AuthTokenUtil tokenUtil,
                           LiveMarketFetcher liveMarketFetcher,
                           AutoHistoryService autoHistoryService) {
        this.userRepository = userRepository;
        this.marketRepository = marketRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.tokenUtil = tokenUtil;
        this.liveMarketFetcher = liveMarketFetcher;
        this.autoHistoryService = autoHistoryService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getAdminStats(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String requesterEmail = requireAdmin(authHeader);

        long totalUsers = userRepository.count();
        long adminUsers = userRepository.countByRoleIgnoreCase("ADMIN");

        return Map.of(
                "requester", requesterEmail,
            "totalUsers", totalUsers,
            "adminUsers", adminUsers,
            "normalUsers", totalUsers - adminUsers,
                "liveMarketRows", marketRepository.count(),
                "openMessages", contactMessageRepository.countByStatusIgnoreCase("OPEN"),
                "repliedMessages", contactMessageRepository.countByStatusIgnoreCase("REPLIED")
        );
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);

        return userRepository.findAll().stream()
            .map(u -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", u.getId());
                row.put("name", u.getName() == null ? "" : u.getName());
                row.put("email", u.getEmail() == null ? "" : u.getEmail());
                row.put("role", tokenUtil.resolveRole(u.getRole()));
                return row;
            })
                .toList();
    }

            @GetMapping("/insights")
            public Map<String, Object> getInsights(
                @RequestHeader(name = "Authorization", required = false) String authHeader
            ) {
            requireAdmin(authHeader);

            long now = System.currentTimeMillis();
            Map<String, Object> cached = insightsCache;
            if (cached != null && (now - insightsCacheAt) < INSIGHTS_CACHE_TTL_MS) {
                return cached;
            }

            synchronized (insightsLock) {
                cached = insightsCache;
                now = System.currentTimeMillis();
                if (cached != null && (now - insightsCacheAt) < INSIGHTS_CACHE_TTL_MS) {
                    return cached;
                }

            List<Map<String, Object>> topCrops = marketRepository
                .findTopCropsByRecords(PageRequest.of(0, 5))
                .stream()
                .map(row -> {
                    Map<String, Object> crop = new HashMap<>();
                    crop.put("crop", row[0] == null ? "unknown" : String.valueOf(row[0]));
                    crop.put("records", row[1] == null ? 0L : ((Number) row[1]).longValue());
                    return crop;
                })
                .toList();

            Map<String, Object> fresh = Map.of(
                "latestPriceDate", String.valueOf(marketRepository.findLatestPriceDate()),
                "statesCovered", marketRepository.countDistinctStates(),
                "districtsCovered", marketRepository.countDistinctDistricts(),
                "cropsCovered", marketRepository.countDistinctCrops(),
                "topCrops", topCrops
            );

            insightsCache = fresh;
            insightsCacheAt = now;
            return fresh;
            }
            }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String requesterEmail = requireAdmin(authHeader);

        String targetRole = tokenUtil.resolveRole(request.role);
        if (!targetRole.equals("ADMIN") && !targetRole.equals("USER")) {
            return ResponseEntity.badRequest().body("Role must be ADMIN or USER");
        }

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (requesterEmail.equalsIgnoreCase(targetUser.getEmail()) && targetRole.equals("USER")) {
            return ResponseEntity.badRequest().body("Admin cannot demote own account");
        }

        targetUser.setRole(targetRole);
        userRepository.save(targetUser);

        return ResponseEntity.ok("Updated role for " + targetUser.getEmail() + " to " + targetRole);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String requesterEmail = requireAdmin(authHeader);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (requesterEmail.equalsIgnoreCase(targetUser.getEmail())) {
            return ResponseEntity.badRequest().body("Admin cannot delete own account");
        }

        userRepository.delete(targetUser);
        return ResponseEntity.ok("Deleted user " + targetUser.getEmail());
    }

    @PostMapping("/sync/live-now")
    public ResponseEntity<String> runLiveSync(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);
        liveMarketFetcher.fetchLivePrices();
        clearInsightsCache();
        return ResponseEntity.ok("Live market sync triggered successfully");
    }

    @PostMapping("/sync/history-now")
    public ResponseEntity<String> runHistorySync(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);
        autoHistoryService.generateHistory();
        clearInsightsCache();
        return ResponseEntity.ok("Historical dataset generation triggered successfully");
    }

    @GetMapping("/messages")
    public List<Map<String, Object>> getContactMessages(
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);

        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(m -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", m.getId());
                    row.put("name", m.getName() == null ? "" : m.getName());
                    row.put("email", m.getEmail() == null ? "" : m.getEmail());
                    row.put("phone", m.getPhone() == null ? "" : m.getPhone());
                    row.put("userRole", m.getUserRole() == null ? "" : m.getUserRole());
                    row.put("subject", m.getSubject() == null ? "General Support" : m.getSubject());
                    row.put("message", m.getMessage() == null ? "" : m.getMessage());
                    row.put("status", m.getStatus() == null ? "OPEN" : m.getStatus());
                    row.put("adminReply", m.getAdminReply() == null ? "" : m.getAdminReply());
                    row.put("createdAt", String.valueOf(m.getCreatedAt()));
                    row.put("repliedAt", String.valueOf(m.getRepliedAt()));
                    return row;
                })
                .toList();
    }

    @PostMapping("/messages/{id}/reply")
    public ResponseEntity<String> replyToMessage(
            @PathVariable Long id,
            @RequestBody ReplyRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        requireAdmin(authHeader);

        if (request.reply == null || request.reply.isBlank()) {
            return ResponseEntity.badRequest().body("Reply text is required");
        }

        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        message.setAdminReply(request.reply.trim());
        message.setStatus("REPLIED");
        message.setRepliedAt(LocalDateTime.now());

        contactMessageRepository.save(message);

        return ResponseEntity.ok("Reply sent to user");
    }

    private String requireAdmin(String authHeader) {
        try {
            if (!tokenUtil.isAdmin(authHeader)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
            }
            return tokenUtil.getEmail(authHeader);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
        }
    }

    private void clearInsightsCache() {
        synchronized (insightsLock) {
            insightsCache = null;
            insightsCacheAt = 0L;
        }
    }

    static class RoleUpdateRequest {
        public String role;
    }

    static class ReplyRequest {
        public String reply;
    }
}
