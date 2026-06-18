package com.thesis.common;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private Long total;
    private List<T> list;
    private Integer pageNum;
    private Integer pageSize;

    public static <T> PageResult<T> of(List<T> list, Long total, Integer pageNum, Integer pageSize) {
        PageResult<T> result = new PageResult<>();
        result.setList(list);
        result.setTotal(total);
        result.setPageNum(pageNum);
        result.setPageSize(pageSize);
        return result;
    }
}
