package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("defense_qualification")
public class DefenseQualification {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long studentId;
    private String studentName;
    private String status;
    private Boolean eligible;
    private String reason;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewTime;
    private String defenseRound;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
