package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("review_batch")
public class ReviewBatch {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String batchNo;
    private String batchName;
    private String semester;
    private String college;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime reviewDeadline;
    private String status;
    private Integer totalThesisCount;
    private Integer reviewedCount;
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
