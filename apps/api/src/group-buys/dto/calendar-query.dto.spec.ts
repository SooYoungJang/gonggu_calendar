import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { CalendarQueryDto } from './calendar-query.dto';

describe('CalendarQueryDto', () => {
  it('accepts year and month', () => {
    const dto = plainToInstance(CalendarQueryDto, { year: 2026, month: 6 });
    const errors = validateSync(dto, { whitelist: true });

    expect(errors.length).toBe(0);
    expect(dto.year).toBe(2026);
    expect(dto.month).toBe(6);
  });

  it('requires year', () => {
    const dto = plainToInstance(CalendarQueryDto, { month: 6 });
    const errors = validateSync(dto, { whitelist: true });

    expect(errors.some((error) => error.property === 'year')).toBe(true);
  });

  it('requires month', () => {
    const dto = plainToInstance(CalendarQueryDto, { year: 2026 });
    const errors = validateSync(dto, { whitelist: true });

    expect(errors.some((error) => error.property === 'month')).toBe(true);
  });
});
