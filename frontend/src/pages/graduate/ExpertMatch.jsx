import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Select, message, Card, Drawer, List, Avatar } from 'antd'
import { TeamOutlined, EyeOutlined, UserOutlined, SendOutlined } from '@ant-design/icons'
import { getMatchingThesisList, getAvailableExperts, matchExperts, getAllBatches, getThesisInvitations } from '../../api'
import dayjs from 'dayjs'

const { Option } = Select

function GraduateExpertMatch() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [matchModalVisible, setMatchModalVisible] = useState(false)
  const [currentThesis, setCurrentThesis] = useState(null)
  const [experts, setExperts] = useState([])
  const [selectedExperts, setSelectedExperts] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [invitations, setInvitations] = useState([])

  useEffect(() => {
    loadData()
    loadBatches()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getMatchingThesisList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
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

  const handleMatch = async (record) => {
    setCurrentThesis(record)
    setSelectedExperts([])
    setSelectedBatch(null)
    try {
      const result = await getAvailableExperts(record.id)
      setExperts(result || [])
    } catch (e) {
      console.error(e)
    }
    setMatchModalVisible(true)
  }

  const handleSubmitMatch = async () => {
    if (selectedExperts.length === 0) {
      message.warning('请至少选择一位专家')
      return
    }
    try {
      await matchExperts({
        thesisId: currentThesis.id,
        batchId: selectedBatch,
        expertIds: selectedExperts,
      })
      message.success('专家匹配成功')
      setMatchModalVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const viewInvitations = async (thesisId) => {
    try {
      const result = await getThesisInvitations(thesisId)
      setInvitations(result || [])
      setDetailVisible(true)
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    COLLEGE_APPROVED: { text: '待匹配', color: 'blue' },
    MATCHING_EXPERTS: { text: '匹配中', color: 'orange' },
  }

  const inviteStatusMap = {
    PENDING: { text: '待邀请', color: 'default' },
    INVITED: { text: '已邀请', color: 'blue' },
    ACCEPTED: { text: '已接受', color: 'green' },
    DECLINED: { text: '已拒绝', color: 'red' },
    COMPLETED: { text: '已完成', color: 'green' },
  }

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学院', dataIndex: 'college', width: 120 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    {
      title: '学院审核时间',
      dataIndex: 'collegeReviewTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<TeamOutlined />} onClick={() => handleMatch(record)}>
            匹配专家
          </Button>
          <Button size="small" icon={<EyeOutlined />} onClick={() => viewInvitations(record.id)}>
            邀请记录
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">专家匹配</h2>

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

      <Modal
        title="匹配外审专家"
        width={720}
        open={matchModalVisible}
        onOk={handleSubmitMatch}
        onCancel={() => setMatchModalVisible(false)}
        okText="确认匹配"
        cancelText="取消"
      >
        {currentThesis && (
          <div>
            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
              <div><strong>论文：</strong>{currentThesis.title}</div>
              <div><strong>学科方向：</strong>{currentThesis.subjectDirectionName}</div>
              <div><strong>学院：</strong>{currentThesis.college}</div>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>送审批次：</label>
              <Select
                placeholder="请选择送审批次"
                value={selectedBatch}
                onChange={setSelectedBatch}
                style={{ width: '100%' }}
              >
                {batches.map(b => (
                  <Option key={b.id} value={b.id}>{b.batchName}</Option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8 }}>
                选择外审专家（已自动过滤回避名单）：
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
          </div>
        )}
      </Modal>

      <Drawer
        title="专家邀请记录"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        <List
          dataSource={invitations}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <span>{item.expertName}</span>
                    <Tag color={inviteStatusMap[item.status]?.color}>
                      {inviteStatusMap[item.status]?.text}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{item.expertOrganization}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      邀请时间：{item.inviteTime ? dayjs(item.inviteTime).format('YYYY-MM-DD HH:mm') : '-'}
                    </div>
                    {item.deadline && (
                      <div style={{ color: '#999', fontSize: 12 }}>
                        截止日期：{dayjs(item.deadline).format('YYYY-MM-DD HH:mm')}
                      </div>
                    )}
                  </div>
                }
              />
              <Button size="small" icon={<SendOutlined />}>发提醒</Button>
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  )
}

export default GraduateExpertMatch
