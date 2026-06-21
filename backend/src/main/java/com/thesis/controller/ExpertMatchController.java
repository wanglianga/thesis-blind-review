package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ExpertMatchDTO;
import com.thesis.dto.ExpertReassignDTO;
import com.thesis.dto.InvalidCommentDTO;
import com.thesis.entity.ExpertInvitation;
import com.thesis.entity.ReviewComment;
import com.thesis.entity.SysUser;
import com.thesis.entity.Thesis;
import com.thesis.service.ExpertMatchService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expert-match")
public class ExpertMatchController {

    private final ExpertMatchService expertMatchService;

    public ExpertMatchController(ExpertMatchService expertMatchService) {
        this.expertMatchService = expertMatchService;
    }

    @GetMapping("/available-experts/{thesisId}")
    public Result<List<SysUser>> getAvailableExperts(@PathVariable Long thesisId) {
        return expertMatchService.getAvailableExperts(thesisId);
    }

    @PostMapping("/match")
    public Result<String> matchExperts(@RequestBody ExpertMatchDTO dto) {
        Long graduateSchoolId = SecurityUtil.getCurrentUserId();
        return expertMatchService.matchExperts(graduateSchoolId, dto);
    }

    @GetMapping("/thesis/{thesisId}/invitations")
    public Result<List<ExpertInvitation>> getThesisInvitations(@PathVariable Long thesisId) {
        return expertMatchService.getThesisInvitations(thesisId);
    }

    @GetMapping("/matching-list")
    public Result<PageResult<Thesis>> getMatchingThesisList(PageRequest pageRequest) {
        return expertMatchService.getMatchingThesisList(pageRequest);
    }

    @GetMapping("/reviewing-list")
    public Result<PageResult<Thesis>> getReviewingThesisList(PageRequest pageRequest) {
        return expertMatchService.getReviewingThesisList(pageRequest);
    }

    @PostMapping("/reminder/{invitationId}")
    public Result<String> sendReminder(@PathVariable Long invitationId) {
        return expertMatchService.sendReminder(invitationId);
    }

    @PostMapping("/reassign")
    public Result<String> reassignExpert(@RequestBody ExpertReassignDTO dto) {
        Long graduateSchoolId = SecurityUtil.getCurrentUserId();
        return expertMatchService.reassignExpert(graduateSchoolId, dto);
    }

    @PostMapping("/mark-invalid")
    public Result<String> markCommentInvalid(@RequestBody InvalidCommentDTO dto) {
        Long graduateSchoolId = SecurityUtil.getCurrentUserId();
        return expertMatchService.markCommentInvalid(graduateSchoolId, dto);
    }

    @GetMapping("/thesis/{thesisId}/comments/round/{round}")
    public Result<List<ReviewComment>> getThesisCommentsByRound(@PathVariable Long thesisId, @PathVariable Integer round) {
        return expertMatchService.getThesisCommentsByRound(thesisId, round);
    }
}
