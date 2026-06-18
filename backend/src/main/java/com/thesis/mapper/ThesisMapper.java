package com.thesis.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.thesis.entity.Thesis;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ThesisMapper extends BaseMapper<Thesis> {
}
