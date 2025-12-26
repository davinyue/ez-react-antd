
import { Button, Result } from 'antd';
import withRoute from '../hoc/withRoute';

const ErrorPage = (props: any) => {
  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, something went wrong."
      extra={<Button type="primary" onClick={() => props.navigate('/')}>Back Home</Button>}
    />
  );
};

export default withRoute(ErrorPage);
