/** 记住密码相关 localStorage 键 */
export const LS_REMEMBER = 'sp_login_remember'
export const LS_USERNAME = 'sp_login_username'
export const LS_PASSWORD = 'sp_login_password'

/** 登录表单模型 */
export interface LoginFormState {
  username: string
  password: string
  captcha: string
  remember: boolean
}

/** SpForm + useAppForm 字段配置（用户名 / 密码 / 验证码为插槽，便于前缀图标与画布） */
export const loginFormFields = [
  {
    name: 'username',
    label: '',
    component: 'slot',
    slotName: 'login-username',
    rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  },
  {
    name: 'password',
    label: '',
    component: 'slot',
    slotName: 'login-password',
    rules: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码至少 6 位', trigger: 'blur' },
    ],
  },
  {
    name: 'captcha',
    label: '',
    component: 'slot',
    slotName: 'login-captcha',
    rules: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    formItemProps: { class: 'login-captcha-item' },
  },
  {
    name: 'remember',
    label: '',
    component: 'checkbox',
    componentProps: { checkboxLabel: '记住密码' },
    formItemProps: { class: 'login-remember-wrap' },
  },
]
