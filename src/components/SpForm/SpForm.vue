<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import type {
  SpFormActionLayout,
  SpFormActionPosition,
  SpFormCommonConfig,
  SpFormDependenciesApi,
  SpFormRootProps,
  SpFormSchema,
} from './types'
import {
  isInlineFormComponent,
  modelPropNameFor,
  omitStyleWidth,
  resolveSpFormComponent,
} from './adapter/component'
import { normalizeSchema, schemaFieldKey } from './adapter/schema'
import { getPathValue, setPathValue } from '@/utils/formPath'
import {
  collectDependencyTriggerFields,
  detectTriggerFieldChanges,
  getResolvedField,
  resolveFieldDependencies,
  runDependencyTriggers,
  snapshotTriggerFields,
} from './utils/dependencies'

const emit = defineEmits<{
  finish: [values: Record<string, unknown>]
  finishFailed: [errorInfo: unknown]
  reset: []
  'update:collapsed': [collapsed: boolean]
  collapsedChange: [collapsed: boolean]
}>()

const props = withDefaults(
  defineProps<{
    model: Record<string, unknown>
    schema?: SpFormSchema[]
    fields?: SpFormSchema[]
    commonConfig?: SpFormCommonConfig
    formProps?: SpFormRootProps
    wrapperClass?: string
    showDefaultActions?: boolean
    showCollapseButton?: boolean
    collapsed?: boolean
    collapsedRows?: number
    submitButtonOptions?: import('./types').SpFormActionButtonOptions
    resetButtonOptions?: import('./types').SpFormActionButtonOptions
    actionLayout?: SpFormActionLayout
    actionPosition?: SpFormActionPosition
    actionWrapperClass?: string
    actionButtonsReverse?: boolean
    queryMode?: boolean
    submitOnEnter?: boolean
    compact?: boolean
    scrollToFirstError?: boolean
    collapseTriggerResize?: boolean
    /** dependencies.trigger / setValues 等回调使用 */
    dependenciesApi?: SpFormDependenciesApi
  }>(),
  {
    schema: () => [],
    fields: () => [],
    commonConfig: () => ({}),
    formProps: () => ({}),
    collapsedRows: 1,
    actionLayout: 'newLine',
    actionPosition: 'right',
    actionButtonsReverse: false,
    queryMode: false,
    submitOnEnter: false,
  },
)

const innerFormRef = ref<FormInstance | null>(null)
const collapsedInternal = ref(props.collapsed ?? false)

const normalizedSchema = computed(() =>
  normalizeSchema(props.schema.length ? props.schema : props.fields),
)

const mergedFormProps = computed(() => ({
  layout: 'vertical' as const,
  ...props.formProps,
  scrollToFirstError: props.scrollToFirstError ?? props.formProps?.scrollToFirstError,
}))

const shouldScrollToFirstError = computed(
  () => props.scrollToFirstError === true || props.formProps?.scrollToFirstError === true,
)

const gridColumns = computed(() => parseGridColumns(props.wrapperClass))

const collapsedActive = computed({
  get: () => props.collapsed ?? collapsedInternal.value,
  set: (v: boolean) => {
    collapsedInternal.value = v
    emit('update:collapsed', v)
    emit('collapsedChange', v)
  },
})

const showActions = computed(() => props.showDefaultActions === true)

function fieldName(field: SpFormSchema) {
  return field.fieldName ?? field.name
}

const resolvedFieldMap = computed(() => {
  const map = new Map<string, ReturnType<typeof resolveFieldDependencies>>()
  for (const field of normalizedSchema.value) {
    map.set(
      schemaFieldKey(field),
      resolveFieldDependencies(field, props.model, props.dependenciesApi),
    )
  }
  return map
})

const dependencyTriggerFields = computed(() =>
  collectDependencyTriggerFields(normalizedSchema.value),
)

let triggerSnapshot = snapshotTriggerFields(props.model, dependencyTriggerFields.value)

watch(
  () => snapshotTriggerFields(props.model, dependencyTriggerFields.value),
  (next) => {
    const changed = detectTriggerFieldChanges(triggerSnapshot, next)
    triggerSnapshot = next
    if (changed.length > 0) {
      runDependencyTriggers(normalizedSchema.value, props.model, changed, props.dependenciesApi)
    }
  },
  { deep: true, flush: 'post' },
)

