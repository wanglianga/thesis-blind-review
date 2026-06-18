package com.thesis.controller;

import com.thesis.common.Result;
import com.thesis.entity.AvoidanceList;
import com.thesis.mapper.AvoidanceListMapper;
import com.thesis.util.SecurityUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avoidance")
public class AvoidanceController {

    private final AvoidanceListMapper avoidanceListMapper;

    public AvoidanceController(AvoidanceListMapper avoidanceListMapper) {
        this.avoidanceListMapper = avoidanceListMapper;
    }

    @PostMapping
    public Result<AvoidanceList> createAvoidance(@RequestBody AvoidanceList avoidance) {
        Long studentId = SecurityUtil.getCurrentUserId();
        avoidance.setStudentId(studentId);
        avoidance.setStatus("PENDING");
        avoidanceListMapper.insert(avoidance);
        return Result.success(avoidance);
    }

    @GetMapping("/thesis/{thesisId}")
    public Result<List<AvoidanceList>> getByThesis(@PathVariable Long thesisId) {
        LambdaQueryWrapper<AvoidanceList> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AvoidanceList::getThesisId, thesisId);
        wrapper.orderByDesc(AvoidanceList::getCreateTime);
        return Result.success(avoidanceListMapper.selectList(wrapper));
    }

    @GetMapping("/my-list")
    public Result<List<AvoidanceList>> getMyAvoidance() {
        Long studentId = SecurityUtil.getCurrentUserId();
        LambdaQueryWrapper<AvoidanceList> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AvoidanceList::getStudentId, studentId);
        wrapper.orderByDesc(AvoidanceList::getCreateTime);
        return Result.success(avoidanceListMapper.selectList(wrapper));
    }
}
