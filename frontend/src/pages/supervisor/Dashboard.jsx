import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Button, Space } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { getSupervisorConfirmations } from '../../api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

function SupervisorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pending: 0,
    total: 0,
    approved: 0,
    rejected: 0,
  })
  const [recentList, setRecentList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await getSupervisorConfirmations({ pageNum: 1, pageSize: 10 })
      const list = result.list || []
      setStats({
        total: result.total || 0,
        pending: list.filter(i => i.status === 'PENDING').length,
        approved: list.filter(i => i.status === 'APPROVED').length,
        rejected: list.filter(i => i.status === 'REJECTED').length,
      })
      setRecentList(list.slice(0, 5))
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    PENDING: { text: '待确认', color: 'orange' },
    APPROVED: { text: '已通过', color: 'green' },
    REJECTED: { text: '已驳回', color: 'red' },
  }

  const columns = [
    { title: '学生姓名', dataIndex: 'studentName', width: 120 },
    {
      title: '修改说明',
      dataIndex: 'revisionDescription',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/supervisor/confirmations')}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-header">导师工作台</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="待确认"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="已通过"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="已驳回"
              value={stats.rejected}
              prefix={<FileTextOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
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
        title="最近的修改确认"
        extra={<a onClick={() => navigate('/supervisor/confirmations')}>查看全部</a>}
      >
        <Table
          columns={columns}
          dataSource={recentList}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default SupervisorDashboard
