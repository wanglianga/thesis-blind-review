package com.thesis.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReviewCommentDTO {
    private Long invitationId;
    private Long thesisId;
    private String overallEvaluation;
    private BigDecimal score;
    private String result;
    private String innovationComment;
    private String academicValueComment;
    private String methodologyComment;
    private String writingComment;
    private String revisionSuggestions;
    private String majorIssues;
    private String minorIssues;
}
