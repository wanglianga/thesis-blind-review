import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Card, Modal, Input, message } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { getMyInvitations, acceptInvitation, declineInvitation, getThesisForExpert } from '../../api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { TextArea } = Input

function ExpertInvitationList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [currentInvitation, setCurrentInvitation] = useState(null)
  const [declineReason, setDeclineReason] = useState('')
  const [thesisDetailVisible, setThesisDetailVisible] = useState(false)
  const [thesisDetail, setThesisDetail] = useState(null)

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getMyInvitations({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: statusFilter,
      })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (record) => {
    try {
      await acceptInvitation(record.id)
      message.success('已接受邀请')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDecline = (record) => {
    setCurrentInvitation(record)
    setDeclineReason('')
    setDeclineModalVisible(true)
  }

  const submitDecline = async () => {
    if (!declineReason.trim()) {
      message.warning('请填写拒绝原因')
      return
    }
    try {
      await declineInvitation(currentInvitation.id, declineReason)
      message.success('已拒绝邀请')
      setDeclineModalVisible(false)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const viewThesis = async (thesisId) => {
    try {
      const result = await getThesisForExpert(thesisId)
      setThesisDetail(result)
      setThesisDetailVisible(true)
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    PENDING: { text: '待邀请', color: 'default' },
    INVITED: { text: '待接受', color: 'blue' },
    ACCEPTED: { text: '已接受', color: 'orange' },
    DECLINED: { text: '已拒绝', color: 'red' },
    COMPLETED: { text: '已完成', color: 'green' },
    EXPIRED: { text: '已超期', color: 'red' },
  }

  const columns = [
    { title: '邀请ID', dataIndex: 'id', width: 80 },
    {
      title: '论文题目（匿名）',
      dataIndex: 'inviteRemark',
      ellipsis: true,
      render: t => t?.replace('请评阅论文：', '') || '匿名论文',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: s => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    {
      title: '邀请时间',
      dataIndex: 'inviteTime',
      width: 160,
      render: t => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      width: 160,
      render: t => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<FileTextOutlined />} onClick={() => viewThesis(record.thesisId)}>
            查看论文
          </Button>
          {record.status === 'INVITED' && (
            <>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleAccept(record)}>
                接受
              </Button>
              <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleDecline(record)}>
                拒绝
              </Button>
            </>
          )}
          {record.status === 'ACCEPTED' && (
            <Button type="primary" size="small" onClick={() => navigate(`/expert/review/${record.id}`)}>
              提交评阅
            </Button>
          )}
          {record.status === 'COMPLETED' && (
            <Button size="small" onClick={() => navigate(`/expert/review/${record.id}`)}>
              查看评阅
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">评审任务</h2>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <span>状态筛选：</span>
          {[
            { label: '全部', value: '' },
            { label: '待接受', value: 'INVITED' },
            { label: '已接受/待评阅', value: 'ACCEPTED' },
            { label: '已完成', value: 'COMPLETED' },
            { label: '已拒绝', value: 'DECLINED' },
          ].map(item => (
            <Button
              key={item.value}
              type={statusFilter === item.value ? 'primary' : 'default'}
              onClick={() => setStatusFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </Space>

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
        title="拒绝邀请"
        open={declineModalVisible}
        onOk={submitDecline}
        onCancel={() => setDeclineModalVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <p style={{ marginBottom: 16 }}>请填写拒绝原因：</p>
        <TextArea
          rows={4}
          value={declineReason}
          onChange={e => setDeclineReason(e.target.value)}
          placeholder="请说明拒绝本次评审邀请的原因"
        />
      </Modal>

      <Modal
        title="匿名论文信息"
        width={600}
        open={thesisDetailVisible}
        onCancel={() => setThesisDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setThesisDetailVisible(false)}>关闭</Button>,
        ]}
      >
        {thesisDetail && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <strong>论文题目（匿名）：</strong>{thesisDetail.anonymousTitle}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>学科方向：</strong>{thesisDetail.subjectDirectionName}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>关键词：</strong>{thesisDetail.keywords || '-'}
            </div>
            {thesisDetail.anonymousAbstract && (
              <div style={{ marginBottom: 12 }}>
                <strong>摘要：</strong>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {thesisDetail.anonymousAbstract}
                </div>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <span className="anonymous-tag">匿名评审 - 作者信息已隐藏</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ExpertInvitationList
