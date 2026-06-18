package com.thesis.controller;

import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.CollegeReviewDTO;
import com.thesis.entity.AvoidanceList;
import com.thesis.entity.Thesis;
import com.thesis.service.CollegeReviewService;
import com.thesis.util.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/college-review")
public class CollegeReviewController {

    private final CollegeReviewService collegeReviewService;

    public CollegeReviewController(CollegeReviewService collegeReviewService) {
        this.collegeReviewService = collegeReviewService;
    }

    @GetMapping("/pending-list")
    public Result<PageResult<Thesis>> getPendingReviewList(PageRequest pageRequest) {
        String college = "计算机学院";
        return collegeReviewService.getPendingReviewList(college, pageRequest);
    }

    @PostMapping("/review")
    public Result<String> collegeReview(@RequestBody CollegeReviewDTO dto) {
        Long secretaryId = SecurityUtil.getCurrentUserId();
        return collegeReviewService.collegeReview(secretaryId, dto);
    }

    @GetMapping("/thesis/{thesisId}/avoidance")
    public Result<List<AvoidanceList>> getAvoidanceByThesis(@PathVariable Long thesisId) {
        return collegeReviewService.getAvoidanceByThesis(thesisId);
    }

    @PostMapping("/avoidance/{id}/review")
    public Result<String> reviewAvoidance(@PathVariable Long id,
                                          @RequestParam Boolean passed,
                                          @RequestParam(required = false) String remark) {
        Long secretaryId = SecurityUtil.getCurrentUserId();
        return collegeReviewService.reviewAvoidance(secretaryId, id, passed, remark);
    }
}
