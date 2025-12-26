import React, { Component } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export interface AuthProp {
    permission?: string | Array<string>;
    role?: string | Array<string>;
    children?: React.ReactNode;
}

class Auth extends Component<AuthProp> {
    static contextType = AuthContext;
    declare context: AuthContextType;

    render() {
        const { checkPermission, checkRole } = this.context;
        const hasPermission = checkPermission(this.props.permission);
        const hasRole = checkRole(this.props.role);

        return <>{hasPermission && hasRole && this.props.children}</>;
    }
}

export default Auth;
