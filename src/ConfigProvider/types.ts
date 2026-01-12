/**
 * HTTP 请求配置接口
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: {
    [name: string]: string;
  };
  /** 其他配置项 */
  [key: string]: any;
}

/**
 * 请求参数接口
 */
export interface RequestParam {
  [name: string]: any;
}

/**
 * Axios 响应接口
 * 模拟 Axios 的响应结构
 */
export interface AxiosResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** HTTP 状态码 */
  status: number;
  /** HTTP 状态文本 */
  statusText: string;
  /** 原始请求对象 */
  request?: any;
  /** 其他属性 */
  [key: string]: any
}

/**
 * 请求方法接口
 * 定义基本的 HTTP 请求方法
 */
export interface Request {
  /**
   * GET 请求
   * @param url 请求 URL
   * @param params 查询参数
   * @param config 请求配置
   * @returns Promise 响应
   */
  getRequest: (
    url: string,
    params?: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * PUT 请求
   * @param url 请求 URL
   * @param data 请求体数据
   * @param config 请求配置
   * @returns Promise 响应
   */
  putRequest: (
    url: string,
    data: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * DELETE 请求
   * @param url 请求 URL
   * @param params 查询参数
   * @param config 请求配置
   * @returns Promise 响应
   */
  deleteRequest: (
    url: string,
    params?: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * POST 请求
   * @param url 请求 URL
   * @param data 请求体数据
   * @param config 请求配置
   * @returns Promise 响应
   */
  postRequest: (
    url: string,
    data: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
}


/**
 * 路由权限配置对象
 */
export interface RoutePermissionConfig {
  /**
   * 是否需要登录
   * - true: 需要登录才能访问（默认值）
   * - false: 不需要登录，公开访问
   */
  requiresAuthentication: boolean;
  /**
   * 所需权限 ID
   * - string: 必须拥有该权限
   * - string[]: 拥有其中任意一个权限即可
   * - undefined: 不需要权限验证（但可能需要登录，取决于 requiresAuthentication）
   */
  permissionIds?: string | string[];
}

/**
 * 路由权限映射配置
 * 用于配置路由路径与所需权限的映射关系
 */
export interface RoutePermissionMap {
  /**
   * 路由路径到权限配置的映射
   * 
   * @example
   * {
   *   '/login': {
   *     requiresAuthentication: false            // 公开访问，不需要登录
   *   },
   *   '/public': {
   *     requiresAuthentication: false,           // 公开访问
   *     permissionIds: undefined
   *   },
   *   '/dashboard': {
   *     requiresAuthentication: true,            // 需要登录，不需要权限
   *     permissionIds: undefined
   *   },
   *   '/admin': {
   *     requiresAuthentication: true,            // 需要登录 + 需要权限
   *     permissionIds: 'admin.view'
   *   },
   *   '/admin/users': {
   *     requiresAuthentication: true,            // 需要登录 + 需要任一权限
   *     permissionIds: ['user.view', 'user.manage']
   *   }
   *   // 未配置的路由默认需要登录但不需要权限
   * }
   */
  [path: string]: undefined | RoutePermissionConfig;
}



/**
 * 按钮权限配置对象
 */
export interface ButtonPermissionConfig {
  /**
   * 是否需要登录
   * - true: 需要登录才能显示（默认值）
   * - false: 不需要登录，公开显示
   */
  requiresAuthentication: boolean;
  /**
   * 所需权限 ID
   * - string: 必须拥有该权限
   * - string[]: 拥有其中任意一个权限即可
   * - undefined: 不需要权限验证（但可能需要登录，取决于 requiresAuthentication）
   */
  permissionIds?: string | string[];
}

/**
 * 按钮权限映射配置
 * 用于配置按钮编码与所需权限的映射关系
 */
export interface ButtonPermissionMap {
  /**
   * 按钮编码到权限配置的映射
   * 
   * @example
   * {
   *   'user.create': {
   *     requiresAuthentication: true,
   *     permissionIds: 'user.create'
   *   },
   *   'user.delete': {
   *     requiresAuthentication: true,
   *     permissionIds: ['user.delete', 'user.manage']  // 任一权限即可
   *   },
   *   'user.export': {
   *     requiresAuthentication: true  // 需要登录，不需要权限
   *   },
   *   'public.view': {
   *     requiresAuthentication: false  // 公开显示
   *   }
   *   // 未配置的按钮默认需要登录但不需要权限
   * }
   */
  [code: string]: undefined | ButtonPermissionConfig;
}

/**
 * EzAntd 全局配置接口
 * 用于配置组件库的全局行为
 */
export interface EzAntdConfig {
  /** 全局请求方法对象，提供 GET/POST/PUT/DELETE 方法 */
  request?: Request;
  /**
   * 判断请求响应是否成功
   * @param response 响应对象
   * @returns 是否成功
   */
  responseIsSuccess?: (response: any) => boolean;
  /**
   * 文件上传方法
   * @param url 上传 URL
   * @param formData 表单数据
   * @returns Promise 响应
   */
  upload?: (url: string, formData: FormData) => Promise<any>;
  /**
   * 判断用户是否已登录
   * @returns 是否已登录
   */
  isAuthenticated?: () => boolean;
  /**
   * 判断是否拥有权限
   * @param permission 权限标识,支持单个权限、权限数组、undefined 或 null
   * @returns 是否拥有权限
   */
  hasPermission?: (permission: string | string[] | undefined | null) => boolean;
  /**
   * 判断是否拥有角色
   * @param role 角色标识,支持单个角色、角色数组、undefined 或 null
   * @returns 是否拥有角色
   */
  hasRole?: (role: string | string[] | undefined | null) => boolean;
  /**
   * 获取路由权限映射配置（函数形式）
   * 动态获取路由路径与所需权限的映射关系
   * 使用函数形式可以避免页面刷新后配置丢失
   * 
   * @returns 路由权限映射对象
   * @example
   * getRoutePermissions: () => {
   *   const cached = sessionStorage.getItem('routePermissions');
   *   return cached ? JSON.parse(cached) : {};
   * }
   */
  getRoutePermissions?: () => RoutePermissionMap;
  /**
   * 获取按钮权限映射配置（函数形式）
   * 动态获取按钮编码与所需权限的映射关系
   * 使用函数形式可以避免页面刷新后配置丢失
   * 
   * @returns 按钮权限映射对象
   * @example
   * getButtonPermissions: () => {
   *   const cached = sessionStorage.getItem('buttonPermissions');
   *   return cached ? JSON.parse(cached) : {};
   * }
   */
  getButtonPermissions?: () => ButtonPermissionMap;
  /**
   * 登录页面路径
   * 未登录时重定向到此路径
   * @default '/login'
   */
  loginPath?: string;
  /**
   * 无权限页面路径
   * 没有权限时重定向到此路径
   * @default '/403'
   */
  forbiddenPath?: string;
}
