import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card, Progress, message, Drawer, List, Avatar, Modal, Form, Input as AntInput } from 'antd'
import { SearchOutlined, EyeOutlined, BellOutlined, UserOutlined, UserAddOutlined, StopOutlined } from '@ant-design/icons'
import { getReviewingThesisList, getThesisInvitations, sendReminder, getAvailableExperts, reassignExpert, markCommentInvalid, getThesisComments, getAllBatches } from '../../api'
import { inviteStatusMap } from '../../utils/constants'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = AntInput

function GraduateReviewProgress() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentThesis, setCurrentThesis] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [reassignModalVisible, setReassignModalVisible] = useState(false)
  const [currentInvitation, setCurrentInvitation] = useState(null)
  const [experts, setExperts] = useState([])
  const [selectedExperts, setSelectedExperts] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [reassignReason, setReassignReason] = useState('')
  const [invalidModalVisible, setInvalidModalVisible] = useState(false)
  const [invalidReason, setInvalidReason] = useState('')
  const [currentComment, setCurrentComment] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadBatches()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getReviewingThesisList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        college: collegeFilter,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadBatches = async () => {
    try {
      const result = await getAllBatches()
      setBatches(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const viewDetail = async (record) => {
    setCurrentThesis(record)
    setDetailVisible(true)
    try {
      const result = await getThesisInvitations(record.id)
      setInvitations(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendReminder = async (invitationId) => {
    try {
      await sendReminder(invitationId)
      message.success('提醒已发送')
      if (currentThesis) {
        const result = await getThesisInvitations(currentThesis.id)
        setInvitations(result || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleReassign = async (invitation) => {
    setCurrentInvitation(invitation)
    setSelectedExperts([])
    setSelectedBatch(null)
    setReassignReason('')
    try {
      const result = await getAvailableExperts(invitation.thesisId)
      setExperts(result || [])
    } catch (e) {
      console.error(e)
    }
    setReassignModalVisible(true)
  }

  const handleSubmitReassign = async () => {
    if (selectedExperts.length === 0) {
      message.warning('请至少选择一位专家')
      return
    }
    if (!reassignReason || reassignReason.trim() === '') {
      message.warning('请填写补派原因')
      return
    }
    try {
      await reassignExpert({
        thesisId: currentInvitation.thesisId,
        originalInvitationId: currentInvitation.id,
        expertIds: selectedExperts,
        batchId: selectedBatch,
        reassignedReason: reassignReason,
      })
      message.success('专家补派成功')
      setReassignModalVisible(false)
      if (currentThesis) {
        const result = await getThesisInvitations(currentThesis.id)
        setInvitations(result || [])
      }
      loadData()
    } catch (e) {
      console.error(e)
      message.error('补派失败')
    }
  }

  const handleMarkInvalid = async (invitation) => {
    setCurrentInvitation(invitation)
    setInvalidReason('')
    try {
      const comments = await getThesisComments(invitation.thesisId)
      const comment = comments.find(c => c.invitationId === invitation.id)
      setCurrentComment(comment)
    } catch (e) {
      console.error(e)
    }
    setInvalidModalVisible(true)
  }

  const handleSubmitInvalid = async () => {
    if (!invalidReason || invalidReason.trim() === '') {
      message.warning('请填写格式不合规原因')
      return
    }
    try {
      await markCommentInvalid({
        invitationId: currentInvitation.id,
        commentId: currentComment?.id,
        invalidReason: invalidReason,
      })
      message.success('已标记意见不合规，可进行专家补派')
      setInvalidModalVisible(false)
      if (currentThesis) {
        const result = await getThesisInvitations(currentThesis.id)
        setInvitations(result || [])
      }
    } catch (e) {
      console.error(e)
      message.error('操作失败')
    }
  }

  const getProgress = (record) => {
    const invs = invitations.filter(i => i.thesisId === record.id)
    if (invs.length === 0) return 0
    const completed = invs.filter(i => i.status === 'COMPLETED').length
    return Math.round(completed / invs.length * 100)
  }

  const isOverdue = (deadline) => {
    if (!deadline) return false
    return dayjs().isAfter(dayjs(deadline))
  }

  const getReassignReasonOptions = () => [
    { value: '专家拒绝评审', label: '专家拒绝评审' },
    { value: '专家超期未返回', label: '专家超期未返回' },
    { value: '意见格式不合规', label: '意见格式不合规' },
    { value: '其他原因', label: '其他原因' },
  ]

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学院', dataIndex: 'college', width: 120 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 130 },
    {
      title: '评审进度',
      width: 150,
      render: (_, record) => (
        <Progress percent={getProgress(record)} size="small" />
      ),
    },
    {
      title: '评审截止',
      dataIndex: 'reviewDeadline',
      width: 160,
      render: (t, record) => (
        <Space>
          <span>{t ? dayjs(t).format('YYYY-MM-DD') : '-'}</span>
          {isOverdue(t) && <Tag color="red">已超期</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">评审进度监控</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索论文标题/学生"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={loadData}
          />
          <Select
            placeholder="学院筛选"
            value={collegeFilter || undefined}
            onChange={setCollegeFilter}
            style={{ width: 160 }}
            allowClear
          >
            <Option value="计算机学院">计算机学院</Option>
          </Select>
          <Button type="primary" onClick={loadData}>查询</Button>
        </Space>
      </Card>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize })),
          }}
        />
      </Card>

      <Drawer
        title="评审详情"
        width={650}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentThesis && (
          <div>
            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
              <div><strong>论文：</strong>{currentThesis.title}</div>
              <div><strong>状态：</strong>{currentThesis.currentStage}</div>
              <div><strong>截止日期：</strong>{currentThesis.reviewDeadline ? dayjs(currentThesis.reviewDeadline).format('YYYY-MM-DD HH:mm') : '-'}</div>
            </Card>

            <h4>专家邀请列表</h4>
            <List
              dataSource={invitations}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{item.expertName}</span>
                        {item.isReassigned === 1 && <Tag color="purple">补派</Tag>}
                        <Tag color={inviteStatusMap[item.status]?.type === 'success' ? 'green' : inviteStatusMap[item.status]?.type === 'error' ? 'red' : 'blue'}>
                          {inviteStatusMap[item.status]?.text}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.expertOrganization}</div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          邀请：{item.inviteTime ? dayjs(item.inviteTime).format('MM-DD HH:mm') : '-'}
                          {' | '}
                          截止：{item.deadline ? dayjs(item.deadline).format('MM-DD HH:mm') : '-'}
                        </div>
                        {item.reminderCount > 0 && (
                          <div style={{ color: '#fa8c16', fontSize: 12 }}>已催办 {item.reminderCount} 次</div>
                        )}
                        {item.declineReason && (
                          <div style={{ color: '#ff4d4f', fontSize: 12 }}>拒审原因：{item.declineReason}</div>
                        )}
                        {item.reassignedReason && (
                          <div style={{ color: '#722ed1', fontSize: 12 }}>补派原因：{item.reassignedReason}</div>
                        )}
                        {item.invalidCommentReason && (
                          <div style={{ color: '#eb2f96', fontSize: 12 }}>意见不合规原因：{item.invalidCommentReason}</div>
                        )}
                      </div>
                    }
                  />
                  <Space>
                    {['INVITED', 'ACCEPTED'].includes(item.status) && (
                      <Button size="small" icon={<BellOutlined />} onClick={() => handleSendReminder(item.id)}>
                        催办
                      </Button>
                    )}
                    {['DECLINED', 'EXPIRED'].includes(item.status) && (
                      <Button size="small" type="primary" icon={<UserAddOutlined />} onClick={() => handleReassign(item)}>
                        补派
                      </Button>
                    )}
                    {item.status === 'COMPLETED' && (
                      <Button size="small" danger icon={<StopOutlined />} onClick={() => handleMarkInvalid(item)}>
                        标记不合规
                      </Button>
                    )}
                    {item.status === 'COMPLETED' && isOverdue(item.deadline) && (
                      <Button size="small" type="primary" icon={<UserAddOutlined />} onClick={() => handleReassign(item)}>
                        超期补派
                      </Button>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      <Modal
        title="补派专家"
        width={680}
        open={reassignModalVisible}
        onOk={handleSubmitReassign}
        onCancel={() => setReassignModalVisible(false)}
        okText="确认补派"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reassignReason"
            label="补派原因"
            rules={[{ required: true, message: '请选择或填写补派原因' }]}
          >
            <Select
              placeholder="请选择补派原因"
              value={reassignReason}
              onChange={setReassignReason}
              style={{ width: '100%' }}
            >
              {getReassignReasonOptions().map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>送审批次（可选）：</label>
            <Select
              placeholder="请选择送审批次"
              value={selectedBatch}
              onChange={setSelectedBatch}
              style={{ width: '100%' }}
              allowClear
            >
              {batches.map(b => (
                <Option key={b.id} value={b.id}>{b.batchName}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>
              选择补派专家（已自动过滤回避名单）：
            </label>
            <Select
              mode="multiple"
              placeholder="请选择外审专家"
              value={selectedExperts}
              onChange={setSelectedExperts}
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption
            >
              {experts.map(e => (
                <Option key={e.id} value={e.id}>
                  {e.realName} - {e.organization}（{e.title}）- {e.researchDirection}
                </Option>
              ))}
            </Select>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              共 {experts.length} 位可选专家，已选 {selectedExperts.length} 位
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title="标记评阅意见格式不合规"
        width={520}
        open={invalidModalVisible}
        onOk={handleSubmitInvalid}
        onCancel={() => setInvalidModalVisible(false)}
        okText="确认标记"
        cancelText="取消"
      >
        {currentInvitation && (
          <div>
            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
              <div><strong>专家：</strong>{currentInvitation.expertName}</div>
              <div><strong>单位：</strong>{currentInvitation.expertOrganization}</div>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>格式不合规原因：</label>
              <TextArea
                rows={4}
                value={invalidReason}
                onChange={e => setInvalidReason(e.target.value)}
                placeholder="请详细说明意见格式不合规的原因，例如：缺少分项评价、未填写修改建议等"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default GraduateReviewProgress
