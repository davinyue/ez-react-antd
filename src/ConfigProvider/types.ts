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
 * 路由权限映射配置
 * 用于配置路由路径与所需权限的映射关系
 */
export interface RoutePermissionMap {
  /**
   * 路由路径到权限的映射
   * @example
   * {
   *   '/admin': 'admin.view',
   *   '/users': ['user.view', 'user.manage'],
   *   '/public': undefined  // 不需要权限
   * }
   */
  [path: string]: string | string[] | undefined;
}

/**
 * 按钮权限映射配置
 * 用于配置按钮编码与所需权限的映射关系
 */
export interface ButtonPermissionMap {
  /**
   * 按钮编码到权限的映射
   * @example
   * {
   *   'user.create': 'user.create',
   *   'user.delete': ['user.delete', 'user.manage'],
   *   'user.export': undefined  // 不需要权限
   * }
   */
  [code: string]: string | string[] | undefined;
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
