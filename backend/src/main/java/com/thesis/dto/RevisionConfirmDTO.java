package com.thesis.dto;

import lombok.Data;

@Data
public class RevisionConfirmDTO {
    private Long confirmationId;
    private Boolean passed;
    private String supervisorOpinion;
}
