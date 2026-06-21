package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("expert_invitation")
public class ExpertInvitation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long expertId;
    private String expertName;
    private String expertOrganization;
    private Long batchId;
    private String status;
    private LocalDateTime inviteTime;
    private LocalDateTime responseTime;
    private LocalDateTime deadline;
    private String inviteRemark;
    private String declineReason;
    private Integer reminderCount;
    private Integer isReassigned;
    private Long reassignedFromId;
    private String reassignedReason;
    private String invalidCommentReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
