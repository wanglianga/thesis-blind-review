package com.thesis.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.thesis.entity.*;
import com.thesis.enums.*;
import com.thesis.mapper.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitService implements ApplicationRunner {

    private final SysUserMapper sysUserMapper;
    private final SubjectDirectionMapper subjectDirectionMapper;
    private final ReviewBatchMapper reviewBatchMapper;
    private final ThesisMapper thesisMapper;
    private final ThesisVersionMapper thesisVersionMapper;
    private final PasswordEncoder passwordEncoder;

    public DataInitService(SysUserMapper sysUserMapper, SubjectDirectionMapper subjectDirectionMapper,
                           ReviewBatchMapper reviewBatchMapper, ThesisMapper thesisMapper,
                           ThesisVersionMapper thesisVersionMapper, PasswordEncoder passwordEncoder) {
        this.sysUserMapper = sysUserMapper;
        this.subjectDirectionMapper = subjectDirectionMapper;
        this.reviewBatchMapper = reviewBatchMapper;
        this.thesisMapper = thesisMapper;
        this.thesisVersionMapper = thesisVersionMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        initUsers();
        initDirections();
        initBatches();
    }

    private void initUsers() {
        if (sysUserMapper.selectCount(new LambdaQueryWrapper<>()) > 0) {
            return;
        }

        SysUser graduateSchool = new SysUser();
        graduateSchool.setUsername("graduate");
        graduateSchool.setPassword(passwordEncoder.encode("123456"));
        graduateSchool.setRealName("研究生院管理员");
        graduateSchool.setRole(RoleEnum.GRADUATE_SCHOOL.getCode());
        graduateSchool.setCollege("研究生院");
        graduateSchool.setEmail("graduate@university.edu");
        sysUserMapper.insert(graduateSchool);

        SysUser secretary = new SysUser();
        secretary.setUsername("secretary");
        secretary.setPassword(passwordEncoder.encode("123456"));
        secretary.setRealName("张秘书");
        secretary.setRole(RoleEnum.COLLEGE_SECRETARY.getCode());
        secretary.setCollege("计算机学院");
        secretary.setEmail("secretary@cs.university.edu");
        sysUserMapper.insert(secretary);

        SysUser supervisor = new SysUser();
        supervisor.setUsername("supervisor");
        supervisor.setPassword(passwordEncoder.encode("123456"));
        supervisor.setRealName("李教授");
        supervisor.setRole(RoleEnum.SUPERVISOR.getCode());
        supervisor.setCollege("计算机学院");
        supervisor.setTitle("教授");
        supervisor.setResearchDirection("人工智能");
        supervisor.setEmail("li@cs.university.edu");
        sysUserMapper.insert(supervisor);

        SysUser supervisor2 = new SysUser();
        supervisor2.setUsername("supervisor2");
        supervisor2.setPassword(passwordEncoder.encode("123456"));
        supervisor2.setRealName("王教授");
        supervisor2.setRole(RoleEnum.SUPERVISOR.getCode());
        supervisor2.setCollege("计算机学院");
        supervisor2.setTitle("教授");
        supervisor2.setResearchDirection("软件工程");
        supervisor2.setEmail("wang@cs.university.edu");
        sysUserMapper.insert(supervisor2);

        SysUser student = new SysUser();
        student.setUsername("student");
        student.setPassword(passwordEncoder.encode("123456"));
        student.setRealName("张三");
        student.setRole(RoleEnum.STUDENT.getCode());
        student.setCollege("计算机学院");
        student.setMajor("计算机科学与技术");
        student.setStudentNo("2021001001");
        student.setEmail("zhangsan@student.university.edu");
        sysUserMapper.insert(student);

        SysUser student2 = new SysUser();
        student2.setUsername("student2");
        student2.setPassword(passwordEncoder.encode("123456"));
        student2.setRealName("李四");
        student2.setRole(RoleEnum.STUDENT.getCode());
        student2.setCollege("计算机学院");
        student2.setMajor("软件工程");
        student2.setStudentNo("2021001002");
        student2.setEmail("lisi@student.university.edu");
        sysUserMapper.insert(student2);

        SysUser expert1 = new SysUser();
        expert1.setUsername("expert1");
        expert1.setPassword(passwordEncoder.encode("123456"));
        expert1.setRealName("赵专家");
        expert1.setRole(RoleEnum.EXTERNAL_REVIEWER.getCode());
        expert1.setOrganization("清华大学");
        expert1.setTitle("教授");
        expert1.setResearchDirection("人工智能,机器学习");
        expert1.setEmail("zhao@tsinghua.edu.cn");
        sysUserMapper.insert(expert1);

        SysUser expert2 = new SysUser();
        expert2.setUsername("expert2");
        expert2.setPassword(passwordEncoder.encode("123456"));
        expert2.setRealName("钱专家");
        expert2.setRole(RoleEnum.EXTERNAL_REVIEWER.getCode());
        expert2.setOrganization("北京大学");
        expert2.setTitle("教授");
        expert2.setResearchDirection("软件工程,系统架构");
        expert2.setEmail("qian@pku.edu.cn");
        sysUserMapper.insert(expert2);

        SysUser expert3 = new SysUser();
        expert3.setUsername("expert3");
        expert3.setPassword(passwordEncoder.encode("123456"));
        expert3.setRealName("孙专家");
        expert3.setRole(RoleEnum.EXTERNAL_REVIEWER.getCode());
        expert3.setOrganization("浙江大学");
        expert3.setTitle("副教授");
        expert3.setResearchDirection("数据挖掘,人工智能");
        expert3.setEmail("sun@zju.edu.cn");
        sysUserMapper.insert(expert3);

        SysUser expert4 = new SysUser();
        expert4.setUsername("expert4");
        expert4.setPassword(passwordEncoder.encode("123456"));
        expert4.setRealName("周专家");
        expert4.setRole(RoleEnum.EXTERNAL_REVIEWER.getCode());
        expert4.setOrganization("上海交通大学");
        expert4.setTitle("教授");
        expert4.setResearchDirection("计算机网络,分布式系统");
        expert4.setEmail("zhou@sjtu.edu.cn");
        sysUserMapper.insert(expert4);

        SysUser expert5 = new SysUser();
        expert5.setUsername("expert5");
        expert5.setPassword(passwordEncoder.encode("123456"));
        expert5.setRealName("吴专家");
        expert5.setRole(RoleEnum.EXTERNAL_REVIEWER.getCode());
        expert5.setOrganization("复旦大学");
        expert5.setTitle("教授");
        expert5.setResearchDirection("算法,理论计算机科学");
        expert5.setEmail("wu@fudan.edu.cn");
        sysUserMapper.insert(expert5);
    }

    private void initDirections() {
        if (subjectDirectionMapper.selectCount(new LambdaQueryWrapper<>()) > 0) {
            return;
        }

        String[][] directions = {
                {"人工智能", "CS01", "计算机学院", "人工智能、机器学习、深度学习方向"},
                {"软件工程", "CS02", "计算机学院", "软件工程、系统架构方向"},
                {"计算机网络", "CS03", "计算机学院", "计算机网络、分布式系统方向"},
                {"数据科学", "CS04", "计算机学院", "数据挖掘、大数据方向"},
                {"算法理论", "CS05", "计算机学院", "算法设计与分析、理论计算机科学方向"}
        };

        for (String[] dir : directions) {
            SubjectDirection direction = new SubjectDirection();
            direction.setName(dir[0]);
            direction.setCode(dir[1]);
            direction.setCollege(dir[2]);
            direction.setDescription(dir[3]);
            subjectDirectionMapper.insert(direction);
        }
    }

    private void initBatches() {
        if (reviewBatchMapper.selectCount(new LambdaQueryWrapper<>()) > 0) {
            return;
        }

        ReviewBatch batch = new ReviewBatch();
        batch.setBatchNo("BATCH202401");
        batch.setBatchName("2024年春季学期盲审第一批");
        batch.setSemester("2024春季");
        batch.setCollege("计算机学院");
        batch.setStartDate(LocalDateTime.of(2024, 3, 1, 0, 0));
        batch.setEndDate(LocalDateTime.of(2024, 4, 30, 23, 59));
        batch.setReviewDeadline(LocalDateTime.of(2024, 5, 31, 23, 59));
        batch.setStatus("ACTIVE");
        batch.setTotalThesisCount(0);
        batch.setReviewedCount(0);
        batch.setDescription("2024年春季学期硕士论文盲审第一批");
        reviewBatchMapper.insert(batch);

        ReviewBatch batch2 = new ReviewBatch();
        batch2.setBatchNo("BATCH202402");
        batch2.setBatchName("2024年秋季学期盲审第一批");
        batch2.setSemester("2024秋季");
        batch2.setCollege("计算机学院");
        batch2.setStartDate(LocalDateTime.of(2024, 9, 1, 0, 0));
        batch2.setEndDate(LocalDateTime.of(2024, 10, 31, 23, 59));
        batch2.setReviewDeadline(LocalDateTime.of(2024, 11, 30, 23, 59));
        batch2.setStatus("PLANNED");
        batch2.setTotalThesisCount(0);
        batch2.setReviewedCount(0);
        batch2.setDescription("2024年秋季学期硕士论文盲审第一批");
        reviewBatchMapper.insert(batch2);
    }
}
