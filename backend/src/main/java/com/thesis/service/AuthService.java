package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.thesis.common.Result;
import com.thesis.config.JwtTokenProvider;
import com.thesis.dto.LoginDTO;
import com.thesis.entity.SysUser;
import com.thesis.mapper.SysUserMapper;
import com.thesis.vo.LoginVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(SysUserMapper sysUserMapper, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.sysUserMapper = sysUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public Result<LoginVO> login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return Result.error("密码错误");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setRole(user.getRole());
        vo.setCollege(user.getCollege());

        return Result.success(vo);
    }

    public Result<SysUser> getCurrentUser(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }
}
