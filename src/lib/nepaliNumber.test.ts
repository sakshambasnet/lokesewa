import { toNepaliDigits } from './nepaliNumber';

describe('toNepaliDigits', () => {
  it('converts every digit', () => {
    expect(toNepaliDigits(1234567890)).toBe('१२३४५६७८९०');
  });

  it('keeps non-digit characters', () => {
    expect(toNepaliDigits('Q 12/50')).toBe('Q १२/५०');
  });
});
