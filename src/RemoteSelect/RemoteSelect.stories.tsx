import type { Meta, StoryObj } from '@storybook/react';
import RemoteSelect from './RemoteSelect';
import { ConfigContext } from '../ConfigProvider';

// Mock request implementation for Storybook
const mockRequest = {
  getRequest: async (api: string, _params?: any) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock different endpoints
    if (api === '/api/users') {
      return {
        data: {
          success: true,
          data: [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
            { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
          ],
        },
      };
    }

    if (api === '/api/departments') {
      return {
        data: {
          success: true,
          data: [
            { id: 1, name: 'Engineering' },
            { id: 2, name: 'Marketing' },
            { id: 3, name: 'Sales' },
            { id: 4, name: 'HR' },
          ],
        },
      };
    }

    if (api === '/api/countries') {
      return {
        data: {
          success: true,
          data: [
            { code: 'US', title: 'United States' },
            { code: 'UK', title: 'United Kingdom' },
            { code: 'CN', title: 'China' },
            { code: 'JP', title: 'Japan' },
          ],
        },
      };
    }

    return {
      data: {
        success: true,
        data: [],
      },
    };
  },
  postRequest: async () => ({}),
  putRequest: async () => ({}),
  deleteRequest: async () => ({}),
};

const mockConfig = {
  request: mockRequest,
  responseIsSuccess: (response: any) => response?.data?.success === true,
};

const meta: Meta<typeof RemoteSelect> = {
  title: 'Components/RemoteSelect',
  component: RemoteSelect,
  decorators: [
    (Story) => (
      <ConfigContext.Provider value={mockConfig as any}>
        <div style={{ maxWidth: '400px' }}>
          <Story />
        </div>
      </ConfigContext.Provider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    api: {
      control: 'text',
      description: 'API endpoint to fetch options',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button',
    },
    showSearch: {
      control: 'boolean',
      description: 'Enable search functionality',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select',
    },
    mode: {
      control: 'select',
      options: [undefined, 'multiple', 'tags'],
      description: 'Select mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RemoteSelect>;

/**
 * 基本用法 - 从远程 API 加载选项
 */
export const Basic: Story = {
  args: {
    api: '/api/users',
    placeholder: '请选择用户',
  },
};

/**
 * 自定义字段名 - 使用 labelKey 和 valueKey 指定显示和值字段
 */
export const CustomKeys: Story = {
  args: {
    api: '/api/countries',
    labelKey: 'title',
    valueKey: 'code',
    placeholder: '选择国家',
  },
};

/**
 * 多选模式 - 支持选择多个选项
 */
export const Multiple: Story = {
  args: {
    api: '/api/departments',
    mode: 'multiple',
    placeholder: '选择部门',
  },
};

/**
 * 禁用状态
 */
export const Disabled: Story = {
  args: {
    api: '/api/users',
    placeholder: '禁用状态',
    disabled: true,
  },
};

/**
 * 不可清除
 */
export const NoClear: Story = {
  args: {
    api: '/api/departments',
    placeholder: '不可清除',
    allowClear: false,
  },
};

/**
 * 禁用搜索
 */
export const NoSearch: Story = {
  args: {
    api: '/api/departments',
    placeholder: '禁用搜索',
    showSearch: false,
  },
};

/**
 * 返回完整数据 - metaDataInValue 为 true 时返回完整对象
 */
export const MetaDataInValue: Story = {
  args: {
    api: '/api/users',
    placeholder: '选择用户(返回完整数据)',
    metaDataInValue: true,
    onChange: (value) => {
      console.log('Selected user:', value);
    },
  },
};

/**
 * 默认选中第一项
 */
export const SelectedFirst: Story = {
  args: {
    api: '/api/departments',
    placeholder: '默认选中第一项',
    selectedFirst: true,
  },
};

/**
 * 带查询参数 - 需要查询参数才发起请求
 */
export const WithQueryParam: Story = {
  args: {
    api: '/api/users',
    placeholder: '需要查询参数',
    needQueryParam: true,
    queryParam: { status: 'active' },
  },
};
