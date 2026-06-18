package com.thesis.dto;

import lombok.Data;

@Data
public class CollegeReviewDTO {
    private Long thesisId;
    private Boolean passed;
    private String remark;
}
