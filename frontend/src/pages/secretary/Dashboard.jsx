import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, Table, Tag, Button, Space } from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { getPendingReviewList, getCollegeThesisList } from '../../api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

function SecretaryDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pending: 0,
    total: 0,
    approved: 0,
    rejected: 0,
    reviewing: 0,
  })
  const [pendingList, setPendingList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pendingResult, allResult] = await Promise.all([
        getPendingReviewList({ pageNum: 1, pageSize: 10 }),
        getCollegeThesisList({ pageNum: 1, pageSize: 100 }),
      ])
      const allList = allResult.list || []
      setStats({
        pending: pendingResult.total || 0,
        total: allResult.total || 0,
        approved: allList.filter(t => t.status === 'COLLEGE_APPROVED').length,
        rejected: allList.filter(t => t.status === 'COLLEGE_REJECTED').length,
        reviewing: allList.filter(t => ['REVIEWING', 'EXPERTS_MATCHED'].includes(t.status)).length,
      })
      setPendingList(pendingResult.list?.slice(0, 5) || [])
    } catch (e) {
      console.error(e)
    }
  }

  const statusMap = {
    SUBMITTED: { text: '待初审', color: 'blue' },
    COLLEGE_REVIEWING: { text: '初审中', color: 'orange' },
    COLLEGE_APPROVED: { text: '已通过', color: 'green' },
    COLLEGE_REJECTED: { text: '已驳回', color: 'red' },
  }

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学生姓名', dataIndex: 'studentName', width: 100 },
    { title: '学科方向', dataIndex: 'subjectDirectionName', width: 120 },
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
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/secretary/pending-review')}>
          审核
        </Button>
      ),
    },
  ]

  const progressPercent = stats.total > 0 ? Math.round((stats.approved + stats.rejected) / stats.total * 100) : 0

  return (
    <div>
      <h2 className="page-header">学院秘书工作台</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={5}>
          <Card className="stat-card" onClick={() => navigate('/secretary/pending-review')}>
            <Statistic
              title="待初审"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="已通过"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="已驳回"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className="stat-card">
            <Statistic
              title="外审中"
              value={stats.reviewing}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="论文总数"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="待初审论文"
            extra={<a onClick={() => navigate('/secretary/pending-review')}>查看全部</a>}
          >
            <Table
              columns={columns}
              dataSource={pendingList}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="初审进度">
            <Progress type="dashboard" percent={progressPercent} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#666' }}>
                已处理 {stats.approved + stats.rejected} / {stats.total} 篇
              </div>
            </div>
          </Card>

          <Card title="快捷操作" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card type="inner" hoverable onClick={() => navigate('/secretary/pending-review')}>
                <EyeOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                初审待办
              </Card>
              <Card type="inner" hoverable onClick={() => navigate('/secretary/thesis')}>
                <FileTextOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                论文管理
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SecretaryDashboard
