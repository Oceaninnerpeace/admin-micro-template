<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useSpForm } from '@/components/SpForm'
import { dependenciesDemoSchema, formDemoSchema, queryFormDemoSchema } from './types'

const jsonPreview = ref('')
const queryPreview = ref('')
const dependenciesPreview = ref('')

const [DemoForm, formApi] = useSpForm({
  schema: formDemoSchema,
  layout: 'vertical',
  commonConfig: {
    componentProps: { style: { width: '100%' } },
  },
  initialValues: {
    name: '',
    code: '',
    type: undefined,
    enabled: true,
    remark: '',
  },
  handleSubmit: (values) => {
    message.success('提交成功')
    jsonPreview.value = JSON.stringify(values, null, 2)
  },
})

const [QueryForm] = useSpForm({
  schema: queryFormDemoSchema,
  layout: 'horizontal',
  wrapperClass: 'sp-form-grid--2',
  showCollapseButton: true,
  collapsed: true,
  collapsedRows: 1,
  queryMode: true,
  compact: true,
  collapseTriggerResize: true,
  fieldMappingTime: [['timeRange', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  submitButtonOptions: { content: '查询' },
  resetButtonOptions: { content: '重置' },
  actionLayout: 'newLine',
  actionPosition: 'right',
  commonConfig: {
    componentProps: { style: { width: '100%' } },
  },
  formProps: {
    labelCol: { style: { width: '72px' } },
    wrapperCol: { style: { flex: 1 } },
  },
  initialValues: {
    keyword: '',
    status: undefined,
    type: undefined,
    code: '',
    remark: '',
    timeRange: [],
  },
  handleValuesChange: (values, fieldsChanged) => {
    console.debug('[QueryForm] changed:', fieldsChanged, values)
  },
  handleSubmit: (values) => {
    queryPreview.value = JSON.stringify(values, null, 2)
    message.success('查询（未校验）')
  },
  handleReset: () => {
    queryPreview.value = ''
  },
})

function onSubmit() {
  void formApi
    .validate()
    .then(() => {
      jsonPreview.value = JSON.stringify(formApi.getValues(), null, 2)
      message.success('校验通过')
    })
    .catch(() => {
      jsonPreview.value = ''
    })
}

function onReset() {
  formApi.resetForm()
  jsonPreview.value = ''
}

const [DependenciesForm, depFormApi] = useSpForm({
  schema: dependenciesDemoSchema,
  layout: 'vertical',
  wrapperClass: 'sp-form-grid--2',
  commonConfig: {
    componentProps: { style: { width: '100%' } },
  },
  initialValues: {
    showField1Switch: true,
    field1: '',
    showField2Switch: true,
    field2: '',
    disableField3Switch: false,
    field3: '',
    sourceType: undefined,
    subType: undefined,
  },
})

function previewDependencies() {
  dependenciesPreview.value = JSON.stringify(depFormApi.getValues(), null, 2)
}
</script>

<template>
  <div class="form-demo-page">
    <section class="form-demo-section">
      <h2 class="form-demo-title">查询表单（折叠 + 内置按钮，对齐 Vben）</h2>
      <QueryForm />
      <pre v-if="queryPreview" class="form-demo-json">{{ queryPreview }}</pre>
    </section>

    <section class="form-demo-section">
      <h2 class="form-demo-title">配置化表单（useSpForm，对齐 Vben Form）</h2>
      <DemoForm />
      <div class="form-demo-actions">
        <a-space>
          <a-button type="primary" @click="onSubmit">校验并预览</a-button>
          <a-button @click="onReset">重置</a-button>
        </a-space>
      </div>
      <pre v-if="jsonPreview" class="form-demo-json">{{ jsonPreview }}</pre>
    </section>

    <section class="form-demo-section">
      <h2 class="form-demo-title">字段联动（dependencies）</h2>
      <DependenciesForm />
      <div class="form-demo-actions">
        <a-button type="primary" @click="previewDependencies">预览当前值</a-button>
      </div>
      <pre v-if="dependenciesPreview" class="form-demo-json">{{ dependenciesPreview }}</pre>
    </section>
  </div>
</template>

