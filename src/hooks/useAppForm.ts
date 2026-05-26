import { reactive, ref, shallowRef, toRaw } from 'vue'
import type { SpFormExpose, SpFormSchema, SpFormRootProps } from '@/components/SpForm/types'
import { normalizeSchema } from '@/components/SpForm/adapter/schema'
import { getPathValue, setPathValue } from '@/utils/formPath'
import { modelPropNameFor } from '@/components/SpForm/adapter/component'

export interface UseAppFormOptions {
  /** @deprecated 使用 schema */
  fields?: SpFormSchema[]
  schema?: SpFormSchema[]
  initialValues?: Record<string, unknown>
  formProps?: SpFormRootProps
}

function defaultValueForComponent(component: string): unknown {
  const prop = modelPropNameFor(component)
  if (prop === 'checked') return false
  if (String(component) === 'CheckboxGroup') return []
  return ''
}

function initModelFromSchema(
  model: Record<string, unknown>,
  schema: SpFormSchema[],
  initial: Record<string, unknown>,
) {
  for (const k of Object.keys(model)) {
    delete model[k]
  }
  for (const f of schema) {
    const name = f.fieldName ?? f.name
    if (!name) continue
    const fromInitial = getPathValue(initial, name)
    const fromDefaultProp = f.componentProps?.defaultValue ?? f.defaultValue
    const fallback = defaultValueForComponent(String(f.component))
    const raw =
      fromInitial !== undefined && fromInitial !== null
        ? fromInitial
        : fromDefaultProp !== undefined
          ? fromDefaultProp
          : fallback
    const v = Array.isArray(raw)
      ? [...raw]
      : raw !== null && typeof raw === 'object'
        ? { ...(raw as object) }
        : raw
    setPathValue(model, name, v)
  }
}

/**
 * 配置化表单（兼容旧用法：model + fields + SpForm）
 * 新推荐：`useSpForm` 返回 `[Form, formApi]`，对齐 Vben Form
 */
export function useAppForm(options: UseAppFormOptions) {
  const schemaRef = shallowRef(normalizeSchema(options.schema ?? options.fields ?? []))
  const initialRef = shallowRef(options.initialValues ?? {})
  const formPropsRef = shallowRef(options.formProps ?? {})
  const formRef = ref<SpFormExpose | null>(null)
  const model = reactive<Record<string, unknown>>({})

  function rebuild() {
    initModelFromSchema(model, schemaRef.value, initialRef.value)
  }

  rebuild()

  function setFieldList(next: SpFormSchema[]) {
    schemaRef.value = normalizeSchema(next)
    rebuild()
  }

  /** @deprecated 使用 setFieldList / setSchema */
  const setSchema = setFieldList

  function setInitialValues(next: Record<string, unknown>) {
    initialRef.value = next
    rebuild()
  }

  function setFormProps(next: SpFormRootProps) {
    formPropsRef.value = next
  }

  async function validate() {
    return await formRef.value?.validate()
  }

  async function validateFields(...args: Parameters<SpFormExpose['validateFields']>) {
    return await formRef.value?.validateFields(...args)
  }

  function resetFields(...args: Parameters<SpFormExpose['resetFields']>) {
    formRef.value?.resetFields(...args)
    rebuild()
  }

  function clearValidate(...args: Parameters<SpFormExpose['clearValidate']>) {
    formRef.value?.clearValidate(...args)
  }

  function setFieldsValue(patch: Record<string, unknown>) {
    if (formRef.value?.setValues) {
      formRef.value.setValues(patch)
      return
    }
    for (const [k, v] of Object.entries(patch)) {
      setPathValue(model, k, v)
    }
  }

  function getFieldsValue() {
    return formRef.value?.getValues() ?? { ...toRaw(model) }
  }

  return {
    formRef,
    model,
    /** 传给 SpForm 的 schema（与 fields 相同，兼容旧 prop 名） */
    fields: schemaRef,
    schema: schemaRef,
    formProps: formPropsRef,
    validate,
    validateFields,
    resetFields,
    clearValidate,
    setFieldsValue,
    getFieldsValue,
    setFieldList,
    setSchema,
    setInitialValues,
    setFormProps,
    rebuild,
  }
}
