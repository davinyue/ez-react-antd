import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams
} from 'react-router';
import React from 'react';

/**
 * withRoute HOC 新增的属性
 */
export interface WithRouteProps {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  params: ReturnType<typeof useParams>;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

/**
 * withRoute HOC
 * 为类组件注入 React Router 的 hooks
 * 
 * @param SourceComponent - 要包装的组件
 * @returns 包装后的组件，会新增 navigate, location, params, searchParams, setSearchParams 属性
 */
export default function withRoute<P extends object = {}>(
  SourceComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithRouteProps>> {
  return function WithRouteComponent(props: Omit<P, keyof WithRouteProps>) {
    let navigate = useNavigate();
    let location = useLocation();
    let params = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    return <SourceComponent {...(props as any)} navigate={navigate} location={location}
      params={params} searchParams={searchParams} setSearchParams={setSearchParams} />;
  };
}
