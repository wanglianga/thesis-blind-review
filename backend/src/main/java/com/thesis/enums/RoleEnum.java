package com.thesis.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    STUDENT("STUDENT", "学生"),
    SUPERVISOR("SUPERVISOR", "导师"),
    COLLEGE_SECRETARY("COLLEGE_SECRETARY", "学院秘书"),
    GRADUATE_SCHOOL("GRADUATE_SCHOOL", "研究生院"),
    EXTERNAL_REVIEWER("EXTERNAL_REVIEWER", "外审专家");

    private final String code;
    private final String desc;

    RoleEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
