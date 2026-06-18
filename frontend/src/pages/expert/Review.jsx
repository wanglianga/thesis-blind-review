import { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Space, message, Divider, Alert } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { submitReview, getThesisForExpert, getMyInvitations } from '../../api'
import { reviewResultMap } from '../../utils/constants'

const { TextArea } = Input
const { Option } = Select

function ExpertReview() {
  const navigate = useNavigate()
  const { invitationId } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [thesis, setThesis] = useState(null)
  const [invitation, setInvitation] = useState(null)

  useEffect(() => {
    loadData()
  }, [invitationId])

  const loadData = async () => {
    try {
      const invs = await getMyInvitations({ pageNum: 1, pageSize: 100 })
      const inv = invs.list?.find(i => i.id == invitationId)
      if (inv) {
        setInvitation(inv)
        const thesisData = await getThesisForExpert(inv.thesisId)
        setThesis(thesisData)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await submitReview({
        invitationId: parseInt(invitationId),
        thesisId: invitation.thesisId,
        overallEvaluation: values.overallEvaluation,
        score: values.score,
        result: values.result,
        innovationComment: values.innovationComment,
        academicValueComment: values.academicValueComment,
        methodologyComment: values.methodologyComment,
        writingComment: values.writingComment,
        revisionSuggestions: values.revisionSuggestions,
        majorIssues: values.majorIssues,
        minorIssues: values.minorIssues,
      })

      message.success('评阅意见提交成功')
      navigate('/expert/invitations')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <h2 style={{ margin: 0 }}>论文评阅</h2>
      </Space>

      {thesis && (
        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="匿名评审说明"
            description="本平台采用双盲评审机制，作者信息已全部匿名化处理，请您基于学术标准公正评阅。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div style={{ marginBottom: 12 }}>
            <strong>论文题目（匿名）：</strong>{thesis.anonymousTitle}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>学科方向：</strong>{thesis.subjectDirectionName}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>版本：</strong>v{thesis.version}
          </div>
          {thesis.keywords && (
            <div style={{ marginBottom: 12 }}>
              <strong>关键词：</strong>{thesis.keywords}
            </div>
          )}
          <Button type="primary" size="small">下载匿名论文</Button>
        </Card>
      )}

      <Card title="评阅意见">
        <Form form={form} layout="vertical">
          <Divider orientation="left">总体评价</Divider>

          <Form.Item
            name="result"
            label="评阅结论"
            rules={[{ required: true, message: '请选择评阅结论' }]}
          >
            <Select placeholder="请选择评阅结论">
              {Object.entries(reviewResultMap).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="score"
            label="综合评分（0-100）"
            rules={[{ required: true, message: '请输入评分' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入0-100之间的分数" />
          </Form.Item>

          <Form.Item
            name="overallEvaluation"
            label="总体评价"
            rules={[{ required: true, message: '请填写总体评价' }]}
          >
            <TextArea rows={4} placeholder="请对论文进行总体评价" />
          </Form.Item>

          <Divider orientation="left">分项评价</Divider>

          <Form.Item
            name="innovationComment"
            label="创新性评价"
          >
            <TextArea rows={3} placeholder="请评价论文的创新性" />
          </Form.Item>

          <Form.Item
            name="academicValueComment"
            label="学术价值评价"
          >
            <TextArea rows={3} placeholder="请评价论文的学术价值" />
          </Form.Item>

          <Form.Item
            name="methodologyComment"
            label="研究方法评价"
          >
            <TextArea rows={3} placeholder="请评价论文的研究方法" />
          </Form.Item>

          <Form.Item
            name="writingComment"
            label="写作质量评价"
          >
            <TextArea rows={3} placeholder="请评价论文的写作质量" />
          </Form.Item>

          <Divider orientation="left">修改意见</Divider>

          <Form.Item
            name="majorIssues"
            label="主要问题"
            extra="影响论文质量的关键问题，需要作者重点修改"
          >
            <TextArea rows={4} placeholder="请列出论文存在的主要问题" />
          </Form.Item>

          <Form.Item
            name="minorIssues"
            label="次要问题"
            extra="细节性问题，不影响论文整体质量"
          >
            <TextArea rows={3} placeholder="请列出论文存在的次要问题" />
          </Form.Item>

          <Form.Item
            name="revisionSuggestions"
            label="具体修改建议"
            extra="请给出具体的修改建议，帮助作者改进论文"
          >
            <TextArea rows={6} placeholder="请给出具体的修改建议" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" size="large" icon={<SendOutlined />} loading={loading} onClick={handleSubmit}>
                提交评阅意见
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ExpertReview
