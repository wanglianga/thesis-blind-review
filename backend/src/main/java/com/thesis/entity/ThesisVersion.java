package com.thesis.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("thesis_version")
public class ThesisVersion {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long thesisId;
    private Integer version;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String anonymousFileName;
    private String anonymousFileUrl;
    private String revisionDescription;
    private String differenceDescription;
    private Boolean isAnonymous;
    private String uploaderRole;
    private Long uploaderId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableLogic
    private Integer deleted;
}
