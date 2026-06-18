import { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Timeline, Button, Space, List, Avatar, Empty, Tabs, Divider } from 'antd'
import { ArrowLeftOutlined, EditOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getThesisDetail, getThesisVersions, getThesisLogs, getThesisComments, getMyDefenseQualification } from '../../api'
import { statusMap, reviewResultMap } from '../../utils/constants'
import dayjs from 'dayjs'

function StudentThesisDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [thesis, setThesis] = useState(null)
  const [versions, setVersions] = useState([])
  const [logs, setLogs] = useState([])
  const [comments, setComments] = useState([])
  const [qualification, setQualification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [thesisData, versionsData, logsData, commentsData, qualData] = await Promise.all([
        getThesisDetail(id),
        getThesisVersions(id),
        getThesisLogs(id),
        getThesisComments(id),
        getMyDefenseQualification(id).catch(() => null),
      ])
      setThesis(thesisData)
      setVersions(versionsData || [])
      setLogs(logsData || [])
      setComments(commentsData || [])
      setQualification(qualData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const canRevise = thesis && ['STUDENT_REVISING', 'COLLEGE_REJECTED'].includes(thesis.status)

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: thesis ? (
        <div>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="论文编号">{thesis.thesisNo}</Descriptions.Item>
            <Descriptions.Item label="版本">v{thesis.version}</Descriptions.Item>
            <Descriptions.Item label="论文题目" span={2}>{thesis.title}</Descriptions.Item>
            <Descriptions.Item label="学科方向">{thesis.subjectDirectionName}</Descriptions.Item>
            <Descriptions.Item label="所属学院">{thesis.college}</Descriptions.Item>
            <Descriptions.Item label="专业">{thesis.major}</Descriptions.Item>
            <Descriptions.Item label="答辩轮次">第{thesis.defenseRound}轮</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={statusMap[thesis.status]?.type === 'success' ? 'green' : statusMap[thesis.status]?.type === 'error' ? 'red' : statusMap[thesis.status]?.type === 'warning' ? 'orange' : 'blue'}>
                {statusMap[thesis.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="当前阶段">{thesis.currentStage}</Descriptions.Item>
            <Descriptions.Item label="关键词">{thesis.keywords || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{thesis.submitTime ? dayjs(thesis.submitTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>

          {qualification && (
            <div style={{ marginTop: 24 }}>
              <Divider orientation="left">答辩资格</Divider>
              <Card type="inner" style={{ borderLeft: `4px solid ${qualification.eligible ? '#52c41a' : '#ff4d4f'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                      {qualification.eligible ? '✅ 已获得答辩资格' : '❌ 未获得答辩资格'}
                    </div>
                    <div style={{ color: '#666' }}>原因：{qualification.reason}</div>
                  </div>
                  <Tag color={qualification.eligible ? 'green' : 'red'}>
                    {qualification.status === 'PASS' ? '通过' : qualification.status === 'REVISION' ? '需修改' : '不通过'}
                  </Tag>
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : <Empty />
    },
    {
      key: 'versions',
      label: '版本记录',
      children: (
        <List
          dataSource={versions}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={
                  <Space>
                    <span>v{item.version}</span>
                    <span className="anonymous-tag">{item.isAnonymous ? '匿名版' : '原版'}</span>
                  </Space>
                }
                description={
                  <div>
                    <div>文件名：{item.fileName}</div>
                    {item.revisionDescription && <div>修改说明：{item.revisionDescription}</div>}
                    <div style={{ color: '#999', fontSize: 12 }}>
                      上传时间：{dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                }
              />
              <Button type="link">下载</Button>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'comments',
      label: '评阅意见',
      children: comments.length > 0 ? (
        <div>
          {comments.map((comment, idx) => (
            <Card
              key={comment.id}
              className="comment-card"
              title={
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>外审专家 {idx + 1}</span>
                  <Tag color={reviewResultMap[comment.result]?.type === 'success' ? 'green' : reviewResultMap[comment.result]?.type === 'error' ? 'red' : 'blue'}>
                    {reviewResultMap[comment.result]?.text}
                  </Tag>
                  {comment.score != null && <span style={{ color: '#faad14' }}>得分：{comment.score}分</span>}
                </Space>
              }
              size="small"
            >
              <div style={{ marginBottom: 12 }}>
                <strong>总体评价：</strong>{comment.overallEvaluation || '-'}
              </div>
              {comment.innovationComment && (
                <div style={{ marginBottom: 8 }}><strong>创新性评价：</strong>{comment.innovationComment}</div>
              )}
              {comment.academicValueComment && (
                <div style={{ marginBottom: 8 }}><strong>学术价值评价：</strong>{comment.academicValueComment}</div>
              )}
              {comment.methodologyComment && (
                <div style={{ marginBottom: 8 }}><strong>研究方法评价：</strong>{comment.methodologyComment}</div>
              )}
              {comment.writingComment && (
                <div style={{ marginBottom: 8 }}><strong>写作质量评价：</strong>{comment.writingComment}</div>
              )}
              {comment.revisionSuggestions && (
                <div style={{ marginTop: 12, padding: '12px', background: '#fff7e6', borderRadius: 4 }}>
                  <strong style={{ color: '#fa8c16' }}>修改建议：</strong>
                  <div style={{ marginTop: 4 }}>{comment.revisionSuggestions}</div>
                </div>
              )}
              {comment.majorIssues && (
                <div style={{ marginTop: 12, padding: '12px', background: '#fff1f0', borderRadius: 4 }}>
                  <strong style={{ color: '#ff4d4f' }}>主要问题：</strong>
                  <div style={{ marginTop: 4 }}>{comment.majorIssues}</div>
                </div>
              )}
              {comment.minorIssues && (
                <div style={{ marginTop: 12, padding: '12px', background: '#f6ffed', borderRadius: 4 }}>
                  <strong style={{ color: '#52c41a' }}>次要问题：</strong>
                  <div style={{ marginTop: 4 }}>{comment.minorIssues}</div>
                </div>
              )}
              <div style={{ marginTop: 12, textAlign: 'right', color: '#999', fontSize: 12 }}>
                提交时间：{comment.submitTime ? dayjs(comment.submitTime).format('YYYY-MM-DD HH:mm') : '-'}
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty description="暂无评阅意见" />
    },
    {
      key: 'logs',
      label: '流程记录',
      children: (
        <Timeline
          className="timeline-custom"
          items={logs.map(log => ({
            color: log.toStatus && statusMap[log.toStatus]?.type === 'success' ? 'green' :
                   log.toStatus && statusMap[log.toStatus]?.type === 'error' ? 'red' :
                   log.toStatus && statusMap[log.toStatus]?.type === 'warning' ? 'orange' : 'blue',
            children: (
              <div>
                <div style={{ fontWeight: 500 }}>{log.operation}</div>
                <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                  操作人：{log.operatorName}（{log.operatorRole === 'SYSTEM' ? '系统' : log.operatorRole}）
                </div>
                {log.remark && <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{log.remark}</div>}
                <div style={{ color: '#bbb', fontSize: 12, marginTop: 4 }}>
                  {dayjs(log.createTime).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
            ),
          }))}
        />
      )
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <h2 style={{ margin: 0 }}>论文详情</h2>
        {thesis && (
          <Tag color={statusMap[thesis.status]?.type === 'success' ? 'green' : statusMap[thesis.status]?.type === 'error' ? 'red' : statusMap[thesis.status]?.type === 'warning' ? 'orange' : 'blue'}>
            {statusMap[thesis.status]?.text}
          </Tag>
        )}
        {canRevise && (
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/student/revision/${id}`)}>
            提交修改版
          </Button>
        )}
      </Space>

      <Card loading={loading}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default StudentThesisDetail