function isFieldVisible(field: SpFormSchema) {
  const resolved = getResolvedField(field, resolvedFieldMap.value)
  if (!resolved.render) return false
  if (field.ifShow !== undefined) {
    return typeof field.ifShow === 'function' ? field.ifShow(props.model) : field.ifShow
  }
  if (field.hidden !== undefined) {
    return typeof field.hidden === 'function' ? !field.hidden() : !field.hidden
  }
  return true
}

function isFieldCssHidden(field: SpFormSchema) {
  return !getResolvedField(field, resolvedFieldMap.value).show
}

function isFieldDisabled(field: SpFormSchema) {
  if (props.commonConfig?.disabled) return true
  if (getResolvedField(field, resolvedFieldMap.value).disabled) return true
  if (field.disabled === undefined) return false
  return typeof field.disabled === 'function' ? field.disabled(props.model) : field.disabled
}

function fieldRules(field: SpFormSchema): RuleObject | RuleObject[] | undefined {
  return getResolvedField(field, resolvedFieldMap.value).rules
}

function mergeComponentProps(field: SpFormSchema) {
  const resolved = getResolvedField(field, resolvedFieldMap.value)
  const componentType = String(field.component)
  const inline = isInlineFormComponent(componentType)

  let commonProps = props.commonConfig?.componentProps ?? {}
  if (inline) {
    commonProps = omitStyleWidth(commonProps)
  }

  const base = {
    ...commonProps,
    ...(field.componentProps ?? {}),
    ...resolved.componentProps,
  }
  if (isFieldDisabled(field)) {
    base.disabled = true
  }
  return base
}

function fieldModelBindings(field: SpFormSchema) {
  const name = fieldName(field)
  if (!name) return {}
  const prop = modelPropNameFor(String(field.component))
  const val = getPathValue(props.model, name)
  return {
    [prop]: val,
    [`onUpdate:${prop}`]: (v: unknown) => setPathValue(props.model, name, v),
  }
}

function checkboxLabel(field: SpFormSchema) {
  const raw = field.componentProps?.checkboxLabel
  return typeof raw === 'string' ? raw : ''
}

function isSlotField(field: SpFormSchema) {
  return String(field.component) === 'Slot' || field.component === 'slot'
}

const visibleFields = computed(() =>
  normalizedSchema.value.filter(isFieldVisible).map((field) => ({
    field,
    key: schemaFieldKey(field),
  })),
)

const displayFields = computed(() => {
  if (!props.showCollapseButton || !collapsedActive.value) {
    return visibleFields.value
  }
  const max = (props.collapsedRows ?? 1) * gridColumns.value
  return visibleFields.value.slice(0, max)
})

const actionAlignClass = computed(() => `sp-form__actions--${props.actionPosition ?? 'right'}`)

const actionLayoutClass = computed(
  () => `sp-form__actions--layout-${props.actionLayout ?? 'newLine'}`,
)

const collapseLabel = computed(() => (collapsedActive.value ? '展开' : '收起'))

const submitBtn = computed(() => ({
  content: '提交',
  show: true,
  type: 'primary' as const,
  ...props.submitButtonOptions,
}))

const resetBtn = computed(() => ({
  content: '重置',
  show: true,
  ...props.resetButtonOptions,
}))

function parseGridColumns(wrapperClass?: string): number {
  if (!wrapperClass) return 1
  if (wrapperClass.includes('sp-form-grid--3') || wrapperClass.includes('grid-cols-3')) return 3
  if (wrapperClass.includes('sp-form-grid--2') || wrapperClass.includes('grid-cols-2')) return 2
  return 1
}

function toggleCollapse() {
  collapsedActive.value = !collapsedActive.value
  if (props.collapseTriggerResize) {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }
}

