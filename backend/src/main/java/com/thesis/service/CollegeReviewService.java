package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.dto.CollegeReviewDTO;
import com.thesis.entity.*;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CollegeReviewService {

    private final ThesisMapper thesisMapper;
    private final ThesisReviewLogMapper thesisReviewLogMapper;
    private final SysUserMapper sysUserMapper;
    private final AvoidanceListMapper avoidanceListMapper;

    public CollegeReviewService(ThesisMapper thesisMapper, ThesisReviewLogMapper thesisReviewLogMapper,
                                SysUserMapper sysUserMapper, AvoidanceListMapper avoidanceListMapper) {
        this.thesisMapper = thesisMapper;
        this.thesisReviewLogMapper = thesisReviewLogMapper;
        this.sysUserMapper = sysUserMapper;
        this.avoidanceListMapper = avoidanceListMapper;
    }

    @Transactional
    public Result<String> collegeReview(Long secretaryId, CollegeReviewDTO dto) {
        Thesis thesis = thesisMapper.selectById(dto.getThesisId());
        if (thesis == null) {
            return Result.error("论文不存在");
        }

        SysUser secretary = sysUserMapper.selectById(secretaryId);
        String fromStatus = thesis.getStatus();

        if (dto.getPassed()) {
            thesis.setStatus(ThesisStatusEnum.COLLEGE_APPROVED.getCode());
            thesis.setCurrentStage("查重处理");
            thesis.setCollegeReviewTime(LocalDateTime.now());
            thesisMapper.updateById(thesis);

            saveLog(thesis.getId(), "学院初审通过", "COLLEGE_SECRETARY", secretaryId,
                    secretary.getRealName(), fromStatus, ThesisStatusEnum.COLLEGE_APPROVED.getCode(), dto.getRemark());
        } else {
            thesis.setStatus(ThesisStatusEnum.COLLEGE_REJECTED.getCode());
            thesis.setCurrentStage("学院初审驳回");
            thesis.setCollegeReviewTime(LocalDateTime.now());
            thesisMapper.updateById(thesis);

            saveLog(thesis.getId(), "学院初审驳回", "COLLEGE_SECRETARY", secretaryId,
                    secretary.getRealName(), fromStatus, ThesisStatusEnum.COLLEGE_REJECTED.getCode(), dto.getRemark());
        }

        return Result.success("审核完成");
    }

    public Result<PageResult<Thesis>> getPendingReviewList(String college, PageRequest pageRequest) {
        Page<Thesis> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<Thesis> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Thesis::getCollege, college);
        wrapper.in(Thesis::getStatus, ThesisStatusEnum.SUBMITTED.getCode(), ThesisStatusEnum.COLLEGE_REVIEWING.getCode());
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Thesis::getTitle, pageRequest.getKeyword())
                    .or().like(Thesis::getStudentName, pageRequest.getKeyword()));
        }
        wrapper.orderByAsc(Thesis::getSubmitTime);
        Page<Thesis> result = thesisMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<List<AvoidanceList>> getAvoidanceByThesis(Long thesisId) {
        LambdaQueryWrapper<AvoidanceList> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AvoidanceList::getThesisId, thesisId);
        wrapper.orderByDesc(AvoidanceList::getCreateTime);
        return Result.success(avoidanceListMapper.selectList(wrapper));
    }

    @Transactional
    public Result<String> reviewAvoidance(Long secretaryId, Long avoidanceId, Boolean passed, String remark) {
        AvoidanceList avoidance = avoidanceListMapper.selectById(avoidanceId);
        if (avoidance == null) {
            return Result.error("回避申请不存在");
        }

        SysUser secretary = sysUserMapper.selectById(secretaryId);
        avoidance.setStatus(passed ? "APPROVED" : "REJECTED");
        avoidance.setReviewerId(secretaryId);
        avoidance.setReviewRemark(remark);
        avoidanceListMapper.updateById(avoidance);

        return Result.success("审核完成");
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
