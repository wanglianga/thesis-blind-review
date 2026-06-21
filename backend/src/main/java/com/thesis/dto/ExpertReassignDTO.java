package com.thesis.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExpertReassignDTO {
    private Long thesisId;
    private Long originalInvitationId;
    private List<Long> expertIds;
    private Long batchId;
    private String reassignedReason;
}
