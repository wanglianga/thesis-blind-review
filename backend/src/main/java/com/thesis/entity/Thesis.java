package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("thesis")
public class Thesis {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String thesisNo;
    private String title;
    private Long studentId;
    private String studentName;
    private String studentNo;
    private Long supervisorId;
    private String supervisorName;
    private String college;
    private String major;
    private Long subjectDirectionId;
    private String subjectDirectionName;
    private String status;
    private String currentStage;
    private String anonymousTitle;
    private String anonymousAbstract;
    private String keywords;
    private Integer version;
    private Integer defenseRound;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    private LocalDateTime submitTime;
    private LocalDateTime collegeReviewTime;
    private LocalDateTime expertMatchTime;
    private LocalDateTime reviewDeadline;
    private LocalDateTime reviewCompleteTime;

    @TableLogic
    private Integer deleted;
}
