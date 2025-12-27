import { Button, Result } from 'antd';
import withRoute from '../hoc/withRoute';

const NotAuthorizedPage = (props: any) => {
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Button type="primary" onClick={() => props.navigate('/')}>Back Home</Button>}
        />
    );
};

export default withRoute(NotAuthorizedPage);
