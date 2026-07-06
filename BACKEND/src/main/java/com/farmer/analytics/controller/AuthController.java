package com.farmer.analytics.controller;

import com.farmer.analytics.model.User;
import com.farmer.analytics.repository.UserRepository;
import com.farmer.analytics.security.AuthTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
})
public class AuthController {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final AuthTokenUtil tokenUtil;

    @Value("${admin.auth.email:admin@farmer.local}")
    private String adminEmail;

    @Value("${admin.auth.password:Admin@123}")
    private String adminPassword;

    public AuthController(UserRepository repo,
                          BCryptPasswordEncoder encoder,
                          AuthTokenUtil tokenUtil) {
        this.repo = repo;
        this.encoder = encoder;
        this.tokenUtil = tokenUtil;
    }

    // ---------------- SIGNUP ----------------
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (repo.existsByEmailIgnoreCase(user.getEmail().trim())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        if (user.getEmail().trim().equalsIgnoreCase(adminEmail)) {
            return ResponseEntity.badRequest().body("This email is reserved for admin login");
        }

        String assignedRole = "USER";
        user.setRole(assignedRole);

        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);

        return ResponseEntity.ok("Signup successful as " + assignedRole);
    }

    // ---------------- LOGIN (EMAIL OR USERNAME) ----------------
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest req) {

        User user = repo.findByEmailOrName(req.identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(req.password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid password");
        }

        String token = tokenUtil.generateToken(user);

        return ResponseEntity.ok(token);
    }

    // ---------------- ADMIN LOGIN (SEPARATE CREDENTIALS) ----------------
    @PostMapping("/admin-login")
    public ResponseEntity<String> adminLogin(@RequestBody LoginRequest req) {

        String identifier = req.identifier == null ? "" : req.identifier.trim();
        String password = req.password == null ? "" : req.password;

        if (!identifier.equalsIgnoreCase(adminEmail) || !password.equals(adminPassword)) {
            return ResponseEntity.badRequest().body("Invalid admin credentials");
        }

        User adminUser = repo.findByEmailIgnoreCase(adminEmail)
                .orElseGet(() -> {
                    User created = new User();
                    created.setName("System Admin");
                    created.setEmail(adminEmail);
                    created.setPassword(encoder.encode(adminPassword));
                    created.setRole("ADMIN");
                    return created;
                });

        adminUser.setRole("ADMIN");

        if (adminUser.getPassword() == null || !encoder.matches(adminPassword, adminUser.getPassword())) {
            adminUser.setPassword(encoder.encode(adminPassword));
        }

        repo.save(adminUser);

        String token = tokenUtil.generateToken(adminUser);
        return ResponseEntity.ok(token);
    }

    static class LoginRequest {
        public String identifier;
        public String password;
    }
}
