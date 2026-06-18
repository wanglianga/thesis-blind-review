package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.ThesisSubmitDTO;
import com.thesis.entity.*;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.hutool.core.util.IdUtil;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ThesisService {

    private final ThesisMapper thesisMapper;
    private final ThesisVersionMapper thesisVersionMapper;
    private final ThesisReviewLogMapper thesisReviewLogMapper;
    private final SysUserMapper sysUserMapper;
    private final AvoidanceListMapper avoidanceListMapper;

    public ThesisService(ThesisMapper thesisMapper, ThesisVersionMapper thesisVersionMapper,
                         ThesisReviewLogMapper thesisReviewLogMapper, SysUserMapper sysUserMapper,
                         AvoidanceListMapper avoidanceListMapper) {
        this.thesisMapper = thesisMapper;
        this.thesisVersionMapper = thesisVersionMapper;
        this.thesisReviewLogMapper = thesisReviewLogMapper;
        this.sysUserMapper = sysUserMapper;
        this.avoidanceListMapper = avoidanceListMapper;
    }

    @Transactional
    public Result<Thesis> submitThesis(Long studentId, ThesisSubmitDTO dto) {
        SysUser student = sysUserMapper.selectById(studentId);
        if (student == null) {
            return Result.error("学生不存在");
        }

        Thesis thesis = new Thesis();
        thesis.setThesisNo("TH" + IdUtil.getSnowflakeNextIdStr().substring(0, 10));
        thesis.setTitle(dto.getTitle());
        thesis.setStudentId(studentId);
        thesis.setStudentName(student.getRealName());
        thesis.setStudentNo(student.getStudentNo());
        thesis.setCollege(student.getCollege());
        thesis.setMajor(student.getMajor());
        thesis.setSupervisorId(dto.getSupervisorId());
        thesis.setSupervisorName(dto.getSupervisorName());
        thesis.setSubjectDirectionId(dto.getSubjectDirectionId());
        thesis.setSubjectDirectionName(dto.getSubjectDirectionName());
        thesis.setStatus(ThesisStatusEnum.SUBMITTED.getCode());
        thesis.setCurrentStage("学院初审");
        thesis.setAnonymousTitle(dto.getAnonymousTitle());
        thesis.setAnonymousAbstract(dto.getAnonymousAbstract());
        thesis.setKeywords(dto.getKeywords());
        thesis.setVersion(1);
        thesis.setDefenseRound(1);
        thesis.setSubmitTime(LocalDateTime.now());

        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getStudentId, studentId);
        wrapper.eq(Thesis::getDefenseRound, 1);
        wrapper.isNull(Thesis::getDeleted);
        Long count = thesisMapper.selectCount(wrapper);
        if (count > 0) {
            return Result.error("本轮答辩已提交过论文");
        }

        thesisMapper.insert(thesis);

        ThesisVersion version = new ThesisVersion();
        version.setThesisId(thesis.getId());
        version.setVersion(1);
        version.setFileName(dto.getFileName());
        version.setFileUrl(dto.getFileUrl());
        version.setFileSize(dto.getFileSize());
        version.setAnonymousFileName(dto.getAnonymousFileName());
        version.setAnonymousFileUrl(dto.getAnonymousFileUrl());
        version.setIsAnonymous(true);
        version.setUploaderRole("STUDENT");
        version.setUploaderId(studentId);
        thesisVersionMapper.insert(version);

        saveLog(thesis.getId(), "提交论文", "STUDENT", studentId, student.getRealName(),
                null, ThesisStatusEnum.SUBMITTED.getCode(), "学生提交论文，等待学院初审");

        return Result.success(thesis);
    }

    public Result<PageResult<Thesis>> getStudentThesisList(Long studentId, PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getStudentId, studentId);
        if (pageRequest.getStatus() != null && !pageRequest.getStatus().isEmpty()) {
            wrapper.eq(Thesis::getStatus, pageRequest.getStatus());
        }
        wrapper.orderByDesc(Thesis::getCreateTime);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<PageResult<Thesis>> getCollegeThesisList(String college, PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getCollege, college);
        if (pageRequest.getStatus() != null && !pageRequest.getStatus().isEmpty()) {
            wrapper.eq(Thesis::getStatus, pageRequest.getStatus());
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Thesis::getTitle, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentName, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentNo, pageRequest.getKeyword()));
        }
        wrapper.orderByDesc(Thesis::getSubmitTime);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<Thesis> getThesisDetail(Long thesisId) {
        Thesis thesis = thesisMapper.selectById(thesisId);
        return Result.success(thesis);
    }

    public Result<List<ThesisVersion>> getThesisVersions(Long thesisId) {
        LambdaQueryWrapper<ThesisVersion> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ThesisVersion::getThesisId, thesisId);
        wrapper.orderByDesc(ThesisVersion::getVersion);
        List<ThesisVersion> versions = thesisVersionMapper.selectList(wrapper);
        return Result.success(versions);
    }

    public Result<List<AvoidanceList>> getAvoidanceList(Long thesisId) {
        LambdaQueryWrapper<AvoidanceList> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AvoidanceList::getThesisId, thesisId);
        wrapper.orderByDesc(AvoidanceList::getCreateTime);
        List<AvoidanceList> list = avoidanceListMapper.selectList(wrapper);
        return Result.success(list);
    }

    public Result<List<ThesisReviewLog>> getThesisLogs(Long thesisId) {
        LambdaQueryWrapper<ThesisReviewLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ThesisReviewLog::getThesisId, thesisId);
        wrapper.orderByAsc(ThesisReviewLog::getCreateTime);
        List<ThesisReviewLog> logs = thesisReviewLogMapper.selectList(wrapper);
        return Result.success(logs);
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