function scrollToFirstErrorField() {
  if (!shouldScrollToFirstError.value) return
  const root = innerFormRef.value?.$el as HTMLElement | undefined
  const errorItem = root?.querySelector('.ant-form-item-has-error')
  errorItem?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

async function submitForm() {
  if (props.queryMode) {
    emit('finish', getValues())
    return
  }
  try {
    await innerFormRef.value?.validate()
    emit('finish', getValues())
  } catch (error) {
    emit('finishFailed', error)
    scrollToFirstErrorField()
  }
}

function onFinishFailed(error: unknown) {
  emit('finishFailed', error)
  scrollToFirstErrorField()
}

function onResetClick() {
  innerFormRef.value?.resetFields()
  emit('reset')
}

function onFormKeydown(e: KeyboardEvent) {
  if (!props.submitOnEnter || e.key !== 'Enter' || !showActions.value) return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'TEXTAREA') return
  e.preventDefault()
  void submitForm()
}

async function validate(nameList?: Parameters<FormInstance['validate']>[0]) {
  return innerFormRef.value?.validate(nameList)
}

async function validateFields(nameList?: Parameters<FormInstance['validateFields']>[0]) {
  return innerFormRef.value?.validateFields(nameList)
}

function resetFields(name?: Parameters<FormInstance['resetFields']>[0]) {
  innerFormRef.value?.resetFields(name)
  emit('reset')
}

function clearValidate(name?: Parameters<FormInstance['clearValidate']>[0]) {
  innerFormRef.value?.clearValidate(name)
}

function getValues() {
  return { ...props.model }
}

function setValues(patch: Record<string, unknown>) {
  for (const [k, v] of Object.entries(patch)) {
    setPathValue(props.model, k, v)
  }
}

defineExpose({
  validate,
  validateFields,
  resetFields,
  clearValidate,
  getValues,
  setValues,
  submitForm,
})
</script>

