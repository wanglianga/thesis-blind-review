import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, Table, Tag, Button, Space } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { getMatchingThesisList, getReviewingThesisList, getDefenseQualificationList } from '../../api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

function GraduateDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    matching: 0,
    reviewing: 0,
    completed: 0,
    eligible: 0,
    total: 0,
    overdue: 0,
  })
  const [urgentList, setUrgentList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [matchingResult, reviewingResult, qualResult] = await Promise.all([
        getMatchingThesisList({ pageNum: 1, pageSize: 100 }),
        getReviewingThesisList({ pageNum: 1, pageSize: 100 }),
        getDefenseQualificationList({ pageNum: 1, pageSize: 100 }),
      ])

      const reviewingList = reviewingResult.list || []
      const now = dayjs()
      const overdueCount = reviewingList.filter(t => {
        if (!t.reviewDeadline) return false
        return now.isAfter(dayjs(t.reviewDeadline))
      }).length

      const qualList = qualResult.list || []
      const eligibleCount = qualList.filter(q => q.eligible).length

      setStats({
        matching: matchingResult.total || 0,
        reviewing: reviewingResult.total || 0,
        completed: qualList.length,
        eligible: eligibleCount,
        total: (matchingResult.total || 0) + (reviewingResult.total || 0) + qualList.length,
        overdue: overdueCount,
      })

      const urgent = [...reviewingList]
        .sort((a, b) => dayjs(a.reviewDeadline).valueOf() - dayjs(b.reviewDeadline).valueOf())
        .slice(0, 5)
      setUrgentList(urgent)
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    { title: '论文编号', dataIndex: 'thesisNo', width: 130 },
    { title: '论文题目', dataIndex: 'title', ellipsis: true },
    { title: '学院', dataIndex: 'college', width: 120 },
    {
      title: '截止日期',
      dataIndex: 'reviewDeadline',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '是否超期',
      width: 100,
      render: (_, record) => {
        if (!record.reviewDeadline) return <Tag color="default">-</Tag>
        const isOverdue = dayjs().isAfter(dayjs(record.reviewDeadline))
        return <Tag color={isOverdue ? 'red' : 'green'}>{isOverdue ? '已超期' : '评审中'}</Tag>
      },
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/graduate/review-progress')}>
          查看
        </Button>
      ),
    },
  ]

  const completionRate = stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0

  return (
    <div>
      <h2 className="page-header">研究生院工作台</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card className="stat-card" onClick={() => navigate('/graduate/expert-match')}>
            <Statistic
              title="待匹配专家"
              value={stats.matching}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" onClick={() => navigate('/graduate/review-progress')}>
            <Statistic
              title="外审中"
              value={stats.reviewing}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" onClick={() => navigate('/graduate/review-progress')}>
            <Statistic
              title="已超期"
              value={stats.overdue}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" onClick={() => navigate('/graduate/defense-qualification')}>
            <Statistic
              title="已完成评审"
              value={stats.completed}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" onClick={() => navigate('/graduate/defense-qualification')}>
            <Statistic
              title="获答辩资格"
              value={stats.eligible}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
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
            title="即将截止/已超期评审"
            extra={<a onClick={() => navigate('/graduate/review-progress')}>查看全部</a>}
          >
            <Table
              columns={columns}
              dataSource={urgentList}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="整体完成进度">
            <Progress type="dashboard" percent={completionRate} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#666' }}>
                已完成 {stats.completed} / {stats.total} 篇
              </div>
            </div>
          </Card>

          <Card title="快捷操作" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card type="inner" hoverable onClick={() => navigate('/graduate/expert-match')}>
                <TeamOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                专家匹配
              </Card>
              <Card type="inner" hoverable onClick={() => navigate('/graduate/review-progress')}>
                <ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                评审进度监控
              </Card>
              <Card type="inner" hoverable onClick={() => navigate('/graduate/defense-qualification')}>
                <TrophyOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                答辩资格管理
              </Card>
              <Card type="inner" hoverable onClick={() => navigate('/graduate/system')}>
                <EyeOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                系统管理
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default GraduateDashboard
