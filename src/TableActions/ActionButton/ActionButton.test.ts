import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const actionButtonStyle = readFileSync(
  resolve(__dirname, 'ActionButton.less'),
  'utf-8'
);

describe('ActionButton style', () => {
  it('provides rounded bordered button chrome for preset and custom icons', () => {
    expect(actionButtonStyle).toContain('width: 30px');
    expect(actionButtonStyle).toContain('height: 30px');
    expect(actionButtonStyle).toContain('border-radius: 6px');
    expect(actionButtonStyle).toContain('border: 1px solid #e9eef5');
    expect(actionButtonStyle).toContain('background: #fff');
    expect(actionButtonStyle).toContain('border-color: #cddcf0');
  });
});
