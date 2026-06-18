package com.thesis.dto;

import lombok.Data;

@Data
public class ThesisSubmitDTO {
    private String title;
    private Long supervisorId;
    private String supervisorName;
    private Long subjectDirectionId;
    private String subjectDirectionName;
    private String anonymousTitle;
    private String anonymousAbstract;
    private String keywords;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String anonymousFileName;
    private String anonymousFileUrl;
}
