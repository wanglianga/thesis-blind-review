package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.entity.DefenseQualification;
import com.thesis.service.DefenseQualificationService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/defense-qualification")
public class DefenseQualificationController {

    private final DefenseQualificationService defenseQualificationService;

    public DefenseQualificationController(DefenseQualificationService defenseQualificationService) {
        this.defenseQualificationService = defenseQualificationService;
    }

    @GetMapping("/list")
    public Result<PageResult<DefenseQualification>> getQualificationList(PageRequest pageRequest) {
        return defenseQualificationService.getQualificationList(pageRequest);
    }

    @GetMapping("/my-list")
    public Result<List<DefenseQualification>> getMyQualifications() {
        Long studentId = SecurityUtil.getCurrentUserId();
        return defenseQualificationService.getStudentQualifications(studentId);
    }

    @GetMapping("/thesis/{thesisId}")
    public Result<DefenseQualification> getThesisQualification(@PathVariable Long thesisId) {
        return defenseQualificationService.getThesisQualification(thesisId);
    }

    @PostMapping("/{id}/update")
    public Result<String> updateQualification(@PathVariable Long id,
                                              @RequestParam Boolean eligible,
                                              @RequestParam String reason) {
        return defenseQualificationService.updateQualification(id, eligible, reason);
    }
}
