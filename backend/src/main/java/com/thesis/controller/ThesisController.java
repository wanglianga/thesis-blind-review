package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ThesisSubmitDTO;
import com.thesis.entity.*;
import com.thesis.service.ThesisService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/thesis")
public class ThesisController {

    private final ThesisService thesisService;

    public ThesisController(ThesisService thesisService) {
        this.thesisService = thesisService;
    }

    @PostMapping("/submit")
    public Result<Thesis> submitThesis(@RequestBody ThesisSubmitDTO dto) {
        Long studentId = SecurityUtil.getCurrentUserId();
        return thesisService.submitThesis(studentId, dto);
    }

    @GetMapping("/my-list")
    public Result<PageResult<Thesis>> getMyThesisList(PageRequest pageRequest) {
        Long studentId = SecurityUtil.getCurrentUserId();
        return thesisService.getStudentThesisList(studentId, pageRequest);
    }

    @GetMapping("/college-list")
    public Result<PageResult<Thesis>> getCollegeThesisList(PageRequest pageRequest) {
        String role = SecurityUtil.getCurrentUserRole();
        String college = "计算机学院";
        return thesisService.getCollegeThesisList(college, pageRequest);
    }

    @GetMapping("/{id}")
    public Result<Thesis> getThesisDetail(@PathVariable Long id) {
        return thesisService.getThesisDetail(id);
    }

    @GetMapping("/{id}/versions")
    public Result<List<ThesisVersion>> getThesisVersions(@PathVariable Long id) {
        return thesisService.getThesisVersions(id);
    }

    @GetMapping("/{id}/avoidance")
    public Result<List<AvoidanceList>> getAvoidanceList(@PathVariable Long id) {
        return thesisService.getAvoidanceList(id);
    }

    @GetMapping("/{id}/logs")
    public Result<List<ThesisReviewLog>> getThesisLogs(@PathVariable Long id) {
        return thesisService.getThesisLogs(id);
    }
}
