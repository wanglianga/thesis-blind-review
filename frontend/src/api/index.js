import request from '../utils/request'

export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/userinfo',
    method: 'get',
  })
}

export const submitThesis = (data) => {
  return request({
    url: '/thesis/submit',
    method: 'post',
    data,
  })
}

export const getMyThesisList = (params) => {
  return request({
    url: '/thesis/my-list',
    method: 'get',
    params,
  })
}

export const getThesisDetail = (id) => {
  return request({
    url: `/thesis/${id}`,
    method: 'get',
  })
}

export const getThesisVersions = (id) => {
  return request({
    url: `/thesis/${id}/versions`,
    method: 'get',
  })
}

export const getThesisLogs = (id) => {
  return request({
    url: `/thesis/${id}/logs`,
    method: 'get',
  })
}

export const getCollegeThesisList = (params) => {
  return request({
    url: '/thesis/college-list',
    method: 'get',
    params,
  })
}

export const getPendingReviewList = (params) => {
  return request({
    url: '/college-review/pending-list',
    method: 'get',
    params,
  })
}

export const collegeReview = (data) => {
  return request({
    url: '/college-review/review',
    method: 'post',
    data,
  })
}

export const getMatchingThesisList = (params) => {
  return request({
    url: '/expert-match/matching-list',
    method: 'get',
    params,
  })
}

export const getReviewingThesisList = (params) => {
  return request({
    url: '/expert-match/reviewing-list',
    method: 'get',
    params,
  })
}

export const getAvailableExperts = (thesisId) => {
  return request({
    url: `/expert-match/available-experts/${thesisId}`,
    method: 'get',
  })
}

export const matchExperts = (data) => {
  return request({
    url: '/expert-match/match',
    method: 'post',
    data,
  })
}

export const getThesisInvitations = (thesisId) => {
  return request({
    url: `/expert-match/thesis/${thesisId}/invitations`,
    method: 'get',
  })
}

export const sendReminder = (invitationId) => {
  return request({
    url: `/expert-match/reminder/${invitationId}`,
    method: 'post',
  })
}

export const getMyInvitations = (params) => {
  return request({
    url: '/review/my-invitations',
    method: 'get',
    params,
  })
}

export const getThesisForExpert = (thesisId) => {
  return request({
    url: `/review/thesis/${thesisId}`,
    method: 'get',
  })
}

export const acceptInvitation = (id) => {
  return request({
    url: `/review/invitation/${id}/accept`,
    method: 'post',
  })
}

export const declineInvitation = (id, reason) => {
  return request({
    url: `/review/invitation/${id}/decline`,
    method: 'post',
    params: { reason },
  })
}

export const submitReview = (data) => {
  return request({
    url: '/review/submit',
    method: 'post',
    data,
  })
}

export const getThesisComments = (thesisId) => {
  return request({
    url: `/review/thesis/${thesisId}/comments`,
    method: 'get',
  })
}

export const submitRevision = (data) => {
  return request({
    url: '/revision/submit',
    method: 'post',
    data,
  })
}

export const getSupervisorConfirmations = (params) => {
  return request({
    url: '/revision/supervisor/confirmations',
    method: 'get',
    params,
  })
}

export const confirmRevision = (data) => {
  return request({
    url: '/revision/supervisor/confirm',
    method: 'post',
    data,
  })
}

export const getThesisConfirmations = (thesisId) => {
  return request({
    url: `/revision/thesis/${thesisId}/confirmations`,
    method: 'get',
  })
}

export const getDefenseQualificationList = (params) => {
  return request({
    url: '/defense-qualification/list',
    method: 'get',
    params,
  })
}

export const getMyDefenseQualification = (thesisId) => {
  return request({
    url: `/defense-qualification/thesis/${thesisId}`,
    method: 'get',
  })
}

export const updateQualification = (id, eligible, reason) => {
  return request({
    url: `/defense-qualification/${id}/update`,
    method: 'post',
    params: { eligible, reason },
  })
}

export const getAllBatches = () => {
  return request({
    url: '/system/batches',
    method: 'get',
  })
}

export const getAllDirections = () => {
  return request({
    url: '/system/directions',
    method: 'get',
  })
}

export const getUsers = (params) => {
  return request({
    url: '/system/users',
    method: 'get',
    params,
  })
}

export const createUser = (data) => {
  return request({
    url: '/system/users',
    method: 'post',
    data,
  })
}

export const getExperts = () => {
  return request({
    url: '/system/experts',
    method: 'get',
  })
}

export const getSupervisors = (college) => {
  return request({
    url: '/system/supervisors',
    method: 'get',
    params: { college },
  })
}

export const createAvoidance = (data) => {
  return request({
    url: '/avoidance',
    method: 'post',
    data,
  })
}

export const getAvoidanceByThesis = (thesisId) => {
  return request({
    url: `/avoidance/thesis/${thesisId}`,
    method: 'get',
  })
}

export const getMyAvoidance = () => {
  return request({
    url: '/avoidance/my-list',
    method: 'get',
  })
}
