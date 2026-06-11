import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IconSelect from './IconSelect';

vi.mock('./IconSelectImpl', () => ({
  default: () => <div data-testid="icon-select-impl">IconSelectImpl</div>,
}));

describe('IconSelect', () => {
  it('loads the heavy icon selector implementation lazily', async () => {
    render(<IconSelect />);

    expect(screen.getByTestId('icon-select-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('icon-select-impl')).toBeInTheDocument();
    });
  });
});
