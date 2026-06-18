import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card, Progress, message, Drawer, List, Avatar } from 'antd'
import { SearchOutlined, EyeOutlined, BellOutlined, UserOutlined } from '@ant-design/icons'
import { getReviewingThesisList, getThesisInvitations, sendReminder } from '../../api'
import { inviteStatusMap } from '../../utils/constants'
import dayjs from 'dayjs'

const { Option } = Select

function GraduateReviewProgress() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentThesis, setCurrentThesis] = useState(null)
  const [invitations, setInvitations] = useState([])

  useEffect(() => {
    loadData()
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
          <Button size="small" icon={<BellOutlined />} type={isOverdue(record.reviewDeadline) ? 'primary' : 'default'}>
            催办
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
        width={550}
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
                      </div>
                    }
                  />
                  {['INVITED', 'ACCEPTED'].includes(item.status) && (
                    <Button size="small" icon={<BellOutlined />} onClick={() => handleSendReminder(item.id)}>
                      提醒
                    </Button>
                  )}
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default GraduateReviewProgress
