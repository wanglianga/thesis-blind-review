import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Timeline, Tag, Empty } from 'antd'
import {
  FileTextOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { getMyThesisList } from '../../api'
import { statusMap } from '../../utils/constants'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    reviewing: 0,
    completed: 0,
    revising: 0,
  })
  const [latestThesis, setLatestThesis] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await getMyThesisList({ pageNum: 1, pageSize: 10 })
      const list = result.list || []
      setStats({
        total: result.total || 0,
        reviewing: list.filter(t => ['SUBMITTED', 'COLLEGE_REVIEWING', 'COLLEGE_APPROVED', 'MATCHING_EXPERTS', 'EXPERTS_MATCHED', 'REVIEWING'].includes(t.status)).length,
        completed: list.filter(t => ['DEFENSE_ELIGIBLE'].includes(t.status)).length,
        revising: list.filter(t => ['STUDENT_REVISING', 'SUPERVISOR_CONFIRMING'].includes(t.status)).length,
      })
      if (list.length > 0) {
        setLatestThesis(list[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const stageSteps = [
    { title: '提交论文', status: 'done' },
    { title: '学院初审', status: 'process' },
    { title: '专家匹配', status: 'wait' },
    { title: '外审评阅', status: 'wait' },
    { title: '意见回收', status: 'wait' },
    { title: '答辩资格', status: 'wait' },
  ]

  return (
    <div>
      <h2 className="page-header">工作台</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card" onClick={() => navigate('/student/thesis')}>
            <Statistic
              title="论文总数"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="评审中"
              value={stats.reviewing}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="修改中"
              value={stats.revising}
              prefix={<AuditOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="已通过"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="最新论文状态" extra={
            <a onClick={() => navigate('/student/thesis')}>查看全部</a>
          }>
            {latestThesis ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ marginBottom: 8 }}>{latestThesis.title}</h3>
                    <div>
                      <Tag color={statusMap[latestThesis.status]?.type === 'success' ? 'green' :
                        statusMap[latestThesis.status]?.type === 'error' ? 'red' :
                          statusMap[latestThesis.status]?.type === 'warning' ? 'orange' : 'blue'}>
                        {statusMap[latestThesis.status]?.text}
                      </Tag>
                      <span style={{ color: '#999', marginLeft: 12 }}>
                        当前阶段：{latestThesis.currentStage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stage-tracker">
                  <Timeline
                    items={stageSteps.map(s => ({
                      color: s.status === 'done' ? 'green' : s.status === 'process' ? 'blue' : 'gray',
                      children: s.title,
                    }))}
                  />
                </div>
              </div>
            ) : (
              <Empty description="暂无论文，快去提交吧" />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="快捷操作">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card type="inner" hoverable onClick={() => navigate('/student/thesis/submit')}>
                <FileTextOutlined style={{ color: '#1677ff', fontSize: 20, marginRight: 8 }} />
                提交新论文
              </Card>
              <Card type="inner" hoverable onClick={() => navigate('/student/thesis')}>
                <AuditOutlined style={{ color: '#52c41a', fontSize: 20, marginRight: 8 }} />
                查看评审进度
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StudentDashboard
