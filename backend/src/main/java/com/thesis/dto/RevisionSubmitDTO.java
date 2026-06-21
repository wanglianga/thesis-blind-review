package com.thesis.dto;

import lombok.Data;

@Data
public class RevisionSubmitDTO {
    private Long thesisId;
    private String revisionDescription;
    private String differenceDescription;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String anonymousFileName;
    private String anonymousFileUrl;
}
