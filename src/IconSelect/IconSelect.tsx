import React, { Suspense } from 'react';
import type { IconSelectProps } from './IconSelectImpl';

const IconSelectImpl = React.lazy(() => import('./IconSelectImpl'));

function IconSelect(props: IconSelectProps) {
  return (
    <Suspense fallback={<span data-testid="icon-select-loading" style={{ display: 'none' }} />}>
      <IconSelectImpl {...props} />
    </Suspense>
  );
}

export type { IconSelectProps } from './IconSelectImpl';
export default IconSelect;
