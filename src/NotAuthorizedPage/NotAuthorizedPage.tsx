import { Button, Result } from 'antd';
import { ResultStatusType } from 'antd/es/result';
import withRoute from '../hoc/withRoute';

export interface NotAuthorizedPageProp {
  /** 错误状态码，默认为 403 */
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

const NotAuthorizedPage = (props: NotAuthorizedPageProp & { navigate: (path: string) => void }) => {
  const handleBackHome = () => {
    if (props.onBackHome) {
      props.onBackHome();
    } else {
      props.navigate('/');
    }
  };

  return (
    <Result
      status={props.status || "403"}
      title={props.title || "403"}
      subTitle={props.subTitle || "Sorry, you are not authorized to access this page."}
      extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
    />
  );
};

export default withRoute(NotAuthorizedPage);
