CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    college VARCHAR(100),
    major VARCHAR(100),
    student_no VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    title VARCHAR(50),
    organization VARCHAR(200),
    research_direction VARCHAR(500),
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subject_direction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    college VARCHAR(100),
    description TEXT,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS thesis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_no VARCHAR(50),
    supervisor_id BIGINT,
    supervisor_name VARCHAR(100),
    college VARCHAR(100),
    major VARCHAR(100),
    subject_direction_id BIGINT,
    subject_direction_name VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    current_stage VARCHAR(100),
    anonymous_title VARCHAR(500),
    anonymous_abstract TEXT,
    keywords VARCHAR(500),
    version INT DEFAULT 1,
    defense_round INT DEFAULT 1,
    is_major_revision TINYINT DEFAULT 0,
    first_review_complete_time DATETIME,
    submit_time DATETIME,
    college_review_time DATETIME,
    expert_match_time DATETIME,
    review_deadline DATETIME,
    review_complete_time DATETIME,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS thesis_version (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    version INT NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_size BIGINT,
    anonymous_file_name VARCHAR(255),
    anonymous_file_url VARCHAR(500),
    revision_description TEXT,
    difference_description TEXT,
    is_anonymous TINYINT DEFAULT 0,
    uploader_role VARCHAR(50),
    uploader_id BIGINT,
    create_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS plagiarism_check (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    thesis_version_id BIGINT,
    similarity_rate DECIMAL(5,2),
    check_status VARCHAR(50),
    check_report_url VARCHAR(500),
    check_org VARCHAR(200),
    check_time DATETIME,
    result VARCHAR(50),
    create_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avoidance_list (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    expert_name VARCHAR(100) NOT NULL,
    expert_organization VARCHAR(200),
    expert_direction VARCHAR(200),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewer_id BIGINT,
    review_remark TEXT,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) NOT NULL UNIQUE,
    batch_name VARCHAR(200) NOT NULL,
    semester VARCHAR(50),
    college VARCHAR(100),
    start_date DATETIME,
    end_date DATETIME,
    review_deadline DATETIME,
    status VARCHAR(50),
    total_thesis_count INT DEFAULT 0,
    reviewed_count INT DEFAULT 0,
    description TEXT,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS expert_invitation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    expert_id BIGINT NOT NULL,
    expert_name VARCHAR(100) NOT NULL,
    expert_organization VARCHAR(200),
    batch_id BIGINT,
    status VARCHAR(50) NOT NULL,
    invite_time DATETIME,
    response_time DATETIME,
    deadline DATETIME,
    invite_remark TEXT,
    decline_reason TEXT,
    reminder_count INT DEFAULT 0,
    is_reassigned TINYINT DEFAULT 0,
    reassigned_from_id BIGINT,
    reassigned_reason VARCHAR(200),
    invalid_comment_reason TEXT,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id),
    INDEX idx_expert_id (expert_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    expert_id BIGINT NOT NULL,
    expert_name VARCHAR(100),
    invitation_id BIGINT,
    review_round INT DEFAULT 1,
    overall_evaluation TEXT,
    score DECIMAL(5,2),
    result VARCHAR(50),
    innovation_comment TEXT,
    academic_value_comment TEXT,
    methodology_comment TEXT,
    writing_comment TEXT,
    revision_suggestions TEXT,
    major_issues TEXT,
    minor_issues TEXT,
    submit_time DATETIME,
    is_anonymous TINYINT DEFAULT 1,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id),
    INDEX idx_expert_id (expert_id),
    INDEX idx_review_round (thesis_id, review_round)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS defense_qualification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    eligible TINYINT DEFAULT 0,
    reason TEXT,
    reviewer_id BIGINT,
    reviewer_name VARCHAR(100),
    review_time DATETIME,
    defense_round VARCHAR(50),
    remark TEXT,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS revision_confirmation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    thesis_version_id BIGINT,
    supervisor_id BIGINT NOT NULL,
    student_name VARCHAR(100),
    revision_description TEXT,
    supervisor_opinion TEXT,
    status VARCHAR(50),
    submit_time DATETIME,
    confirm_time DATETIME,
    create_time DATETIME,
    update_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id),
    INDEX idx_supervisor_id (supervisor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS thesis_review_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL,
    operation VARCHAR(100),
    operator_role VARCHAR(50),
    operator_id BIGINT,
    operator_name VARCHAR(100),
    remark TEXT,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    create_time DATETIME,
    deleted TINYINT DEFAULT 0,
    INDEX idx_thesis_id (thesis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
