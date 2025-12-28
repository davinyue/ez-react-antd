import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
};

export default preview;