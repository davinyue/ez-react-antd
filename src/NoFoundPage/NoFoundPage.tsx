
import { Button, Result } from 'antd';
import withRoute from '../hoc/withRoute';

const NoFoundPage = (props: any) => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<Button type="primary" onClick={() => props.navigate('/')}>Back Home</Button>}
    />
  );
};

export default withRoute(NoFoundPage);
