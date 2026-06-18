package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.entity.ReviewBatch;
import com.thesis.entity.SubjectDirection;
import com.thesis.entity.SysUser;
import com.thesis.service.SystemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/batches")
    public Result<List<ReviewBatch>> getAllBatches() {
        return systemService.getAllBatches();
    }

    @PostMapping("/batches")
    public Result<ReviewBatch> createBatch(@RequestBody ReviewBatch batch) {
        return systemService.createBatch(batch);
    }

    @GetMapping("/directions")
    public Result<List<SubjectDirection>> getAllDirections() {
        return systemService.getAllDirections();
    }

    @PostMapping("/directions")
    public Result<SubjectDirection> createDirection(@RequestBody SubjectDirection direction) {
        return systemService.createDirection(direction);
    }

    @GetMapping("/users")
    public Result<PageResult<SysUser>> getUsers(@RequestParam(required = false) String role,
                                                PageRequest pageRequest) {
        return systemService.getUsersByRole(role, pageRequest);
    }

    @PostMapping("/users")
    public Result<SysUser> createUser(@RequestBody SysUser user) {
        return systemService.createUser(user);
    }

    @PutMapping("/users")
    public Result<String> updateUser(@RequestBody SysUser user) {
        return systemService.updateUser(user);
    }

    @GetMapping("/experts")
    public Result<List<SysUser>> getExperts() {
        return systemService.getExperts();
    }

    @GetMapping("/supervisors")
    public Result<List<SysUser>> getSupervisors(@RequestParam(required = false) String college) {
        return systemService.getSupervisors(college);
    }
}
