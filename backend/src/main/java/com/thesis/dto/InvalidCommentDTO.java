package com.thesis.dto;

import lombok.Data;

@Data
public class InvalidCommentDTO {
    private Long invitationId;
    private Long commentId;
    private String invalidReason;
}
