package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.RevisionConfirmDTO;
import com.thesis.dto.RevisionSubmitDTO;
import com.thesis.entity.RevisionConfirmation;
import com.thesis.service.RevisionService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/revision")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @PostMapping("/submit")
    public Result<String> submitRevision(@RequestBody RevisionSubmitDTO dto) {
        Long studentId = SecurityUtil.getCurrentUserId();
        return revisionService.submitRevision(studentId, dto);
    }

    @GetMapping("/supervisor/confirmations")
    public Result<PageResult<RevisionConfirmation>> getSupervisorConfirmations(PageRequest pageRequest) {
        Long supervisorId = SecurityUtil.getCurrentUserId();
        return revisionService.getSupervisorConfirmations(supervisorId, pageRequest);
    }

    @PostMapping("/supervisor/confirm")
    public Result<String> confirmRevision(@RequestBody RevisionConfirmDTO dto) {
        Long supervisorId = SecurityUtil.getCurrentUserId();
        return revisionService.confirmRevision(supervisorId, dto);
    }

    @GetMapping("/thesis/{thesisId}/confirmations")
    public Result<List<RevisionConfirmation>> getThesisConfirmations(@PathVariable Long thesisId) {
        return revisionService.getThesisConfirmations(thesisId);
    }
}
