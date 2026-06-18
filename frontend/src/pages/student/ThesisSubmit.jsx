import { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, Upload, message, Space, Alert } from 'antd'
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { submitThesis, getAllDirections, getSupervisors } from '../../api'

const { TextArea } = Input
const { Option } = Select

function StudentThesisSubmit() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [directions, setDirections] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [fileList, setFileList] = useState([])
  const [anonymousFileList, setAnonymousFileList] = useState([])

  useEffect(() => {
    loadDirections()
    loadSupervisors()
  }, [])

  const loadDirections = async () => {
    try {
      const result = await getAllDirections()
      setDirections(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadSupervisors = async () => {
    try {
      const result = await getSupervisors()
      setSupervisors(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (fileList.length === 0) {
        message.error('请上传论文原文')
        return
      }
      if (anonymousFileList.length === 0) {
        message.error('请上传匿名版论文')
        return
      }

      setLoading(true)

      const file = fileList[0]
      const anonFile = anonymousFileList[0]

      const supervisor = supervisors.find(s => s.id === values.supervisorId)
      await submitThesis({
        title: values.title,
        supervisorId: values.supervisorId,
        supervisorName: supervisor?.realName,
        subjectDirectionId: values.subjectDirectionId,
        subjectDirectionName: directions.find(d => d.id === values.subjectDirectionId)?.name,
        anonymousTitle: values.anonymousTitle,
        anonymousAbstract: values.anonymousAbstract,
        keywords: values.keywords,
        fileName: file.name,
        fileUrl: `/mock/${file.name}`,
        fileSize: file.size || 0,
        anonymousFileName: anonFile.name,
        anonymousFileUrl: `/mock/${anonFile.name}`,
      })

      message.success('论文提交成功，等待学院初审')
      navigate('/student/thesis')
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
        <h2 style={{ margin: 0 }}>提交论文</h2>
      </Space>

      <Alert
        message="提交须知"
        description={
          <div>
            <p>1. 请确保论文格式符合学校要求</p>
            <p>2. 匿名版论文不得出现学生姓名、导师姓名、学校名称等个人信息</p>
            <p>3. 提交后将进入学院初审阶段</p>
            <p>4. 初审通过后将由研究生院匹配外审专家</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="论文基本信息">
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            name="title"
            label="论文题目（真名）"
            rules={[{ required: true, message: '请输入论文题目' }]}
          >
            <Input placeholder="请输入论文题目" size="large" />
          </Form.Item>

          <Form.Item
            name="supervisorId"
            label="指导教师"
            rules={[{ required: true, message: '请选择指导教师' }]}
          >
            <Select placeholder="请选择指导教师" size="large" showSearch optionFilterProp="children">
              {supervisors.map(s => (
                <Option key={s.id} value={s.id}>{s.realName} - {s.title || '副教授'}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subjectDirectionId"
            label="学科方向"
            rules={[{ required: true, message: '请选择学科方向' }]}
          >
            <Select placeholder="请选择学科方向" size="large">
              {directions.map(d => (
                <Option key={d.id} value={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="anonymousTitle"
            label="匿名论文题目"
            rules={[{ required: true, message: '请输入匿名论文题目' }]}
            extra="用于外审的匿名题目，不得包含个人信息"
          >
            <Input placeholder="请输入匿名论文题目" size="large" />
          </Form.Item>

          <Form.Item
            name="anonymousAbstract"
            label="匿名摘要"
            rules={[{ required: true, message: '请输入匿名摘要' }]}
          >
            <TextArea rows={4} placeholder="请输入匿名摘要" />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
            extra="多个关键词用逗号分隔"
          >
            <Input placeholder="例如：人工智能,机器学习,深度学习" />
          </Form.Item>

          <Form.Item
            name="originalFile"
            label="论文原文（含作者信息）"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: '请上传论文原文' }]}
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
            label="匿名版论文（用于盲审）"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: '请上传匿名版论文' }]}
            extra="请确保已删除所有个人身份信息"
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
              <Button type="primary" size="large" loading={loading} onClick={handleSubmit}>
                提交送审
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default StudentThesisSubmit
