package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.entity.ReviewBatch;
import com.thesis.entity.SysUser;
import com.thesis.entity.SubjectDirection;
import com.thesis.enums.RoleEnum;
import com.thesis.mapper.ReviewBatchMapper;
import com.thesis.mapper.SysUserMapper;
import com.thesis.mapper.SubjectDirectionMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemService {

    private final ReviewBatchMapper reviewBatchMapper;
    private final SubjectDirectionMapper subjectDirectionMapper;
    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    public SystemService(ReviewBatchMapper reviewBatchMapper, SubjectDirectionMapper subjectDirectionMapper,
                         SysUserMapper sysUserMapper, PasswordEncoder passwordEncoder) {
        this.reviewBatchMapper = reviewBatchMapper;
        this.subjectDirectionMapper = subjectDirectionMapper;
        this.sysUserMapper = sysUserMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public Result<List<ReviewBatch>> getAllBatches() {
        LambdaQueryWrapper<ReviewBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(ReviewBatch::getStartDate);
        return Result.success(reviewBatchMapper.selectList(wrapper));
    }

    public Result<ReviewBatch> createBatch(ReviewBatch batch) {
        reviewBatchMapper.insert(batch);
        return Result.success(batch);
    }

    public Result<List<SubjectDirection>> getAllDirections() {
        LambdaQueryWrapper<SubjectDirection> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SubjectDirection::getCode);
        return Result.success(subjectDirectionMapper.selectList(wrapper));
    }

    public Result<SubjectDirection> createDirection(SubjectDirection direction) {
        subjectDirectionMapper.insert(direction);
        return Result.success(direction);
    }

    public Result<PageResult<SysUser>> getUsersByRole(String role, PageRequest pageRequest) {
        Page<SysUser> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (role != null && !role.isEmpty()) {
            wrapper.eq(SysUser::getRole, role);
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(SysUser::getRealName, pageRequest.getKeyword())
                    .or().like(SysUser::getUsername, pageRequest.getKeyword()));
        }
        if (pageRequest.getCollege() != null && !pageRequest.getCollege().isEmpty()) {
            wrapper.eq(SysUser::getCollege, pageRequest.getCollege());
        }
        wrapper.orderByAsc(SysUser::getId);
        Page<SysUser> result = sysUserMapper.selectPage(page, wrapper);
        result.getRecords().forEach(u -> u.setPassword(null));
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<SysUser> createUser(SysUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword() != null ? user.getPassword() : "123456"));
        sysUserMapper.insert(user);
        user.setPassword(null);
        return Result.success(user);
    }

    public Result<String> updateUser(SysUser user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(null);
        }
        sysUserMapper.updateById(user);
        return Result.success("更新成功");
    }

    public Result<List<SysUser>> getExperts() {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getRole, RoleEnum.EXTERNAL_REVIEWER.getCode());
        wrapper.orderByAsc(SysUser::getId);
        List<SysUser> experts = sysUserMapper.selectList(wrapper);
        experts.forEach(e -> e.setPassword(null));
        return Result.success(experts);
    }

    public Result<List<SysUser>> getSupervisors(String college) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getRole, RoleEnum.SUPERVISOR.getCode());
        if (college != null && !college.isEmpty()) {
            wrapper.eq(SysUser::getCollege, college);
        }
        wrapper.orderByAsc(SysUser::getId);
        List<SysUser> supervisors = sysUserMapper.selectList(wrapper);
        supervisors.forEach(e -> e.setPassword(null));
        return Result.success(supervisors);
    }
}
