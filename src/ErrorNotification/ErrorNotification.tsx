import React from 'react';

export class ErrorNotification extends React.Component<any> {
    render() {
        let titleStyle: React.CSSProperties = { fontWeight: 'bold' };
        let contentStyle: React.CSSProperties = { textIndent: '1em', wordWrap: 'break-word' };
        return (
            <div>
                <div style={titleStyle}>错误信息:</div>
                <div style={contentStyle}>{this.props.data.msg}</div>
            </div>
        );
    }
}

export default ErrorNotification;
