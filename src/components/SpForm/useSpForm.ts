import { defineComponent, h, onBeforeUnmount, reactive, ref, shallowRef, toRaw, watch } from 'vue'
import SpForm from './SpForm.vue'
import { normalizeSchema } from './adapter/schema'
import type {
  SpFormApi,
  SpFormDependenciesApi,
  SpFormExpose,
  SpFormSchema,
  SpFormState,
  UseSpFormOptions,
} from './types'
import { getPathValue, setPathValue } from '@/utils/formPath'
import { modelPropNameFor } from './adapter/component'
import { debounce } from './utils/debounce'
import {
  detectChangedSchemaFields,
  filterValuesBySchema,
  mergeSchemaByField,
  processFormValues,
} from './utils/formValues'

function defaultValueForComponent(component: string): unknown {
  const type = component
  if (type === 'Switch' || type === 'Checkbox') return false
  if (type === 'CheckboxGroup') return []
  if (type === 'RangePicker') return []
  return undefined
}

function initModelFromSchema(
  model: Record<string, unknown>,
  schema: SpFormSchema[],
  initial: Record<string, unknown>,
) {
  for (const key of Object.keys(model)) {
    delete model[key]
  }
  for (const field of schema) {
    const name = field.fieldName ?? field.name
    if (!name) continue
    const fromInitial = getPathValue(initial, name)
    const fromDefault = field.defaultValue ?? field.componentProps?.defaultValue
    const fallback = defaultValueForComponent(String(field.component))
    const raw =
      fromInitial !== undefined && fromInitial !== null
        ? fromInitial
        : fromDefault !== undefined
          ? fromDefault
          : fallback
    const v = Array.isArray(raw)
      ? [...raw]
      : raw !== null && typeof raw === 'object'
        ? { ...(raw as object) }
        : raw
    setPathValue(model, name, v)
  }
}

function resolveQueryMode(options: UseSpFormOptions): boolean {
  if (options.queryMode !== undefined) return options.queryMode
  return options.showCollapseButton === true
}

function resolveShowDefaultActions(options: UseSpFormOptions): boolean {
  if (options.showDefaultActions !== undefined) return options.showDefaultActions
  return !!options.handleSubmit
}

/**
 * 参照 Vben `useVbenForm`：返回 `[FormComponent, formApi]`
 */
