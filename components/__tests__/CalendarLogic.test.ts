import { describe, expect, it } from 'vitest';
import { getCalendarData5786 } from '../CalendarLogic';

const expectedMonthNames = [
  'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
  'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar'
];

const expectedMonthDays: Record<string, number> = {
  Nisan: 30,
  Iyar: 29,
  Sivan: 30,
  Tammuz: 29,
  Av: 30,
  Elul: 29,
  Tishrei: 30,
  Cheshvan: 29,
  Kislev: 30,
  Tevet: 29,
  Shevat: 30,
  Adar: 29,
};

const findDay = (month: any, day: number) =>
  month.weeks.flat().find((entry: any) => entry.day === day);

describe('getCalendarData5786', () => {
  it('returns all 12 months in expected biblical order with correct day counts', () => {
    const calendar = getCalendarData5786();

    expect(calendar).toHaveLength(12);
    expect(calendar.map((m: any) => m.name)).toEqual(expectedMonthNames);

    for (const month of calendar) {
      expect(month.days).toBe(expectedMonthDays[month.name]);
      const actualDays = month.weeks
        .flat()
        .filter((d: any) => d.day !== null)
        .map((d: any) => d.day);

      expect(actualDays).toEqual(
        Array.from({ length: month.days }, (_, i) => i + 1)
      );
    }
  });

  it('marks shabbat only on saturday columns', () => {
    const calendar = getCalendarData5786();

    for (const month of calendar) {
      for (const week of month.weeks) {
        week.forEach((day: any, dayOfWeek: number) => {
          if (day.day === null) return;
          expect(day.isShabbat).toBe(dayOfWeek === 6);
        });
      }
    }
  });

  it('assigns key festivals on the correct dates', () => {
    const calendar = getCalendarData5786();
    const monthByName = Object.fromEntries(
      calendar.map((month: any) => [month.name, month])
    );

    expect(findDay(monthByName.Nisan, 15).festivals).toContain('Pesach');
    expect(findDay(monthByName.Nisan, 21).festivals).toContain('Pesach VII');
    expect(findDay(monthByName.Tishrei, 1).festivals).toContain('Rosh Hashanah');
    expect(findDay(monthByName.Tishrei, 2).festivals).toContain('Rosh Hashanah');
    expect(findDay(monthByName.Tishrei, 10).festivals).toContain('Yom Kippur');
    expect(findDay(monthByName.Kislev, 25).festivals).toContain('Hanukkah');
    expect(findDay(monthByName.Shevat, 15).festivals).toContain('Tu Bishvat');
    expect(findDay(monthByName.Adar, 14).festivals).toContain('Purim');
  });
});
