package com.farmer.analytics.controller;

import com.farmer.analytics.model.ContactMessage;
import com.farmer.analytics.repository.ContactMessageRepository;
import com.farmer.analytics.security.AuthTokenUtil;
import io.jsonwebtoken.JwtException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
})
public class ContactController {

    private final ContactMessageRepository messageRepository;
    private final AuthTokenUtil tokenUtil;

    public ContactController(ContactMessageRepository messageRepository,
                             AuthTokenUtil tokenUtil) {
        this.messageRepository = messageRepository;
        this.tokenUtil = tokenUtil;
    }

    @PostMapping("/messages")
    public ResponseEntity<String> submitMessage(@RequestBody ContactRequest req) {
        if (req.name == null || req.name.isBlank()) {
            return ResponseEntity.badRequest().body("Name is required");
        }
        if (req.email == null || req.email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (req.message == null || req.message.isBlank()) {
            return ResponseEntity.badRequest().body("Message is required");
        }

        ContactMessage entity = new ContactMessage();
        entity.setName(req.name.trim());
        entity.setEmail(req.email.trim().toLowerCase());
        entity.setPhone(req.phone == null ? "" : req.phone.trim());
        entity.setUserRole(req.role == null ? "" : req.role.trim());
        entity.setSubject(req.subject == null || req.subject.isBlank() ? "General Support" : req.subject.trim());
        entity.setMessage(req.message.trim());
        entity.setStatus("OPEN");

        messageRepository.save(entity);
        return ResponseEntity.ok("Message submitted successfully");
    }

    @GetMapping("/my-messages")
    public ResponseEntity<?> myMessages(
            @RequestHeader(name = "Authorization", required = false) String authHeader,
            @RequestParam(name = "email", required = false) String email
    ) {
        String resolvedEmail = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                resolvedEmail = tokenUtil.getEmail(authHeader);
            } catch (JwtException ignored) {
                resolvedEmail = null;
            }
        }

        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body("Email or valid token is required");
            }
            resolvedEmail = email.trim().toLowerCase();
        }

        List<Map<String, Object>> rows = messageRepository
            .findByEmailIgnoreCaseOrderByCreatedAtDesc(resolvedEmail)
            .stream()
            .map(m -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", m.getId());
                row.put("subject", m.getSubject() == null ? "General Support" : m.getSubject());
                row.put("message", m.getMessage() == null ? "" : m.getMessage());
                row.put("status", m.getStatus() == null ? "OPEN" : m.getStatus());
                row.put("adminReply", m.getAdminReply() == null ? "" : m.getAdminReply());
                row.put("createdAt", String.valueOf(m.getCreatedAt()));
                row.put("repliedAt", String.valueOf(m.getRepliedAt()));
                return row;
            })
            .toList();

        return ResponseEntity.ok(rows);
    }

    static class ContactRequest {
        public String name;
        public String email;
        public String phone;
        public String role;
        public String subject;
        public String message;
    }
}
