import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ImageUpload from './ImageUpload';
import { ConfigContext } from '../ConfigProvider';

// Mock upload function for Storybook
const mockUpload = async (_url: string, _formData: FormData) => {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock success response
  return {
    data: {
      success: true,
      data: {
        source_url: 'https://via.placeholder.com/300x300?text=Uploaded+Image',
      },
    },
  };
};

const mockConfig = {
  upload: mockUpload,
  responseIsSuccess: (response: any) => response?.data?.success === true,
  request: {
    getRequest: async () => ({}),
    postRequest: async () => ({}),
    putRequest: async () => ({}),
    deleteRequest: async () => ({}),
  },
};

const meta: Meta<typeof ImageUpload> = {
  title: 'Components/ImageUpload',
  component: ImageUpload,
  decorators: [
    (Story) => (
      <ConfigContext.Provider value={mockConfig as any}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </ConfigContext.Provider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    limit: {
      control: 'number',
      description: '图片数量限制',
    },
    aspect: {
      control: 'number',
      description: '裁切区域宽高比',
    },
    cropShape: {
      control: 'select',
      options: ['rect', 'round'],
      description: '裁切形状',
    },
    quality: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: '图片质量',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    needCrop: {
      control: 'boolean',
      description: '是否需要裁剪',
    },
    enabledUpload: {
      control: 'boolean',
      description: '是否上传到服务器',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageUpload>;

/**
 * 基本用法 - 单图上传,支持裁剪
 */
export const Basic: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    uploadUrl: '/api/upload',
  },
};

/**
 * 圆形裁剪 - 适合头像上传
 */
export const RoundCrop: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    cropShape: 'round',
    aspect: 1,
    uploadUrl: '/api/upload',
  },
};

/**
 * 自定义宽高比 - 16:9 横向裁剪
 */
export const CustomAspect: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    aspect: 16 / 9,
    uploadUrl: '/api/upload',
  },
};

/**
 * 不裁剪 - 直接上传原图
 */
export const NoCrop: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    needCrop: false,
    uploadUrl: '/api/upload',
  },
};

/**
 * Base64 模式 - 不上传到服务器,转换为 base64
 */
export const Base64Mode: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div>
        <ImageUpload {...args} value={value} onChange={setValue} />
        {value && (
          <div style={{ marginTop: '20px' }}>
            <p>Base64 值:</p>
            <textarea
              readOnly
              value={value}
              style={{ width: '100%', height: '100px', fontSize: '12px' }}
            />
          </div>
        )}
      </div>
    );
  },
  args: {
    enabledUpload: false,
  },
};

/**
 * 禁用状态
 */
export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState('https://via.placeholder.com/300x300');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    disabled: true,
    uploadUrl: '/api/upload',
  },
};

/**
 * 带旋转功能
 */
export const WithRotation: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    rotationSlider: true,
    uploadUrl: '/api/upload',
  },
};

/**
 * 低质量压缩
 */
export const LowQuality: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    quality: 0.5,
    uploadUrl: '/api/upload',
  },
};

/**
 * 预设图片
 */
export const WithDefaultValue: Story = {
  render: (args) => {
    const [value, setValue] = useState('https://via.placeholder.com/300x300?text=Default+Image');
    return <ImageUpload {...args} value={value} onChange={setValue} />;
  },
  args: {
    uploadUrl: '/api/upload',
  },
};
