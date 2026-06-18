package com.thesis.enums;

import lombok.Getter;

@Getter
public enum ExpertInviteStatusEnum {
    PENDING("PENDING", "待邀请"),
    INVITED("INVITED", "已邀请"),
    ACCEPTED("ACCEPTED", "已接受"),
    DECLINED("DECLINED", "已拒绝"),
    COMPLETED("COMPLETED", "已完成评阅"),
    EXPIRED("EXPIRED", "已超期");

    private final String code;
    private final String desc;

    ExpertInviteStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
