import React from 'react';
import { Link as RouterLink } from 'react-router';

export interface LinkProp {
    to: string,
    children?: any
}

class Link extends React.Component<LinkProp> {
    render() {
        return (<RouterLink style={{ display: 'inline' }} {...this.props} />);
    }
}
export default Link;
