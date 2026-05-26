/**
 * 公共微前端基座 mount props 类型（与 public-base-fe/src/micro/portal-bridge.ts 对齐）
 */
export interface PortalGlobalActions {
  setGlobalState: (state: Record<string, unknown>) => boolean
  onGlobalStateChange: (
    callback: (state: Record<string, unknown>, prev: Record<string, unknown>) => void,
    fireImmediately?: boolean,
  ) => void
  offGlobalStateChange?: () => void
}

export interface PortalBridge {
  poweredByPortal: true
  goPortal: () => void
  switchApp: (appId: string) => void
  getHostPath: () => string
  globalActions: PortalGlobalActions
}

export type QiankunMountProps = {
  container?: HTMLElement
  poweredByPortal?: boolean
  portal?: PortalBridge
  globalActions?: PortalGlobalActions
  embed?: boolean
}

let portalBridge: PortalBridge | null = null

/** 在 mount 时保存基座注入的 portal 对象 */
export function bindPortalHost(props: QiankunMountProps) {
  portalBridge = props.portal ?? null
}

export function getPortalHost(): PortalBridge | null {
  return portalBridge
}

export function clearPortalHost() {
  portalBridge = null
}
