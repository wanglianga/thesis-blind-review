package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thesis.common.PageRequest;
import com.thesis.common.PageResult;
import com.thesis.common.Result;
import com.thesis.entity.DefenseQualification;
import com.thesis.entity.Thesis;
import com.thesis.enums.ThesisStatusEnum;
import com.thesis.mapper.DefenseQualificationMapper;
import com.thesis.mapper.ThesisMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DefenseQualificationService {

    private final DefenseQualificationMapper defenseQualificationMapper;
    private final ThesisMapper thesisMapper;

    public DefenseQualificationService(DefenseQualificationMapper defenseQualificationMapper, ThesisMapper thesisMapper) {
        this.defenseQualificationMapper = defenseQualificationMapper;
        this.thesisMapper = thesisMapper;
    }

    public Result<PageResult<DefenseQualification>> getQualificationList(PageRequest pageRequest) {
        Page<DefenseQualification> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        LambdaQueryWrapper<DefenseQualification> wrapper = new LambdaQueryWrapper<>();
        if (pageRequest.getStatus() != null && !pageRequest.getStatus().isEmpty()) {
            wrapper.eq(DefenseQualification::getStatus, pageRequest.getStatus());
        }
        if (pageRequest.getKeyword() != null && !pageRequest.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(DefenseQualification::getStudentName, pageRequest.getKeyword()));
        }
        wrapper.orderByDesc(DefenseQualification::getCreateTime);
        Page<DefenseQualification> result = defenseQualificationMapper.selectPage(page, wrapper);
        return Result.success(PageResult.of(result.getRecords(), result.getTotal(), pageRequest.getPageNum(), pageRequest.getPageSize()));
    }

    public Result<List<DefenseQualification>> getStudentQualifications(Long studentId) {
        LambdaQueryWrapper<DefenseQualification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DefenseQualification::getStudentId, studentId);
        wrapper.orderByDesc(DefenseQualification::getCreateTime);
        return Result.success(defenseQualificationMapper.selectList(wrapper));
    }

    public Result<DefenseQualification> getThesisQualification(Long thesisId) {
        LambdaQueryWrapper<DefenseQualification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DefenseQualification::getThesisId, thesisId);
        wrapper.orderByDesc(DefenseQualification::getCreateTime);
        wrapper.last("LIMIT 1");
        return Result.success(defenseQualificationMapper.selectOne(wrapper));
    }

    public Result<String> updateQualification(Long id, Boolean eligible, String reason) {
        DefenseQualification qualification = defenseQualificationMapper.selectById(id);
        if (qualification == null) {
            return Result.error("记录不存在");
        }
        qualification.setEligible(eligible);
        qualification.setReason(reason);
        qualification.setStatus(eligible ? "PASS" : "FAIL");
        defenseQualificationMapper.updateById(qualification);

        Thesis thesis = thesisMapper.selectById(qualification.getThesisId());
        if (thesis != null) {
            thesis.setStatus(eligible ? ThesisStatusEnum.DEFENSE_ELIGIBLE.getCode() : ThesisStatusEnum.DEFENSE_NOT_ELIGIBLE.getCode());
            thesis.setCurrentStage(eligible ? "已获得答辩资格" : "未获得答辩资格");
            thesisMapper.updateById(thesis);
        }

        return Result.success("更新成功");
    }
}
