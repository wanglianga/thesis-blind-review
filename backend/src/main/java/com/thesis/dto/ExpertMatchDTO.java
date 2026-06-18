package com.thesis.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExpertMatchDTO {
    private Long thesisId;
    private Long batchId;
    private List<Long> expertIds;
}
