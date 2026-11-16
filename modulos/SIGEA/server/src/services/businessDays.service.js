const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Adds business days to a start date, skipping Saturdays and Sundays.
 * The start day is not counted: it advances first and then discounts
 * only business days until the requested amount is consumed.
 *
 * @param {Date} startDate Base date (its time of day is preserved).
 * @param {number} businessDays Business days to add (>= 1).
 * @returns {Date} New date keeping the time of day of the start date.
 * @throws {Error} If the date or the amount of days is not valid.
 */
export function addBusinessDays(startDate, businessDays) {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    throw new Error('La fecha inicial no es válida.');
  }

  if (!Number.isInteger(businessDays) || businessDays < 1) {
    throw new Error('La cantidad de días hábiles debe ser un número entero mayor o igual a 1.');
  }

  const cursor = new Date(startDate.getTime());
  let remaining = businessDays;

  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + 1);

    if (!isWeekend(cursor)) {
      remaining -= 1;
    }
  }

  return cursor;
}