export function useSpForm<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseSpFormOptions<T>,
) {
  const rawSchema = options.schema ?? options.fields ?? []
  const schemaRef = shallowRef(normalizeSchema(rawSchema))
  const initialRef = shallowRef<Record<string, unknown>>(options.initialValues ?? {})
  const commonConfigRef = shallowRef(options.commonConfig ?? {})
  const formPropsRef = shallowRef({
    layout: options.layout ?? 'vertical',
    scrollToFirstError: options.scrollToFirstError,
    ...options.formProps,
  })

  const state = reactive({
    wrapperClass: options.wrapperClass,
    showDefaultActions: resolveShowDefaultActions(options),
    showCollapseButton: options.showCollapseButton ?? false,
    collapsed: options.collapsed ?? false,
    collapsedRows: options.collapsedRows ?? 1,
    submitButtonOptions: options.submitButtonOptions,
    resetButtonOptions: options.resetButtonOptions,
    actionLayout: options.actionLayout ?? 'newLine',
    actionPosition: options.actionPosition ?? 'right',
    actionWrapperClass: options.actionWrapperClass,
    actionButtonsReverse: options.actionButtonsReverse ?? false,
    queryMode: resolveQueryMode(options),
    submitOnEnter: options.submitOnEnter ?? false,
    submitOnChange: options.submitOnChange ?? false,
    submitOnChangeDebounceMs: options.submitOnChangeDebounceMs ?? 300,
    collapseTriggerResize: options.collapseTriggerResize ?? false,
    compact: options.compact ?? false,
    scrollToFirstError:
      options.scrollToFirstError ?? options.formProps?.scrollToFirstError ?? false,
  })

  const fieldMappingTime = options.fieldMappingTime

  const formRef = ref<SpFormExpose | null>(null)
  const model = reactive<Record<string, unknown>>({})

  function formatValues(source: Record<string, unknown> = model) {
    return processFormValues(schemaRef.value, source, { fieldMappingTime }) as T
  }

  function rebuild() {
    initModelFromSchema(model, schemaRef.value, initialRef.value)
  }

  rebuild()

  const dependenciesApi: SpFormDependenciesApi = {
    getValues: () => formatValues(),
    setValues(patch, filterFields = true) {
      const data = filterFields ? filterValuesBySchema(patch, schemaRef.value) : patch
      for (const [k, v] of Object.entries(data)) {
        setPathValue(model, k, v)
      }
    },
    setFieldValue(field, value) {
      setPathValue(model, field, value)
    },
  }

  async function runSubmit(values: Record<string, unknown>) {
    const formatted = processFormValues(schemaRef.value, values, { fieldMappingTime }) as T
    await options.handleSubmit?.(formatted)
  }

  async function submitForm() {
    const exposed = formRef.value as SpFormExpose & { submitForm?: () => Promise<void> }
    if (exposed?.submitForm) {
      await exposed.submitForm()
      return
    }
    if (state.queryMode) {
      await runSubmit({ ...toRaw(model) })
      return
    }
    await formRef.value?.validate()
    await runSubmit({ ...toRaw(model) })
  }

  const debouncedSubmit = debounce(() => {
    void submitForm()
  }, state.submitOnChangeDebounceMs)

  if (options.handleValuesChange || options.submitOnChange) {
    watch(
      () => ({ ...toRaw(model) }),
      (next, prev) => {
        if (!prev) return
        const fieldsChanged = detectChangedSchemaFields(schemaRef.value, prev, next)
        if (fieldsChanged.length === 0) return
        options.handleValuesChange?.(formatValues(next), fieldsChanged)
        if (state.submitOnChange) {
          debouncedSubmit()
        }
      },
      { deep: true, flush: 'post' },
    )
  }

  onBeforeUnmount(() => {
    debouncedSubmit.cancel()
  })

  const Form = defineComponent({
    name: 'SpFormWrapper',
    setup(_, { slots }) {
      return () =>
        h(
          SpForm,
          {
            ref: formRef,
            model,
            schema: schemaRef.value,
            commonConfig: commonConfigRef.value,
            formProps: formPropsRef.value,
            wrapperClass: state.wrapperClass,
            showDefaultActions: state.showDefaultActions,
            showCollapseButton: state.showCollapseButton,
            collapsed: state.collapsed,
            collapsedRows: state.collapsedRows,
            submitButtonOptions: state.submitButtonOptions,
            resetButtonOptions: state.resetButtonOptions,
            actionLayout: state.actionLayout,
            actionPosition: state.actionPosition,
            actionWrapperClass: state.actionWrapperClass,
            actionButtonsReverse: state.actionButtonsReverse,
            queryMode: state.queryMode,
            submitOnEnter: state.submitOnEnter,
            compact: state.compact,
            scrollToFirstError: state.scrollToFirstError,
            collapseTriggerResize: state.collapseTriggerResize,
            dependenciesApi,
            'onUpdate:collapsed': (v: boolean) => {
              state.collapsed = v
            },
            onCollapsedChange: (v: boolean) => {
              options.handleCollapsedChange?.(v)
            },
            onFinish: (values: Record<string, unknown>) => {
              void runSubmit(values)
            },
            onReset: () => {
              rebuild()
              void options.handleReset?.(formatValues())
            },
          },
          slots,
        )
    },
  })

  const formApi: SpFormApi = {
    formRef,
    model,
    schema: schemaRef,
    setSchema(next) {
      schemaRef.value = normalizeSchema(next)
      rebuild()
    },
    updateSchema(partial) {
      schemaRef.value = normalizeSchema(mergeSchemaByField(schemaRef.value, partial))
      rebuild()
    },
    async validate(nameList) {
      return await formRef.value?.validate(nameList)
    },
    async validateFields(nameList) {
      return await formRef.value?.validateFields(nameList)
    },
    resetFields(name) {
      formRef.value?.resetFields(name)
      rebuild()
    },
    clearValidate(name) {
      formRef.value?.clearValidate(name)
    },
    getValues() {
      return formatValues()
    },
    setValues(patch, filterFields = true) {
      const data = filterFields ? filterValuesBySchema(patch, schemaRef.value) : patch
      for (const [k, v] of Object.entries(data)) {
        setPathValue(model, k, v)
      }
    },
    resetForm() {
      formRef.value?.resetFields()
      rebuild()
      void options.handleReset?.(formatValues())
    },
    submit: submitForm,
    setState(patch) {
      const next = typeof patch === 'function' ? patch(formApi.getState()) : patch
      if (next.schema) {
        schemaRef.value = normalizeSchema(next.schema)
        delete (next as SpFormState).schema
        rebuild()
      }
      if (next.commonConfig) {
        commonConfigRef.value = next.commonConfig
        delete (next as SpFormState).commonConfig
      }
      if (next.formProps || next.layout || next.scrollToFirstError !== undefined) {
        formPropsRef.value = {
          ...formPropsRef.value,
          ...(next.formProps ?? {}),
          ...(next.layout ? { layout: next.layout } : {}),
          ...(next.scrollToFirstError !== undefined
            ? { scrollToFirstError: next.scrollToFirstError }
            : {}),
        }
        delete (next as SpFormState).formProps
        delete (next as SpFormState).layout
      }
      Object.assign(state, next)
    },
    getState() {
      return {
        schema: schemaRef.value,
        commonConfig: commonConfigRef.value,
        formProps: formPropsRef.value,
        layout: formPropsRef.value.layout,
        wrapperClass: state.wrapperClass,
        showDefaultActions: state.showDefaultActions,
        showCollapseButton: state.showCollapseButton,
        collapsed: state.collapsed,
        collapsedRows: state.collapsedRows,
        submitButtonOptions: state.submitButtonOptions,
        resetButtonOptions: state.resetButtonOptions,
        actionLayout: state.actionLayout,
        actionPosition: state.actionPosition,
        actionWrapperClass: state.actionWrapperClass,
        actionButtonsReverse: state.actionButtonsReverse,
        queryMode: state.queryMode,
        submitOnEnter: state.submitOnEnter,
        submitOnChange: state.submitOnChange,
        submitOnChangeDebounceMs: state.submitOnChangeDebounceMs,
        collapseTriggerResize: state.collapseTriggerResize,
        compact: state.compact,
        scrollToFirstError: state.scrollToFirstError,
      }
    },
  }

  return [Form, formApi] as const
}

export { modelPropNameFor }
