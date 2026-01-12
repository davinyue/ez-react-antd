import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RemoteSelect from './RemoteSelect';
import { ConfigContext } from '../ConfigProvider';

// Mock request function
const mockRequest = {
  getRequest: vi.fn(),
  postRequest: vi.fn(),
  putRequest: vi.fn(),
  deleteRequest: vi.fn(),
};

const mockResponseIsSuccess = vi.fn((response) => response?.data?.success === true);

const mockConfig = {
  request: mockRequest,
  responseIsSuccess: mockResponseIsSuccess,
};

describe('RemoteSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder', () => {
    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/test" placeholder="Select an option" />
      </ConfigContext.Provider>
    );

    // Ant Design Select renders placeholder as text content, not as HTML placeholder attribute
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('loads options from API on mount', async () => {
    const mockData = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' },
    ];

    mockRequest.getRequest.mockResolvedValue({
      data: {
        success: true,
        data: mockData,
      },
    });

    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" />
      </ConfigContext.Provider>
    );

    await waitFor(() => {
      expect(mockRequest.getRequest).toHaveBeenCalledWith('/api/options', undefined);
    });
  });

  it('calls onChange when option is selected', async () => {
    const mockData = [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' },
    ];

    mockRequest.getRequest.mockResolvedValue({
      data: {
        success: true,
        data: mockData,
      },
    });

    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" onChange={handleChange} />
      </ConfigContext.Provider>
    );

    await waitFor(() => {
      expect(mockRequest.getRequest).toHaveBeenCalled();
    });

    // Click to open dropdown
    const select = screen.getByRole('combobox');
    await user.click(select);

    // Wait for options to appear and click first option
    await waitFor(() => {
      const option = screen.getByText('Option 1');
      expect(option).toBeInTheDocument();
    });

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('returns metadata when metaDataInValue is true', async () => {
    const mockData = [
      { id: 1, name: 'Option 1', extra: 'data1' },
      { id: 2, name: 'Option 2', extra: 'data2' },
    ];

    mockRequest.getRequest.mockResolvedValue({
      data: {
        success: true,
        data: mockData,
      },
    });

    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" onChange={handleChange} metaDataInValue />
      </ConfigContext.Provider>
    );

    await waitFor(() => {
      expect(mockRequest.getRequest).toHaveBeenCalled();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(handleChange).toHaveBeenCalledWith(mockData[0]);
  });

  it('uses custom labelKey and valueKey', async () => {
    const mockData = [
      { code: 'A', title: 'First' },
      { code: 'B', title: 'Second' },
    ];

    mockRequest.getRequest.mockResolvedValue({
      data: {
        success: true,
        data: mockData,
      },
    });

    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" labelKey="title" valueKey="code" />
      </ConfigContext.Provider>
    );

    await waitFor(() => {
      expect(mockRequest.getRequest).toHaveBeenCalled();
    });

    const select = screen.getByRole('combobox');
    await userEvent.click(select);

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  it('does not load when needQueryParam is true and no queryParam provided', () => {
    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" needQueryParam />
      </ConfigContext.Provider>
    );

    expect(mockRequest.getRequest).not.toHaveBeenCalled();
  });

  it('loads when queryParam is provided and needQueryParam is true', async () => {
    mockRequest.getRequest.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    render(
      <ConfigContext.Provider value={mockConfig as any}>
        <RemoteSelect api="/api/options" needQueryParam queryParam={{ filter: 'active' }} />
      </ConfigContext.Provider>
    );

    await waitFor(() => {
      expect(mockRequest.getRequest).toHaveBeenCalledWith('/api/options', { filter: 'active' });
    });
  });
});
