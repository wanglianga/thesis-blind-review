import { useState } from 'react'
import { Card, Form, Input, Upload, Button, Space, message, Alert } from 'antd'
import { UploadOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { submitRevision } from '../../api'

const { TextArea } = Input

function StudentRevision() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])
  const [anonymousFileList, setAnonymousFileList] = useState([])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (fileList.length === 0) {
        message.error('请上传修改后的论文')
        return
      }

      setLoading(true)

      const file = fileList[0]
      const anonFile = anonymousFileList[0] || file

      await submitRevision({
        thesisId: id,
        revisionDescription: values.revisionDescription,
        fileName: file.name,
        fileUrl: `/mock/${file.name}`,
        fileSize: file.size || 0,
        anonymousFileName: anonFile.name,
        anonymousFileUrl: `/mock/${anonFile.name}`,
      })

      message.success('修改版本提交成功，等待导师确认')
      navigate(`/student/thesis/${id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const normFile = (e) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <h2 style={{ margin: 0 }}>提交修改版本</h2>
      </Space>

      <Alert
        message="修改须知"
        description={
          <div>
            <p>1. 请认真阅读所有外审专家的意见，逐一进行修改</p>
            <p>2. 修改说明需要详细说明针对每条意见的修改情况</p>
            <p>3. 提交后将由导师进行修改确认</p>
            <p>4. 导师确认通过后将重新送审</p>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="修改版本提交">
        <Form form={form} layout="vertical">
          <Form.Item
            name="revisionDescription"
            label="修改说明"
            rules={[{ required: true, message: '请填写修改说明' }]}
            extra="请详细说明针对专家意见的修改内容，可按意见逐条列出"
          >
            <TextArea rows={10} placeholder="请详细说明修改内容，例如：&#10;1. 针对专家1的创新性质疑，补充了XX实验，增加了XX分析...&#10;2. 针对专家2的写作问题，修改了摘要、第3章..." />
          </Form.Item>

          <Form.Item
            name="revisedFile"
            label="修改后的论文（含作者信息）"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: '请上传修改后的论文' }]}
          >
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file])
                return false
              }}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="anonymousFile"
            label="匿名版修改论文（用于盲审）"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="如无变更可不上传，将使用原文匿名处理"
          >
            <Upload
              fileList={anonymousFileList}
              beforeUpload={(file) => {
                setAnonymousFileList([file])
                return false
              }}
              onRemove={() => setAnonymousFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" size="large" icon={<SendOutlined />} loading={loading} onClick={handleSubmit}>
                提交修改
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default StudentRevision
