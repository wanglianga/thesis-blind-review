package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ExpertMatchDTO;
import com.thesis.entity.*;
import com.thesis.enums.ExpertInviteStatusEnum;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.enums.RoleEnum;
import com.thesis.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpertMatchService {

    private final ThesisMapper thesisMapper;
    private final ExpertInvitationMapper expertInvitationMapper;
    private final SysUserMapper sysUserMapper;
    private final AvoidanceListMapper avoidanceListMapper;
    private final ThesisReviewLogMapper thesisReviewLogMapper;
    private final ReviewBatchMapper reviewBatchMapper;

    public ExpertMatchService(ThesisMapper thesisMapper, ExpertInvitationMapper expertInvitationMapper,
                              SysUserMapper sysUserMapper, AvoidanceListMapper avoidanceListMapper,
                              ThesisReviewLogMapper thesisReviewLogMapper, ReviewBatchMapper reviewBatchMapper) {
        this.thesisMapper = thesisMapper;
        this.expertInvitationMapper = expertInvitationMapper;
        this.sysUserMapper = sysUserMapper;
        this.avoidanceListMapper = avoidanceListMapper;
        this.thesisReviewLogMapper = thesisReviewLogMapper;
        this.reviewBatchMapper = reviewBatchMapper;
    }

    public Result<List<SysUser>> getAvailableExperts(Long thesisId) {
        Thesis thesis = thesisMapper.selectById(thesisId);
        if (thesis == null) {
            return Result.error("论文不存在");
        }

        List<AvoidanceList> avoidanceList = avoidanceListMapper.selectList(
                new LambdaQueryWrapper<AvoidanceList>()
                        .eq(AvoidanceList::getThesisId, thesisId)
                        .eq(AvoidanceList::getStatus, "APPROVED")
        );

        List<String> avoidExpertNames = avoidanceList.stream()
                .map(AvoidanceList::getExpertName)
                .collect(Collectors.toList());

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getRole, RoleEnum.EXTERNAL_REVIEWER.getCode());
        if (thesis.getSubjectDirectionName() != null && !thesis.getSubjectDirectionName().isEmpty()) {
            wrapper.and(w -> w.like(SysUser::getResearchDirection, thesis.getSubjectDirectionName())
                    .or().like(SysUser::getTitle, "教授")
                    .or().like(SysUser::getTitle, "副教授"));
        }

        List<SysUser> allExperts = sysUserMapper.selectList(wrapper);

        List<SysUser> filteredExperts = allExperts.stream()
                .filter(expert -> !avoidExpertNames.contains(expert.getRealName()))
                .collect(Collectors.toList());

        filteredExperts.forEach(e -> e.setPassword(null));

        return Result.success(filteredExperts);
    }

    @Transactional
    public Result<String> matchExperts(Long graduateSchoolId, ExpertMatchDTO dto) {
        Thesis thesis = thesisMapper.selectById(dto.getThesisId());
        if (thesis == null) {
            return Result.error("论文不存在");
        }

        SysUser graduateSchool = sysUserMapper.selectById(graduateSchoolId);
        String fromStatus = thesis.getStatus();

        List<ExpertInvitation> invitations = new ArrayList<>();
        for (Long expertId : dto.getExpertIds()) {
            SysUser expert = sysUserMapper.selectById(expertId);
            if (expert == null) continue;

            ExpertInvitation invitation = new ExpertInvitation();
            invitation.setThesisId(dto.getThesisId());
            invitation.setExpertId(expertId);
            invitation.setExpertName(expert.getRealName());
            invitation.setExpertOrganization(expert.getOrganization());
            invitation.setBatchId(dto.getBatchId());
            invitation.setStatus(ExpertInviteStatusEnum.INVITED.getCode());
            invitation.setInviteTime(LocalDateTime.now());
            invitation.setDeadline(LocalDateTime.now().plusDays(30));
            invitation.setInviteRemark("请评阅论文：" + thesis.getAnonymousTitle());
            invitations.add(invitation);
        }

        invitations.forEach(expertInvitationMapper::insert);

        thesis.setStatus(ThesisStatusEnum.REVIEWING.getCode());
        thesis.setCurrentStage("外审专家评阅中");
        thesis.setExpertMatchTime(LocalDateTime.now());
        if (dto.getBatchId() != null) {
            ReviewBatch batch = reviewBatchMapper.selectById(dto.getBatchId());
            if (batch != null) {
                thesis.setReviewDeadline(batch.getReviewDeadline());
            }
        }
        thesisMapper.updateById(thesis);

        saveLog(thesis.getId(), "匹配专家完成", "GRADUATE_SCHOOL", graduateSchoolId,
                graduateSchool.getRealName(), fromStatus, ThesisStatusEnum.REVIEWING.getCode(),
                "匹配了 " + invitations.size() + " 位外审专家");

        return Result.success("专家匹配成功");
    }

    public Result<List<ExpertInvitation>> getThesisInvitations(Long thesisId) {
        LambdaQueryWrapper<ExpertInvitation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExpertInvitation::getThesisId, thesisId);
        wrapper.orderByDesc(ExpertInvitation::getCreateTime);
        return Result.success(expertInvitationMapper.selectList(wrapper));
    }

    public Result<PageResult<Thesis>> getMatchingThesisList(PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getStatus, ThesisStatusEnum.COLLEGE_APPROVED.getCode());
        if (pageRequest.getCollege() != null && !pageRequest.getCollege().isEmpty()) {
            wrapper.eq(Thesis::getCollege, pageRequest.getCollege());
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Thesis::getTitle, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentName, pageRequest.getKeyword())
                    .or().like(Thesis::getSubjectDirectionName, pageRequest.getKeyword()));
        }
        wrapper.orderByAsc(Thesis::getCollegeReviewTime);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<PageResult<Thesis>> getReviewingThesisList(PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getStatus, ThesisStatusEnum.REVIEWING.getCode());
        if (pageRequest.getCollege() != null && !pageRequest.getCollege().isEmpty()) {
            wrapper.eq(Thesis::getCollege, pageRequest.getCollege());
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Thesis::getTitle, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentName, pageRequest.getKeyword()));
        }
        wrapper.orderByAsc(Thesis::getReviewDeadline);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<String> sendReminder(Long invitationId) {
        ExpertInvitation invitation = expertInvitationMapper.selectById(invitationId);
        if (invitation == null) {
            return Result.error("邀请不存在");
        }
        invitation.setInviteRemark(invitation.getInviteRemark() + " [已提醒]");
        expertInvitationMapper.updateById(invitation);
        return Result.success("提醒已发送");
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
