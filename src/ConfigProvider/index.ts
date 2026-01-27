// 导出类型
export type {
  RequestConfig,
  RequestParam,
  AxiosResponse,
  Request,
  EzAntdConfig,
  RoutePermissionMap,
  FeaturePointPermissionMap,
} from './types';

// 导出默认配置
export { defaultConfig } from './defaults';

// 导出组件、Context 和 Hook
export {
  ConfigProvider,
  ConfigContext,
  useConfig,
  useUpdateConfig,
  type UpdateConfigFunction
} from './ConfigProvider';

// 导出工具函数
export {
  getRoutePermission,
  getFeaturePointPermission,
  getFirstAccessibleRoute,
  hasFeaturePointPermission,
  hasRoutePermission
} from './utils';
