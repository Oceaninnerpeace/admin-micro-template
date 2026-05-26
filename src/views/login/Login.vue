<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { fetchLoginCaptcha, login, toImageSrc } from '@/api/auth'
import { setToken } from '@/utils/auth'
import { theme as antdTheme } from 'ant-design-vue'
import { SpForm } from '@/components/SpForm'
import { useForm } from '@/hooks/useForm'
import { LS_PASSWORD, LS_REMEMBER, LS_USERNAME, loginFormFields } from './types'

/** 关闭表单校验提示的动效时长（ErrorList 使用 collapseMotion，依赖 motionDuration* token） */
const loginFormTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    motionDurationFast: '0s',
    motionDurationMid: '0s',
    motionDurationSlow: '0s',
  },
}

const route = useRoute()
const router = useRouter()
const store = useStore()

const { formRef, model, fields, formProps, validate, setFieldsValue, getFieldsValue } = useForm({
  fields: loginFormFields,
  initialValues: {
    username: '',
    password: '',
    captcha: '',
    remember: true,
  },
  formProps: {
    layout: 'vertical',
    scrollToFirstError: false,
  },
})

/** 后端下发的验证码 key，随 `/auth/login` 提交 */
const captchaKey = ref('')
const captchaImgSrc = ref('')
const loading = ref(false)

const redirectAfterLogin = computed(() => {
  const q = route.query.redirect
  if (
    typeof q === 'string' &&
    q.startsWith('/') &&
    !q.startsWith('//') &&
    !q.startsWith('/login')
  ) {
    return q
  }
  return '/dashboard'
})

async function refreshCaptcha() {
  try {
    const cap = await fetchLoginCaptcha()
    captchaKey.value = cap.captcha_key
    captchaImgSrc.value = toImageSrc(cap.captcha_image)
    setFieldsValue({ captcha: '' })
  } catch {
    captchaKey.value = ''
    captchaImgSrc.value = ''
    message.error('验证码加载失败，请点击重试')
  }
}

function loadRemembered() {
  try {
    if (localStorage.getItem(LS_REMEMBER) === '1') {
      setFieldsValue({
        remember: true,
        username: localStorage.getItem(LS_USERNAME) ?? '',
        password: localStorage.getItem(LS_PASSWORD) ?? '',
      })
    } else {
      setFieldsValue({ remember: false })
    }
  } catch {
    /* ignore */
  }
}

function persistRemember(values: Record<string, unknown>) {
  try {
    const remember = Boolean(values.remember)
    const username = String(values.username ?? '')
    const password = String(values.password ?? '')
    if (remember) {
      localStorage.setItem(LS_REMEMBER, '1')
      localStorage.setItem(LS_USERNAME, username)
      localStorage.setItem(LS_PASSWORD, password)
    } else {
      localStorage.removeItem(LS_REMEMBER)
      localStorage.removeItem(LS_USERNAME)
      localStorage.removeItem(LS_PASSWORD)
    }
  } catch {
    /* ignore */
  }
}

async function doLogin(values: Record<string, unknown>) {
  const username = String(values.username ?? '')
  const password = String(values.password ?? '')
  const captcha = String(values.captcha ?? '')
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

  if (!useMock && !captchaKey.value) {
    message.error('验证码未就绪，请点击右侧图片刷新')
    return
  }

  loading.value = true
  try {
    const data = await login({
      username,
      password,
      captcha_code: captcha,
      captcha_key: captchaKey.value,
    })
    setToken(data.access_token)
    await store.dispatch('fetchCurrentUser')
    persistRemember(values)
    message.success('登录成功')
    await router.replace(redirectAfterLogin.value)
  } catch {
    void refreshCaptcha()
    /* 错误提示由 request 拦截器处理 */
  } finally {
    loading.value = false
  }
}

function onFormFinish(values: Record<string, unknown>) {
  void doLogin(values)
}

async function onCaptchaEnter() {
  try {
    await validate()
    await doLogin(getFieldsValue())
  } catch {
    /* 校验失败由表单项展示 */
  }
}

onMounted(() => {
  loadRemembered()
  if (!String(model.username ?? '')) {
    setFieldsValue({ username: 'louhanlin' })
  }
  void nextTick(() => refreshCaptcha())
})
</script>

<template>
  <div class="login-page">
    <div class="login-hero" aria-hidden="true" />

    <div class="login-panel">
      <div class="login-panel-inner">
        <div class="login-brand">
          <div class="login-brand-mark" aria-hidden="true">
            <span class="login-brand-lines" />
          </div>
          <div class="login-brand-names">
            <span class="login-brand-cn">润建股份</span>
            <span class="login-brand-en">RJGF</span>
          </div>
        </div>
        <h1 class="login-title">智慧电站</h1>

        <a-config-provider :theme="loginFormTheme">
          <SpForm
            ref="formRef"
            class="login-form"
            :model="model"
            :fields="fields"
            :form-props="formProps"
            @finish="onFormFinish"
          >
            <template #login-username="{ model: m }">
              <a-input
                v-model:value="m.username"
                size="large"
                placeholder="请输入用户名"
                class="login-input"
                autocomplete="username"
              >
                <template #prefix>
                  <UserOutlined class="login-input-icon" />
                </template>
              </a-input>
            </template>

            <template #login-password="{ model: m }">
              <a-input-password
                v-model:value="m.password"
                size="large"
                placeholder="请输入密码"
                class="login-input"
                autocomplete="current-password"
                visibility-toggle
              >
                <template #prefix>
                  <LockOutlined class="login-input-icon" />
                </template>
              </a-input-password>
            </template>

            <template #login-captcha="{ model: m }">
              <div class="login-captcha-row">
                <a-input
                  v-model:value="m.captcha"
                  size="large"
                  placeholder="请输入验证码"
                  class="login-input login-captcha-input"
                  autocomplete="off"
                  @press-enter="onCaptchaEnter"
                >
                  <template #prefix>
                    <SafetyCertificateOutlined class="login-input-icon" />
                  </template>
                </a-input>
                <button
                  type="button"
                  class="login-captcha-img"
                  title="点击刷新验证码"
                  aria-label="刷新验证码"
                  @click="refreshCaptcha"
                >
                  <img
                    v-if="captchaImgSrc"
                    :src="captchaImgSrc"
                    alt="验证码"
                    width="112"
                    height="40"
                    decoding="async"
                  />
                  <span v-else class="login-captcha-placeholder">加载中</span>
                </button>
              </div>
            </template>

            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="login-btn"
            >
              登录
            </a-button>
          </SpForm>
        </a-config-provider>
      </div>
    </div>
  </div>
</template>

