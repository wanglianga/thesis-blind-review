import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Button, Space } from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { getMyInvitations } from '../../api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

function ExpertDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    declined: 0,
  })
  const [recentList, setRecentList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await getMyInvitations({ pageNum: 1, pageSize: 100 })
      const list = result.list || []
      setStats({
        total: result.total || 0,
        pending: list.filter(i => i.status === 'INVITED').length,
        accepted: list.filter(i => i.status === 'ACCEPTED').length,
        completed: list.filter(i => i.status === 'COMPLETED').length,
        declined: list.filter(i => i.status === 'DECLINED').length,
      })
      setRecentList(list.slice(0, 5))
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
    { title: '论文编号', dataIndex: 'thesisId', width: 100 },
    {
      title: '论文题目',
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
      title: '截止日期',
      dataIndex: 'deadline',
      width: 160,
      render: t => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/expert/invitations')}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">外审专家工作台</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="待接受"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="待评阅"
              value={stats.accepted}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="已拒绝"
              value={stats.declined}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="总计"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="最近的评审任务"
        extra={<a onClick={() => navigate('/expert/invitations')}>查看全部</a>}
      >
        <Table
          columns={columns}
          dataSource={recentList}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default ExpertDashboard
