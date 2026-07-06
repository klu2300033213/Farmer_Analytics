package com.farmer.analytics.security;

import jakarta.servlet.*;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        // ✅ Allow ALL APIs without JWT check
        chain.doFilter(req, res);
    }
}
