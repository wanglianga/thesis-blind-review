package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("thesis_review_log")
public class ThesisReviewLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private String operation;
    private String operatorRole;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private String fromStatus;
    private String toStatus;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableLogic
    private Integer deleted;
}
