import { Form, Input, Button, Select, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

const { Option } = Select

const roleOptions = [
  { value: 'graduate', label: '研究生院管理员', username: 'graduate' },
  { value: 'secretary', label: '学院秘书', username: 'secretary' },
  { value: 'supervisor', label: '导师', username: 'supervisor' },
  { value: 'student', label: '学生', username: 'student' },
  { value: 'expert', label: '外审专家', username: 'expert1' },
]

function Login() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleRoleChange = (value) => {
    const role = roleOptions.find(r => r.value === value)
    if (role) {
      form.setFieldsValue({ username: role.username, password: '123456' })
    }
  }

  const handleLogin = async (values) => {
    try {
      const result = await login({ username: values.username, password: values.password })
      localStorage.setItem('token', result.token)
      localStorage.setItem('userInfo', JSON.stringify(result))
      message.success('登录成功')

      switch (result.role) {
        case 'STUDENT': navigate('/student'); break
        case 'SUPERVISOR': navigate('/supervisor'); break
        case 'COLLEGE_SECRETARY': navigate('/secretary'); break
        case 'GRADUATE_SCHOOL': navigate('/graduate'); break
        case 'EXTERNAL_REVIEWER': navigate('/expert'); break
        default: navigate('/')
      }
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">高校论文盲审送审平台</h2>
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          size="large"
          initialValues={{ username: 'student', password: '123456' }}
        >
          <Form.Item name="role">
            <Select
              placeholder="选择角色快速登录"
              onChange={handleRoleChange}
              allowClear
            >
              {roleOptions.map(role => (
                <Option key={role.value} value={role.value}>
                  {role.label}（{role.username}）
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登 录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
          默认密码：123456
        </div>
      </div>
    </div>
  )
}

export default Login
