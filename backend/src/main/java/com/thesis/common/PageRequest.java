package com.thesis.common;

import lombok.Data;

@Data
public class PageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private String status;
    private String college;
    private String direction;
}
