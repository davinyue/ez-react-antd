import { render, screen, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import IconSelect from './IconSelect';

vi.mock('./IconSelectImpl', () => ({
  default: ({ disabled }: { disabled?: boolean }) => (
    <div data-testid='icon-select-impl' data-disabled={String(disabled)}>
      IconSelectImpl
    </div>
  ),
}));

describe('IconSelect', () => {
  it('loads the heavy icon selector implementation lazily', async () => {
    render(<IconSelect />);

    expect(screen.getByTestId('icon-select-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('icon-select-impl')).toBeInTheDocument();
    });
  });

  it('inherits disabled state from Ant Design Form', async () => {
    render(
      <Form disabled>
        <IconSelect />
      </Form>
    );

    await waitFor(() => {
      expect(screen.getByTestId('icon-select-impl')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('supports explicit disabled false inside a disabled form', async () => {
    render(
      <Form disabled>
        <IconSelect disabled={false} />
      </Form>
    );

    await waitFor(() => {
      expect(screen.getByTestId('icon-select-impl')).toHaveAttribute('data-disabled', 'false');
    });
  });
});
