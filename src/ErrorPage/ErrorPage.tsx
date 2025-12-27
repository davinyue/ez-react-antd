import { Button, Result } from 'antd';
import { ResultStatusType } from 'antd/es/result';
import withRoute from '../hoc/withRoute';

export interface ErrorPageProp {
  /** 错误状态码，如 404、403、500 等 */
  status?: ResultStatusType;
  /** 错误标题 */
  title?: string;
  /** 错误描述信息 */
  subTitle?: string;
  /**
   * 返回首页按钮点击回调
   * 如果不提供，默认跳转到 '/'
   */
  onBackHome?: () => void;
}

const ErrorPage = (props: ErrorPageProp & { navigate: (path: string) => void }) => {
  const handleBackHome = () => {
    if (props.onBackHome) {
      props.onBackHome();
    } else {
      props.navigate('/');
    }
  };

  return (
    <Result
      status={props.status || "500"}
      title={props.title || "500"}
      subTitle={props.subTitle || "Sorry, something went wrong."}
      extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
    />
  );
};

export default withRoute(ErrorPage);
