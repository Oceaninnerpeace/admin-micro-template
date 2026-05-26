import type { SpFormSchema } from '@/components/SpForm'

/** Vben 风格 schema（fieldName + PascalCase component） */
export const formDemoSchema: SpFormSchema[] = [
  {
    fieldName: 'name',
    label: '表单名称',
    component: 'Input',
    rules: [{ required: true, message: '请输入表单名称', trigger: 'blur' }],
    componentProps: { allowClear: true, placeholder: '请输入' },
  },
  {
    fieldName: 'code',
    label: '编码',
    component: 'Input',
    rules: [{ required: true, message: '请输入编码', trigger: 'blur' }],
    componentProps: { placeholder: '唯一编码' },
  },
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    rules: [{ required: true, message: '请选择类型', trigger: 'change' }],
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '台账', value: 'ledger' },
        { label: '记录', value: 'record' },
        { label: '处置单', value: 'ticket' },
      ],
    },
  },
  {
    fieldName: 'enabled',
    label: '启用',
    component: 'Switch',
    componentProps: { class: 'sp-form-switch' },
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'Textarea',
    componentProps: { rows: 3, placeholder: '选填' },
  },
]

/** @deprecated 使用 formDemoSchema */
export const formDemoFields = formDemoSchema

/** 查询表单示例 schema（多字段 + 无必填，用于折叠演示） */
export const queryFormDemoSchema: SpFormSchema[] = [
  {
    fieldName: 'keyword',
    label: '关键词',
    component: 'Input',
    componentProps: { allowClear: true, placeholder: '名称 / 编码' },
  },
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '全部',
      options: [
        { label: '启用', value: 'on' },
        { label: '停用', value: 'off' },
      ],
    },
  },
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '全部',
      options: [
        { label: '台账', value: 'ledger' },
        { label: '记录', value: 'record' },
      ],
    },
  },
  {
    fieldName: 'code',
    label: '编码',
    component: 'Input',
    componentProps: { allowClear: true, placeholder: '精确匹配' },
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'Input',
    componentProps: { allowClear: true, placeholder: '模糊匹配' },
  },
  {
    fieldName: 'timeRange',
    label: '时间范围',
    component: 'RangePicker',
    componentProps: { style: { width: '100%' } },
  },
]

/** 字段 dependencies 联动演示 */
export const dependenciesDemoSchema: SpFormSchema[] = [
  {
    fieldName: 'showField1Switch',
    label: '显示字段1（if 销毁）',
    component: 'Switch',
    defaultValue: true,
  },
  {
    fieldName: 'field1',
    label: '字段1',
    component: 'Input',
    componentProps: { placeholder: '关闭左侧开关后本项从 DOM 移除' },
    dependencies: {
      if: (values) => !!values.showField1Switch,
      triggerFields: ['showField1Switch'],
    },
  },
  {
    fieldName: 'showField2Switch',
    label: '显示字段2（show 隐藏）',
    component: 'Switch',
    defaultValue: true,
  },
  {
    fieldName: 'field2',
    label: '字段2',
    component: 'Input',
    dependencies: {
      show: (values) => !!values.showField2Switch,
      triggerFields: ['showField2Switch'],
    },
  },
  {
    fieldName: 'disableField3Switch',
    label: '禁用字段3',
    component: 'Switch',
    defaultValue: false,
  },
  {
    fieldName: 'field3',
    label: '字段3',
    component: 'Input',
    dependencies: {
      disabled: (values) => !!values.disableField3Switch,
      triggerFields: ['disableField3Switch'],
    },
  },
  {
    fieldName: 'sourceType',
    label: '类型',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '请选择',
      options: [
        { label: '类型 A', value: 'A' },
        { label: '类型 B', value: 'B' },
      ],
    },
  },
  {
    fieldName: 'subType',
    label: '子类型（动态 options）',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '随类型变化',
      options: [],
    },
    dependencies: {
      componentProps(values) {
        if (values.sourceType === 'A') {
          return {
            options: [
              { label: 'A-1', value: 'a1' },
              { label: 'A-2', value: 'a2' },
            ],
          }
        }
        if (values.sourceType === 'B') {
          return { options: [{ label: 'B-1', value: 'b1' }] }
        }
        return { options: [] }
      },
      triggerFields: ['sourceType'],
      trigger(_values, api) {
        api?.setFieldValue('subType', undefined)
      },
    },
  },
]
