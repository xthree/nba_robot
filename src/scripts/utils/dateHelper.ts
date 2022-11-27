export function addMinutesToTime(_date: Date, minutes: number) {
  _date.setMinutes(_date.getMinutes() + minutes);
  return _date;
}

export function addHoursToTime(_date: Date, hours: number) {
  _date.setHours(_date.getHours() + hours);
  return _date;
}

export function isDateInThePast(_date: Date) {
  return _date < new Date();
}

const MIDNIGHT_TIMEZONE_ADJUSTMENT = 5; // EST
const DATE_ROLLOVER_CHECK_TIME = 2; // 2 AM

// _date must be in GMT midnight
export function setDateRolloverDateTime(_date: Date) {
  // 5 Hours for midnight EST
  // 2 hours for 2AM to start checking
  return addHoursToTime(_date, MIDNIGHT_TIMEZONE_ADJUSTMENT + DATE_ROLLOVER_CHECK_TIME);
}


