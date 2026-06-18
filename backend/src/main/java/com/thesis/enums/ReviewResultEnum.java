package com.thesis.enums;

import lombok.Getter;

@Getter
public enum ReviewResultEnum {
    EXCELLENT("EXCELLENT", "优秀"),
    GOOD("GOOD", "良好"),
    PASS("PASS", "合格"),
    FAIL("FAIL", "不合格"),
    PENDING("PENDING", "待评阅");

    private final String code;
    private final String desc;

    ReviewResultEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
