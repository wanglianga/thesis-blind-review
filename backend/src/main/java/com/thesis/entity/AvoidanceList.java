package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("avoidance_list")
public class AvoidanceList {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long studentId;
    private String expertName;
    private String expertOrganization;
    private String expertDirection;
    private String reason;
    private String status;
    private Long reviewerId;
    private String reviewRemark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
