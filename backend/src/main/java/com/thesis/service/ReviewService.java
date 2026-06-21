package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ReviewCommentDTO;
import com.thesis.entity.*;
import com.thesis.enums.ExpertInviteStatusEnum;
import com.thesis.enums.ReviewResultEnum;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewCommentMapper reviewCommentMapper;
    private final ExpertInvitationMapper expertInvitationMapper;
    private final ThesisMapper thesisMapper;
    private final SysUserMapper sysUserMapper;
    private final ThesisReviewLogMapper thesisReviewLogMapper;
    private final DefenseQualificationMapper defenseQualificationMapper;

    public ReviewService(ReviewCommentMapper reviewCommentMapper, ExpertInvitationMapper expertInvitationMapper,
                         ThesisMapper thesisMapper, SysUserMapper sysUserMapper,
                         ThesisReviewLogMapper thesisReviewLogMapper, DefenseQualificationMapper defenseQualificationMapper) {
        this.reviewCommentMapper = reviewCommentMapper;
        this.expertInvitationMapper = expertInvitationMapper;
        this.thesisMapper = thesisMapper;
        this.sysUserMapper = sysUserMapper;
        this.thesisReviewLogMapper = thesisReviewLogMapper;
        this.defenseQualificationMapper = defenseQualificationMapper;
    }

    public Result<PageResult<ExpertInvitation>> getExpertInvitations(Long expertId, PageRequest pageRequest) {
        Page<ExpertInvitation> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<ExpertInvitation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExpertInvitation::getExpertId, expertId);
        if (pageRequest.getStatus() != null && !pageRequest.getStatus().isEmpty()) {
            wrapper.eq(ExpertInvitation::getStatus, pageRequest.getStatus());
        }
        wrapper.orderByDesc(ExpertInvitation::getCreateTime);
        Page<ExpertInvitation> result = expertInvitationMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<Thesis> getThesisForExpert(Long thesisId) {
        Thesis thesis = thesisMapper.selectById(thesisId);
        if (thesis != null) {
            thesis.setStudentName("匿名");
            thesis.setStudentNo("匿名");
            thesis.setSupervisorName("匿名");
        }
        return Result.success(thesis);
    }

    @Transactional
    public Result<String> acceptInvitation(Long expertId, Long invitationId) {
        ExpertInvitation invitation = expertInvitationMapper.selectById(invitationId);
        if (invitation == null) {
            return Result.error("邀请不存在");
        }
        if (!invitation.getExpertId().equals(expertId)) {
            return Result.error("无权操作此邀请");
        }

        invitation.setStatus(ExpertInviteStatusEnum.ACCEPTED.getCode());
        invitation.setResponseTime(LocalDateTime.now());
        expertInvitationMapper.updateById(invitation);

        return Result.success("已接受邀请");
    }

    @Transactional
    public Result<String> declineInvitation(Long expertId, Long invitationId, String reason) {
        ExpertInvitation invitation = expertInvitationMapper.selectById(invitationId);
        if (invitation == null) {
            return Result.error("邀请不存在");
        }
        if (!invitation.getExpertId().equals(expertId)) {
            return Result.error("无权操作此邀请");
        }

        invitation.setStatus(ExpertInviteStatusEnum.DECLINED.getCode());
        invitation.setResponseTime(LocalDateTime.now());
        invitation.setDeclineReason(reason);
        expertInvitationMapper.updateById(invitation);

        return Result.success("已拒绝邀请");
    }

    @Transactional
    public Result<String> submitReview(Long expertId, ReviewCommentDTO dto) {
        ExpertInvitation invitation = expertInvitationMapper.selectById(dto.getInvitationId());
        if (invitation == null) {
            return Result.error("邀请不存在");
        }
        if (!invitation.getExpertId().equals(expertId)) {
            return Result.error("无权提交评阅");
        }
        if (!ExpertInviteStatusEnum.ACCEPTED.getCode().equals(invitation.getStatus())) {
            return Result.error("请先接受邀请");
        }

        SysUser expert = sysUserMapper.selectById(expertId);

        Thesis thesis = thesisMapper.selectById(dto.getThesisId());
        int reviewRound = 1;
        if (thesis.getIsMajorRevision() != null && thesis.getIsMajorRevision() == 1) {
            reviewRound = 2;
        }

        ReviewComment comment = new ReviewComment();
        comment.setThesisId(dto.getThesisId());
        comment.setExpertId(expertId);
        comment.setExpertName("外审专家" + (expertId % 100));
        comment.setInvitationId(dto.getInvitationId());
        comment.setReviewRound(reviewRound);
        comment.setOverallEvaluation(dto.getOverallEvaluation());
        comment.setScore(dto.getScore());
        comment.setResult(dto.getResult());
        comment.setInnovationComment(dto.getInnovationComment());
        comment.setAcademicValueComment(dto.getAcademicValueComment());
        comment.setMethodologyComment(dto.getMethodologyComment());
        comment.setWritingComment(dto.getWritingComment());
        comment.setRevisionSuggestions(dto.getRevisionSuggestions());
        comment.setMajorIssues(dto.getMajorIssues());
        comment.setMinorIssues(dto.getMinorIssues());
        comment.setSubmitTime(LocalDateTime.now());
        comment.setIsAnonymous(true);
        reviewCommentMapper.insert(comment);

        invitation.setStatus(ExpertInviteStatusEnum.COMPLETED.getCode());
        expertInvitationMapper.updateById(invitation);

        checkAllReviewsCompleted(dto.getThesisId());

        return Result.success("评阅提交成功");
    }

    private void checkAllReviewsCompleted(Long thesisId) {
        LambdaQueryWrapper<ExpertInvitation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExpertInvitation::getThesisId, thesisId);
        List<ExpertInvitation> invitations = expertInvitationMapper.selectList(wrapper);

        if (invitations.isEmpty()) return;

        long completedCount = invitations.stream()
                .filter(i -> ExpertInviteStatusEnum.COMPLETED.getCode().equals(i.getStatus()))
                .count();

        long acceptedCount = invitations.stream()
                .filter(i -> ExpertInviteStatusEnum.ACCEPTED.getCode().equals(i.getStatus())
                        || ExpertInviteStatusEnum.COMPLETED.getCode().equals(i.getStatus()))
                .count();

        if (completedCount > 0 && completedCount == acceptedCount) {
            Thesis thesis = thesisMapper.selectById(thesisId);
            String fromStatus = thesis.getStatus();

            if (thesis.getFirstReviewCompleteTime() == null) {
                thesis.setFirstReviewCompleteTime(LocalDateTime.now());
            }

            if (thesis.getIsMajorRevision() != null && thesis.getIsMajorRevision() == 1) {
                thesis.setStatus(ThesisStatusEnum.GRADUATE_SCHOOL_REVIEWING.getCode());
                thesis.setCurrentStage("研究生院复审审核中");
            } else {
                thesis.setStatus(ThesisStatusEnum.REVIEW_COMPLETED.getCode());
                thesis.setCurrentStage("评阅完成，等待处理");
            }
            thesis.setReviewCompleteTime(LocalDateTime.now());
            thesisMapper.updateById(thesis);

            saveLog(thesisId, "全部评阅完成", "SYSTEM", 0L, "系统",
                    fromStatus, thesis.getStatus(), "所有外审专家已完成评阅");

            if (thesis.getIsMajorRevision() == null || thesis.getIsMajorRevision() == 0) {
                determineDefenseQualification(thesisId);
            }
        }
    }

    private void determineDefenseQualification(Long thesisId) {
        LambdaQueryWrapper<ReviewComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReviewComment::getThesisId, thesisId);
        List<ReviewComment> comments = reviewCommentMapper.selectList(wrapper);

        if (comments.isEmpty()) return;

        long failCount = comments.stream()
                .filter(c -> ReviewResultEnum.FAIL.getCode().equals(c.getResult()))
                .count();

        Thesis thesis = thesisMapper.selectById(thesisId);

        DefenseQualification qualification = new DefenseQualification();
        qualification.setThesisId(thesisId);
        qualification.setStudentId(thesis.getStudentId());
        qualification.setStudentName(thesis.getStudentName());
        qualification.setDefenseRound("第" + thesis.getDefenseRound() + "轮");

        if (failCount == 0) {
            qualification.setStatus("PASS");
            qualification.setEligible(true);
            qualification.setReason("全部外审专家评阅通过");

            String fromStatus = thesis.getStatus();
            thesis.setStatus(ThesisStatusEnum.DEFENSE_ELIGIBLE.getCode());
            thesis.setCurrentStage("已获得答辩资格");
            thesisMapper.updateById(thesis);

            saveLog(thesisId, "获得答辩资格", "SYSTEM", 0L, "系统",
                    fromStatus, ThesisStatusEnum.DEFENSE_ELIGIBLE.getCode(), "外审全部通过，自动获得答辩资格");
        } else if (failCount < comments.size()) {
            qualification.setStatus("REVISION");
            qualification.setEligible(false);
            qualification.setReason("部分专家评定不合格，需要修改后重新送审");

            long hasMajorIssues = comments.stream()
                    .filter(c -> c.getMajorIssues() != null && !c.getMajorIssues().trim().isEmpty())
                    .count();

            String fromStatus = thesis.getStatus();
            if (hasMajorIssues > 0) {
                thesis.setIsMajorRevision(1);
                thesis.setStatus(ThesisStatusEnum.STUDENT_REVISING.getCode());
                thesis.setCurrentStage("学生重大修改中");
                thesisMapper.updateById(thesis);

                saveLog(thesisId, "进入重大修改阶段", "SYSTEM", 0L, "系统",
                        fromStatus, ThesisStatusEnum.STUDENT_REVISING.getCode(),
                        "有" + hasMajorIssues + "位专家指出存在重大问题，需要重大修改后进入复审");
            } else {
                thesis.setIsMajorRevision(0);
                thesis.setStatus(ThesisStatusEnum.STUDENT_REVISING.getCode());
                thesis.setCurrentStage("学生修改中");
                thesisMapper.updateById(thesis);

                saveLog(thesisId, "进入修改阶段", "SYSTEM", 0L, "系统",
                        fromStatus, ThesisStatusEnum.STUDENT_REVISING.getCode(), "有" + failCount + "位专家评定不合格，学生需要修改");
            }
        } else {
            qualification.setStatus("FAIL");
            qualification.setEligible(false);
            qualification.setReason("全部专家评定不合格，不具备答辩资格");

            String fromStatus = thesis.getStatus();
            thesis.setStatus(ThesisStatusEnum.DEFENSE_NOT_ELIGIBLE.getCode());
            thesis.setCurrentStage("未获得答辩资格");
            thesisMapper.updateById(thesis);

            saveLog(thesisId, "未获得答辩资格", "SYSTEM", 0L, "系统",
                    fromStatus, ThesisStatusEnum.DEFENSE_NOT_ELIGIBLE.getCode(), "全部专家评定不合格");
        }

        defenseQualificationMapper.insert(qualification);
    }

    public Result<List<ReviewComment>> getThesisComments(Long thesisId) {
        LambdaQueryWrapper<ReviewComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReviewComment::getThesisId, thesisId);
        wrapper.orderByDesc(ReviewComment::getCreateTime);
        return Result.success(reviewCommentMapper.selectList(wrapper));
    }

    public Result<PageResult<Thesis>> getGraduateReviewingList(PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getStatus, ThesisStatusEnum.GRADUATE_SCHOOL_REVIEWING.getCode());
        if (pageRequest.getCollege() != null && !pageRequest.getCollege().isEmpty()) {
            wrapper.eq(Thesis::getCollege, pageRequest.getCollege());
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Thesis::getTitle, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentName, pageRequest.getKeyword()));
        }
        wrapper.orderByAsc(Thesis::getReviewCompleteTime);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    @Transactional
    public Result<String> graduateReviewDecision(Long graduateSchoolId, Long thesisId, Boolean eligible, String reason) {
        Thesis thesis = thesisMapper.selectById(thesisId);
        if (thesis == null) {
            return Result.error("论文不存在");
        }
        if (!ThesisStatusEnum.GRADUATE_SCHOOL_REVIEWING.getCode().equals(thesis.getStatus())) {
            return Result.error("该论文不在复审审核状态");
        }

        SysUser graduateSchool = sysUserMapper.selectById(graduateSchoolId);
        String fromStatus = thesis.getStatus();

        DefenseQualification qualification = new DefenseQualification();
        qualification.setThesisId(thesisId);
        qualification.setStudentId(thesis.getStudentId());
        qualification.setStudentName(thesis.getStudentName());
        qualification.setDefenseRound("第" + thesis.getDefenseRound() + "轮（复审）");
        qualification.setReviewerId(graduateSchoolId);
        qualification.setReviewerName(graduateSchool.getRealName());
        qualification.setReviewTime(LocalDateTime.now());
        qualification.setRemark(reason);

        if (eligible) {
            qualification.setStatus("PASS");
            qualification.setEligible(true);
            qualification.setReason("研究生院复审通过：" + reason);

            thesis.setStatus(ThesisStatusEnum.DEFENSE_ELIGIBLE.getCode());
            thesis.setCurrentStage("复审通过，已获得答辩资格");
            saveLog(thesisId, "研究生院复审通过", "GRADUATE_SCHOOL", graduateSchoolId,
                    graduateSchool.getRealName(), fromStatus, ThesisStatusEnum.DEFENSE_ELIGIBLE.getCode(), reason);
        } else {
            qualification.setStatus("FAIL");
            qualification.setEligible(false);
            qualification.setReason("研究生院复审不通过：" + reason);

            thesis.setStatus(ThesisStatusEnum.DEFENSE_NOT_ELIGIBLE.getCode());
            thesis.setCurrentStage("复审未通过，不具备答辩资格");
            saveLog(thesisId, "研究生院复审不通过", "GRADUATE_SCHOOL", graduateSchoolId,
                    graduateSchool.getRealName(), fromStatus, ThesisStatusEnum.DEFENSE_NOT_ELIGIBLE.getCode(), reason);
        }

        defenseQualificationMapper.insert(qualification);
        thesisMapper.updateById(thesis);

        return Result.success("复审审核完成");
    }

    private void saveLog(Long thesisId, String operation, String operatorRole, Long operatorId,
                         String operatorName, String fromStatus, String toStatus, String remark) {
        ThesisReviewLog log = new ThesisReviewLog();
        log.setThesisId(thesisId);
        log.setOperation(operation);
        log.setOperatorRole(operatorRole);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setRemark(remark);
        thesisReviewLogMapper.insert(log);
    }
}
