package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.RevisionConfirmDTO;
import com.thesis.dto.RevisionSubmitDTO;
import com.thesis.entity.*;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RevisionService {

    private final ThesisMapper thesisMapper;
    private final ThesisVersionMapper thesisVersionMapper;
    private final RevisionConfirmationMapper revisionConfirmationMapper;
    private final SysUserMapper sysUserMapper;
    private final ThesisReviewLogMapper thesisReviewLogMapper;

    public RevisionService(ThesisMapper thesisMapper, ThesisVersionMapper thesisVersionMapper,
                           RevisionConfirmationMapper revisionConfirmationMapper, SysUserMapper sysUserMapper,
                           ThesisReviewLogMapper thesisReviewLogMapper) {
        this.thesisMapper = thesisMapper;
        this.thesisVersionMapper = thesisVersionMapper;
        this.revisionConfirmationMapper = revisionConfirmationMapper;
        this.sysUserMapper = sysUserMapper;
        this.thesisReviewLogMapper = thesisReviewLogMapper;
    }

    @Transactional
    public Result<String> submitRevision(Long studentId, RevisionSubmitDTO dto) {
        Thesis thesis = thesisMapper.selectById(dto.getThesisId());
        if (thesis == null) {
            return Result.error("论文不存在");
        }
        if (!thesis.getStudentId().equals(studentId)) {
            return Result.error("无权修改此论文");
        }

        SysUser student = sysUserMapper.selectById(studentId);
        int newVersion = thesis.getVersion() + 1;

        ThesisVersion version = new ThesisVersion();
        version.setThesisId(dto.getThesisId());
        version.setVersion(newVersion);
        version.setFileName(dto.getFileName());
        version.setFileUrl(dto.getFileUrl());
        version.setFileSize(dto.getFileSize());
        version.setAnonymousFileName(dto.getAnonymousFileName());
        version.setAnonymousFileUrl(dto.getAnonymousFileUrl());
        version.setRevisionDescription(dto.getRevisionDescription());
        version.setDifferenceDescription(dto.getDifferenceDescription());
        version.setIsAnonymous(true);
        version.setUploaderRole("STUDENT");
        version.setUploaderId(studentId);
        thesisVersionMapper.insert(version);

        thesis.setVersion(newVersion);
        String fromStatus = thesis.getStatus();
        thesis.setStatus(ThesisStatusEnum.SUPERVISOR_CONFIRMING.getCode());
        thesis.setCurrentStage("导师确认修改中");
        thesisMapper.updateById(thesis);

        RevisionConfirmation confirmation = new RevisionConfirmation();
        confirmation.setThesisId(dto.getThesisId());
        confirmation.setThesisVersionId(version.getId());
        confirmation.setSupervisorId(thesis.getSupervisorId());
        confirmation.setStudentName(student.getRealName());
        confirmation.setRevisionDescription(dto.getRevisionDescription());
        confirmation.setStatus("PENDING");
        confirmation.setSubmitTime(LocalDateTime.now());
        revisionConfirmationMapper.insert(confirmation);

        saveLog(dto.getThesisId(), "提交修改版本", "STUDENT", studentId,
                student.getRealName(), fromStatus, ThesisStatusEnum.SUPERVISOR_CONFIRMING.getCode(),
                "学生提交第" + newVersion + "版修改稿，等待导师确认");

        return Result.success("修改版本提交成功");
    }

    public Result<PageResult<RevisionConfirmation>> getSupervisorConfirmations(Long supervisorId, PageRequest pageRequest) {
        Page<RevisionConfirmation> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<RevisionConfirmation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RevisionConfirmation::getSupervisorId, supervisorId);
        if (pageRequest.getStatus() != null && !pageRequest.getStatus().isEmpty()) {
            wrapper.eq(RevisionConfirmation::getStatus, pageRequest.getStatus());
        }
        wrapper.orderByDesc(RevisionConfirmation::getSubmitTime);
        Page<RevisionConfirmation> result = revisionConfirmationMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    @Transactional
    public Result<String> confirmRevision(Long supervisorId, RevisionConfirmDTO dto) {
        RevisionConfirmation confirmation = revisionConfirmationMapper.selectById(dto.getConfirmationId());
        if (confirmation == null) {
            return Result.error("确认记录不存在");
        }
        if (!confirmation.getSupervisorId().equals(supervisorId)) {
            return Result.error("无权确认此修改");
        }

        SysUser supervisor = sysUserMapper.selectById(supervisorId);
        Thesis thesis = thesisMapper.selectById(confirmation.getThesisId());
        String fromStatus = thesis.getStatus();

        confirmation.setSupervisorOpinion(dto.getSupervisorOpinion());
        confirmation.setConfirmTime(LocalDateTime.now());

        if (dto.getPassed()) {
            confirmation.setStatus("APPROVED");
            if (thesis.getIsMajorRevision() != null && thesis.getIsMajorRevision() == 1) {
                thesis.setStatus(ThesisStatusEnum.MAJOR_REVISION_REVIEWING.getCode());
                thesis.setCurrentStage("重大修改复审中");
                saveLog(thesis.getId(), "导师确认重大修改通过", "SUPERVISOR", supervisorId,
                        supervisor.getRealName(), fromStatus, ThesisStatusEnum.MAJOR_REVISION_REVIEWING.getCode(),
                        "导师确认重大修改通过，进入复审阶段");
            } else {
                thesis.setStatus(ThesisStatusEnum.MATCHING_EXPERTS.getCode());
                thesis.setCurrentStage("等待研究生院重新匹配专家");
                saveLog(thesis.getId(), "导师确认修改通过", "SUPERVISOR", supervisorId,
                        supervisor.getRealName(), fromStatus, ThesisStatusEnum.MATCHING_EXPERTS.getCode(),
                        "导师确认修改通过，可重新送审");
            }
        } else {
            confirmation.setStatus("REJECTED");
            thesis.setStatus(ThesisStatusEnum.STUDENT_REVISING.getCode());
            thesis.setCurrentStage("学生继续修改中");

            saveLog(thesis.getId(), "导师确认修改不通过", "SUPERVISOR", supervisorId,
                    supervisor.getRealName(), fromStatus, ThesisStatusEnum.STUDENT_REVISING.getCode(),
                    "导师认为修改不到位，需要继续修改");
        }

        revisionConfirmationMapper.updateById(confirmation);
        thesisMapper.updateById(thesis);

        return Result.success("确认完成");
    }

    public Result<List<RevisionConfirmation>> getThesisConfirmations(Long thesisId) {
        LambdaQueryWrapper<RevisionConfirmation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RevisionConfirmation::getThesisId, thesisId);
        wrapper.orderByDesc(RevisionConfirmation::getSubmitTime);
        return Result.success(revisionConfirmationMapper.selectList(wrapper));
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
