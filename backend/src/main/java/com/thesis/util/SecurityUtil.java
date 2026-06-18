package com.thesis.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Long) {
                return (Long) principal;
            }
            try {
                return Long.valueOf(principal.toString());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() != null) {
            return authentication.getDetails().toString();
        }
        return null;
    }

    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse(null);
        }
        return null;
    }
}