<template>
  <a-form
    ref="innerFormRef"
    :model="model"
    v-bind="mergedFormProps"
    :class="['sp-form', { 'sp-form--compact': compact }]"
    @finish="(v: Record<string, unknown>) => emit('finish', v)"
    @finish-failed="onFinishFailed"
    @keydown="onFormKeydown"
  >
    <div
      class="sp-form__body"
      :class="{ 'sp-form__body--with-row-end': showActions && actionLayout === 'rowEnd' }"
    >
      <div :class="['sp-form__grid', wrapperClass]">
        <template v-for="item in displayFields" :key="item.key">
          <a-form-item
            :label="item.field.label"
            :name="fieldName(item.field)"
            :rules="fieldRules(item.field)"
            v-bind="{ ...(commonConfig?.formItemProps ?? {}), ...(item.field.formItemProps ?? {}) }"
            class="sp-form__item"
            :class="{ 'sp-form__item--hidden': isFieldCssHidden(item.field) }"
          >
            <div v-if="item.field.prefix || item.field.suffix" class="sp-form__control-with-affix">
              <span v-if="item.field.prefix" class="sp-form__affix sp-form__affix--prefix">
                <component :is="item.field.prefix()" />
              </span>

              <template v-if="isSlotField(item.field)">
                <slot
                  :name="item.field.slotName ?? 'default'"
                  :field="item.field"
                  :model="model"
                  :values="model"
                />
              </template>
              <component
                v-else-if="String(item.field.component) === 'Checkbox'"
                :is="resolveSpFormComponent('Checkbox')"
                v-bind="{ ...mergeComponentProps(item.field), ...fieldModelBindings(item.field) }"
              >
                {{ checkboxLabel(item.field) }}
              </component>
              <component
                v-else
                :is="resolveSpFormComponent(String(item.field.component))"
                v-bind="{ ...mergeComponentProps(item.field), ...fieldModelBindings(item.field) }"
              />

              <span v-if="item.field.suffix" class="sp-form__affix sp-form__affix--suffix">
                <component :is="item.field.suffix()" />
              </span>
            </div>

            <template v-else>
              <template v-if="isSlotField(item.field)">
                <slot
                  :name="item.field.slotName ?? 'default'"
                  :field="item.field"
                  :model="model"
                  :values="model"
                />
              </template>
              <component
                v-else-if="String(item.field.component) === 'Checkbox'"
                :is="resolveSpFormComponent('Checkbox')"
                v-bind="{ ...mergeComponentProps(item.field), ...fieldModelBindings(item.field) }"
              >
                {{ checkboxLabel(item.field) }}
              </component>
              <component
                v-else
                :is="resolveSpFormComponent(String(item.field.component))"
                v-bind="{ ...mergeComponentProps(item.field), ...fieldModelBindings(item.field) }"
              />
            </template>

            <div v-if="item.field.help" class="sp-form__help">{{ item.field.help }}</div>
          </a-form-item>
        </template>

        <div
          v-if="showActions && actionLayout === 'rowEnd'"
          class="sp-form__actions sp-form__actions--row-end"
          :class="[actionAlignClass, actionWrapperClass]"
        >
          <div class="sp-form__action-bar">
            <a-button
              v-if="showCollapseButton"
              type="link"
              class="sp-form__collapse-btn"
              @click="toggleCollapse"
            >
              {{ collapseLabel }}
            </a-button>
            <a-space :size="8" wrap class="sp-form__action-space">
              <template v-if="actionButtonsReverse">
                <a-button
                  v-if="submitBtn.show !== false"
                  :type="submitBtn.type"
                  :disabled="submitBtn.disabled"
                  :loading="submitBtn.loading"
                  :size="submitBtn.size"
                  :class="submitBtn.class"
                  @click="submitForm"
                >
                  {{ submitBtn.content }}
                </a-button>
                <a-button
                  v-if="resetBtn.show !== false"
                  :disabled="resetBtn.disabled"
                  :loading="resetBtn.loading"
                  :size="resetBtn.size"
                  :class="resetBtn.class"
                  @click="onResetClick"
                >
                  {{ resetBtn.content }}
                </a-button>
              </template>
              <template v-else>
                <a-button
                  v-if="resetBtn.show !== false"
                  :disabled="resetBtn.disabled"
                  :loading="resetBtn.loading"
                  :size="resetBtn.size"
                  :class="resetBtn.class"
                  @click="onResetClick"
                >
                  {{ resetBtn.content }}
                </a-button>
                <a-button
                  v-if="submitBtn.show !== false"
                  :type="submitBtn.type"
                  :disabled="submitBtn.disabled"
                  :loading="submitBtn.loading"
                  :size="submitBtn.size"
                  :class="submitBtn.class"
                  @click="submitForm"
                >
                  {{ submitBtn.content }}
                </a-button>
              </template>
            </a-space>
          </div>
        </div>
      </div>

      <div
        v-if="showActions && actionLayout !== 'rowEnd'"
        class="sp-form__actions"
        :class="[actionAlignClass, actionLayoutClass, actionWrapperClass]"
      >
        <div class="sp-form__action-bar">
          <a-button
            v-if="showCollapseButton"
            type="link"
            class="sp-form__collapse-btn"
            @click="toggleCollapse"
          >
            {{ collapseLabel }}
          </a-button>
          <a-space :size="8" wrap class="sp-form__action-space">
            <template v-if="actionButtonsReverse">
              <a-button
                v-if="submitBtn.show !== false"
                :type="submitBtn.type"
                :disabled="submitBtn.disabled"
                :loading="submitBtn.loading"
                :size="submitBtn.size"
                :class="submitBtn.class"
                @click="submitForm"
              >
                {{ submitBtn.content }}
              </a-button>
              <a-button
                v-if="resetBtn.show !== false"
                :disabled="resetBtn.disabled"
                :loading="resetBtn.loading"
                :size="resetBtn.size"
                :class="resetBtn.class"
                @click="onResetClick"
              >
                {{ resetBtn.content }}
              </a-button>
            </template>
            <template v-else>
              <a-button
                v-if="resetBtn.show !== false"
                :disabled="resetBtn.disabled"
                :loading="resetBtn.loading"
                :size="resetBtn.size"
                :class="resetBtn.class"
                @click="onResetClick"
              >
                {{ resetBtn.content }}
              </a-button>
              <a-button
                v-if="submitBtn.show !== false"
                :type="submitBtn.type"
                :disabled="submitBtn.disabled"
                :loading="submitBtn.loading"
                :size="submitBtn.size"
                :class="submitBtn.class"
                @click="submitForm"
              >
                {{ submitBtn.content }}
              </a-button>
            </template>
          </a-space>
        </div>
      </div>
    </div>
    <slot />
  </a-form>
</template>

