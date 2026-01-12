import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from './ImageUpload';
import { ConfigContext } from '../ConfigProvider';

// Mock file for testing
const createMockFile = (name = 'test.png', type = 'image/png'): File => {
  const file = new File(['test'], name, { type });
  return file;
};

const mockUpload = vi.fn();
const mockResponseIsSuccess = vi.fn((response) => response?.data?.success === true);

const mockConfig = {
  upload: mockUpload,
  responseIsSuccess: mockResponseIsSuccess,
  request: {
    getRequest: vi.fn(),
    postRequest: vi.fn(),
    putRequest: vi.fn(),
    deleteRequest: vi.fn(),
  },
};

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button when no image', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload />
      </ConfigContext.Provider>
    );

    expect(screen.getByText('+ 选择图片')).toBeInTheDocument();
  });

  it('displays image when value is provided', () => {
    const imageUrl = 'https://example.com/image.jpg';

    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload value={imageUrl} />
      </ConfigContext.Provider>
    );

    // Check if image is displayed
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('hides upload button when limit is reached', () => {
    const imageUrl = 'https://example.com/image.jpg';

    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload value={imageUrl} limit={1} />
      </ConfigContext.Provider>
    );

    expect(screen.queryByText('+ 选择图片')).not.toBeInTheDocument();
  });

  it('calls onChange when image is removed', async () => {
    const imageUrl = 'https://example.com/image.jpg';
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload value={imageUrl} onChange={handleChange} />
      </ConfigContext.Provider>
    );

    // Find and click remove button
    const removeButton = screen.getByLabelText('Remove file');
    await user.click(removeButton);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  it('converts to base64 when enabledUpload is false', async () => {
    const handleChange = vi.fn();

    const { container } = render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload onChange={handleChange} enabledUpload={false} needCrop={false} />
      </ConfigContext.Provider>
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const file = createMockFile();

    // Simulate file upload
    if (input) {
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        const callArg = handleChange.mock.calls[0][0];
        expect(callArg).toMatch(/^data:image/);
      }, { timeout: 3000 });
    }
  });

  it('uploads to server when enabledUpload is true', async () => {
    mockUpload.mockResolvedValue({
      data: {
        success: true,
        data: {
          source_url: 'https://example.com/uploaded.jpg',
        },
      },
    });

    const handleChange = vi.fn();

    const { container } = render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload
          onChange={handleChange}
          enabledUpload={true}
          uploadUrl="/api/upload"
          needCrop={false}
        />
      </ConfigContext.Provider>
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile();

    if (input) {
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
        expect(handleChange).toHaveBeenCalledWith('https://example.com/uploaded.jpg');
      }, { timeout: 3000 });
    }
  });

  it('respects disabled prop', () => {
    const { container } = render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload disabled />
      </ConfigContext.Provider>
    );

    const uploadButton = container.querySelector('.ant-upload');
    expect(uploadButton).toHaveClass('ant-upload-disabled');
  });

  it('supports custom aspect ratio', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload aspect={16 / 9} />
      </ConfigContext.Provider>
    );

    // Component should render without errors
    expect(screen.getByText('+ 选择图片')).toBeInTheDocument();
  });

  it('supports round crop shape', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload cropShape="round" />
      </ConfigContext.Provider>
    );

    expect(screen.getByText('+ 选择图片')).toBeInTheDocument();
  });

  it('renders without crop when needCrop is false', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ImageUpload needCrop={false} />
      </ConfigContext.Provider>
    );

    expect(screen.getByText('+ 选择图片')).toBeInTheDocument();
  });
});
