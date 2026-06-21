package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ReviewCommentDTO;
import com.thesis.entity.ExpertInvitation;
import com.thesis.entity.ReviewComment;
import com.thesis.entity.Thesis;
import com.thesis.service.ReviewService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/my-invitations")
    public Result<PageResult<ExpertInvitation>> getMyInvitations(PageRequest pageRequest) {
        Long expertId = SecurityUtil.getCurrentUserId();
        return reviewService.getExpertInvitations(expertId, pageRequest);
    }

    @GetMapping("/thesis/{thesisId}")
    public Result<Thesis> getThesisForExpert(@PathVariable Long thesisId) {
        return reviewService.getThesisForExpert(thesisId);
    }

    @PostMapping("/invitation/{id}/accept")
    public Result<String> acceptInvitation(@PathVariable Long id) {
        Long expertId = SecurityUtil.getCurrentUserId();
        return reviewService.acceptInvitation(expertId, id);
    }

    @PostMapping("/invitation/{id}/decline")
    public Result<String> declineInvitation(@PathVariable Long id, @RequestParam(required = false) String reason) {
        Long expertId = SecurityUtil.getCurrentUserId();
        return reviewService.declineInvitation(expertId, id, reason);
    }

    @PostMapping("/submit")
    public Result<String> submitReview(@RequestBody ReviewCommentDTO dto) {
        Long expertId = SecurityUtil.getCurrentUserId();
        return reviewService.submitReview(expertId, dto);
    }

    @GetMapping("/thesis/{thesisId}/comments")
    public Result<List<ReviewComment>> getThesisComments(@PathVariable Long thesisId) {
        return reviewService.getThesisComments(thesisId);
    }

    @GetMapping("/graduate-reviewing-list")
    public Result<PageResult<Thesis>> getGraduateReviewingList(PageRequest pageRequest) {
        return reviewService.getGraduateReviewingList(pageRequest);
    }

    @PostMapping("/graduate-decision/{thesisId}")
    public Result<String> graduateReviewDecision(@PathVariable Long thesisId,
                                                 @RequestParam Boolean eligible,
                                                 @RequestParam String reason) {
        Long graduateSchoolId = SecurityUtil.getCurrentUserId();
        return reviewService.graduateReviewDecision(graduateSchoolId, thesisId, eligible, reason);
    }
}
