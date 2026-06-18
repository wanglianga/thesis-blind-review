package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("plagiarism_check")
public class PlagiarismCheck {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long thesisVersionId;
    private BigDecimal similarityRate;
    private String checkStatus;
    private String checkReportUrl;
    private String checkOrg;
    private LocalDateTime checkTime;
    private String result;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableLogic
    private Integer deleted;
}
