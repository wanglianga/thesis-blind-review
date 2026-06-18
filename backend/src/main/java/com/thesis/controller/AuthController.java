package com.thesis.controller;

import com.thesis.common.Result;
import com.thesis.dto.LoginDTO;
import com.thesis.entity.SysUser;
import com.thesis.service.AuthService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Result<?> login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @GetMapping("/userinfo")
    public Result<SysUser> getUserInfo() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return authService.getCurrentUser(userId);
    }
}
