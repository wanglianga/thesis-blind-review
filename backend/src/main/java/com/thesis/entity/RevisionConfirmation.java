package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("revision_confirmation")
public class RevisionConfirmation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Long thesisVersionId;
    private Long supervisorId;
    private String studentName;
    private String revisionDescription;
    private String supervisorOpinion;
    private String status;
    private LocalDateTime submitTime;
    private LocalDateTime confirmTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
