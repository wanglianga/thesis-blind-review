package com.thesis.enums;

import lombok.Getter;

@Getter
public enum ThesisStatusEnum {
    DRAFT("DRAFT", "草稿"),
    SUBMITTED("SUBMITTED", "已提交待初审"),
    COLLEGE_REVIEWING("COLLEGE_REVIEWING", "学院初审中"),
    COLLEGE_REJECTED("COLLEGE_REJECTED", "学院初审驳回"),
    COLLEGE_APPROVED("COLLEGE_APPROVED", "学院初审通过"),
    PLAGIARISM_CHECKING("PLAGIARISM_CHECKING", "查重中"),
    PLAGIARISM_FAILED("PLAGIARISM_FAILED", "查重不合格"),
    PLAGIARISM_PASSED("PLAGIARISM_PASSED", "查重通过"),
    MATCHING_EXPERTS("MATCHING_EXPERTS", "匹配专家中"),
    EXPERTS_MATCHED("EXPERTS_MATCHED", "专家已匹配"),
    REVIEWING("REVIEWING", "外审中"),
    REVIEW_COMPLETED("REVIEW_COMPLETED", "评阅完成"),
    STUDENT_REVISING("STUDENT_REVISING", "学生修改中"),
    SUPERVISOR_CONFIRMING("SUPERVISOR_CONFIRMING", "导师确认修改"),
    MAJOR_REVISION_REVIEWING("MAJOR_REVISION_REVIEWING", "重大修改复审中"),
    GRADUATE_SCHOOL_REVIEWING("GRADUATE_SCHOOL_REVIEWING", "研究生院复审审核"),
    DEFENSE_ELIGIBLE("DEFENSE_ELIGIBLE", "获得答辩资格"),
    DEFENSE_NOT_ELIGIBLE("DEFENSE_NOT_ELIGIBLE", "未获得答辩资格");

    private final String code;
    private final String desc;

    ThesisStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
