package com.thesis.config;

import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTUtil;
import cn.hutool.jwt.signers.JWTSignerUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public String generateToken(Long userId, String username, String role) {
        return JWT.create()
                .setPayload("userId", userId)
                .setPayload("username", username)
                .setPayload("role", role)
                .setIssuedAt(new Date())
                .setExpiresAt(new Date(System.currentTimeMillis() + jwtExpiration))
                .setSigner(JWTSignerUtil.hs256(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .sign();
    }

    public JWT parseToken(String token) {
        if (JWTUtil.verify(token, jwtSecret.getBytes(StandardCharsets.UTF_8))) {
            return JWTUtil.parseToken(token);
        }
        return null;
    }

    public Long getUserIdFromToken(String token) {
        JWT jwt = parseToken(token);
        if (jwt != null) {
            return Long.valueOf(jwt.getPayload("userId").toString());
        }
        return null;
    }

    public String getUsernameFromToken(String token) {
        JWT jwt = parseToken(token);
        if (jwt != null) {
            return jwt.getPayload("username").toString();
        }
        return null;
    }

    public String getRoleFromToken(String token) {
        JWT jwt = parseToken(token);
        if (jwt != null) {
            return jwt.getPayload("role").toString();
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            return JWTUtil.verify(token, jwtSecret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}
