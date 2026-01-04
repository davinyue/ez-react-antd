import React, { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as FsIcon from '@fortawesome/free-solid-svg-icons';
import * as FrIcon from '@fortawesome/free-regular-svg-icons';
import * as AntdIcon from '@ant-design/icons';

export interface IconShowProps {
  iconValue?: string;
  style?: CSSProperties
}

const defaultStyle: CSSProperties = {
  fontSize: '16px',
  width: '16px',
  height: '16px',
  display: 'inline-flex',
  fontStyle: 'normal',
  lineHeight: 0,
  textAlign: 'center',
  textTransform: 'none',
  verticalAlign: '-0.125em',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

function IconShow(props: IconShowProps) {
  let style = { ...defaultStyle, ...props.style };
  let icon = <></>;
  let { iconValue = '' } = props;
  if (iconValue.startsWith('fs$')) {
    let iconName = iconValue.split('$')[1];
    if ((FsIcon as any)[iconName]) {
      icon = (
        <span className='anticon'>
          <FontAwesomeIcon icon={(FsIcon as any)[iconName]} style={style} />
        </span>
      );
    }
  }
  else if (iconValue.startsWith('fr$')) {
    let iconName = iconValue.split('$')[1];
    if ((FrIcon as any)[iconName]) {
      icon = (
        <span className='anticon'>
          <FontAwesomeIcon icon={(FrIcon as any)[iconName]} style={style} />
        </span>
      );
    }
  } else if (iconValue.startsWith('antd$')) {
    let iconName = iconValue.split('$')[1];
    if ((AntdIcon as any)[iconName]) {
      icon = React.createElement((AntdIcon as any)[iconName], { style: style });
    }
  }
  return icon;
}

export default IconShow;
