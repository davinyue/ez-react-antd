import React, { Suspense } from 'react';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import type { IconSelectProps } from './IconSelectImpl';

const IconSelectImpl = React.lazy(() => import('./IconSelectImpl'));

function IconSelect(props: IconSelectProps) {
  const { componentDisabled } = AntdConfigProvider.useConfig();
  const disabled = props.disabled ?? componentDisabled;

  return (
    <Suspense fallback={<span data-testid="icon-select-loading" style={{ display: 'none' }} />}>
      <IconSelectImpl {...props} disabled={disabled} />
    </Suspense>
  );
}

export type { IconSelectProps } from './IconSelectImpl';
export default IconSelect;
