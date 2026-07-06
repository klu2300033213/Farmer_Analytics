package com.farmer.analytics.security;

import com.farmer.analytics.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Locale;

@Component
public class AuthTokenUtil {

    private static final String SECRET =
            "XhSmhrzU2muCS/IuAnBjF0bVU5b1ijtCfI6O8MwSeoXbcBhTVwtDOX684MZVKD9h+8z5tNC58Pv7NBYyFcbsEQ==";

    public String generateToken(User user) {
        String role = resolveRole(user.getRole());

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", role)
                .claim("name", user.getName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public Claims parseBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new JwtException("Missing bearer token");
        }

        String token = authHeader.substring(7).trim();

        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }

    public String getEmail(String authHeader) {
        return parseBearer(authHeader).getSubject();
    }

    public boolean isAdmin(String authHeader) {
        String role = String.valueOf(parseBearer(authHeader).get("role"));
        return "ADMIN".equalsIgnoreCase(role);
    }

    public String resolveRole(String roleValue) {
        if (roleValue == null || roleValue.isBlank()) {
            return "USER";
        }
        return roleValue.trim().toUpperCase(Locale.ROOT);
    }
}
