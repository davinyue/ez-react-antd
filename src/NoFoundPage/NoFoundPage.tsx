import { Button, Result, type ResultProps } from 'antd';
import withRoute from '../hoc/withRoute';

export interface NoFoundPageProp {
  /** 错误状态码，默认为 404 */
  status?: ResultProps['status'];
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

const NoFoundPage = (props: NoFoundPageProp & { navigate: (path: string) => void }) => {
  const handleBackHome = () => {
    if (props.onBackHome) {
      props.onBackHome();
    } else {
      props.navigate('/');
    }
  };

  return (
    <Result
      status={props.status || "404"}
      title={props.title || "404"}
      subTitle={props.subTitle || "Sorry, the page you visited does not exist."}
      extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
    />
  );
};

export default withRoute(NoFoundPage);
