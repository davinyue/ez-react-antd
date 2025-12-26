import React from 'react';
import withRoute from '../hoc/withRoute';

class Redirect extends React.Component<any, any> {
    componentDidMount() {
        const { to } = this.props;
        if (to) {
            this.props.navigate(to, { replace: true });
        }
    }
    render() {
        return null;
    }
}
export default withRoute(Redirect);
