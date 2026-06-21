export const statusMap = {
  DRAFT: { text: '草稿', type: 'default' },
  SUBMITTED: { text: '已提交待初审', type: 'info' },
  COLLEGE_REVIEWING: { text: '学院初审中', type: 'info' },
  COLLEGE_REJECTED: { text: '学院初审驳回', type: 'error' },
  COLLEGE_APPROVED: { text: '学院初审通过', type: 'success' },
  PLAGIARISM_CHECKING: { text: '查重中', type: 'info' },
  PLAGIARISM_FAILED: { text: '查重不合格', type: 'error' },
  PLAGIARISM_PASSED: { text: '查重通过', type: 'success' },
  MATCHING_EXPERTS: { text: '匹配专家中', type: 'info' },
  EXPERTS_MATCHED: { text: '专家已匹配', type: 'success' },
  REVIEWING: { text: '盲审处理中', type: 'info' },
  REVIEW_COMPLETED: { text: '评阅完成', type: 'success' },
  STUDENT_REVISING: { text: '学生修改中', type: 'warning' },
  SUPERVISOR_CONFIRMING: { text: '导师确认修改中', type: 'info' },
  MAJOR_REVISION_REVIEWING: { text: '重大修改复审中', type: 'warning' },
  GRADUATE_SCHOOL_REVIEWING: { text: '研究生院复审审核', type: 'warning' },
  DEFENSE_ELIGIBLE: { text: '获得答辩资格', type: 'success' },
  DEFENSE_NOT_ELIGIBLE: { text: '未获得答辩资格', type: 'error' },
}

export const roleMap = {
  STUDENT: '学生',
  SUPERVISOR: '导师',
  COLLEGE_SECRETARY: '学院秘书',
  GRADUATE_SCHOOL: '研究生院',
  EXTERNAL_REVIEWER: '外审专家',
}

export const reviewResultMap = {
  EXCELLENT: { text: '优秀', type: 'success' },
  GOOD: { text: '良好', type: 'success' },
  PASS: { text: '合格', type: 'info' },
  FAIL: { text: '不合格', type: 'error' },
  PENDING: { text: '待评阅', type: 'default' },
}

export const inviteStatusMap = {
  PENDING: { text: '待邀请', type: 'default' },
  INVITED: { text: '已邀请', type: 'info' },
  ACCEPTED: { text: '已接受', type: 'success' },
  DECLINED: { text: '已拒绝', type: 'error' },
  COMPLETED: { text: '已完成评阅', type: 'success' },
  EXPIRED: { text: '已超期', type: 'error' },
}

export const getStatusBadge = (status) => {
  const map = statusMap[status] || { text: status, type: 'default' }
  return map
}
