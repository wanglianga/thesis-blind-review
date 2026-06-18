package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("review_comment")
public class ReviewComment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long expertId;
    private String expertName;
    private Long invitationId;
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
    private LocalDateTime submitTime;
    private Boolean isAnonymous;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
