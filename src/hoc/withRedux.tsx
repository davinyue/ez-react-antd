import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import React from 'react';

/**
 * withRedux HOC 注入的属性
 */
export interface WithReduxProps {
  /** Redux dispatch 函数 */
  dispatch: Dispatch;
}

/**
 * 将 Redux 的 state 映射到组件，作用和 connect 一致
 * 
 * @param stateMapProps - 函数，接受 Redux 的 state，返回一个对象，该对象包含 state 里面的属性
 * @returns HOC 函数
 * 
 * @example
 * ```tsx
 * // 定义 state 映射函数
 * const mapState = (state: RootState) => ({
 *   user: state.user,
 *   count: state.count
 * });
 * 
 * // 使用 withRedux
 * const MyComponent = withRedux(mapState)(MyComponentClass);
 * 
 * // 组件会自动获得 user, count, dispatch 属性的类型提示
 * ```
 */
export default function withRedux<TState extends object = {}, TRootState = any>(
  stateMapProps?: ((state: TRootState) => TState) | null
) {
  /**
   * 将 Redux 的 state 映射到组件
   * @param SourceComponent - 原始组件
   */
  return function doWithRedux<P extends object = {}>(
    SourceComponent: React.ComponentType<P>
  ): React.ComponentType<Omit<P, keyof (TState & WithReduxProps)>> {
    return function WithReduxComponent(props: Omit<P, keyof (TState & WithReduxProps)>) {
      let reduxState = {} as TState;
      if (stateMapProps && stateMapProps instanceof Function) {
        reduxState = useSelector(stateMapProps);
      }
      if (!reduxState) {
        reduxState = {} as TState;
      }
      const dispatch = useDispatch();
      return (
        <SourceComponent {...(props as any)} {...reduxState} dispatch={dispatch} />
      );
    };
  };
}
