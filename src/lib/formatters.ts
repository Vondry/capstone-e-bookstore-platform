/**
 * Formats a number as Indian Rupees (INR) currency.
 * @param amount - The amount in INR
 * @param showDecimals - Whether to show decimal places (default: false for prices, true for totals)
 */
export function formatPrice(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Alias for formatPrice for consistency
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  return formatPrice(amount, showDecimals);
}

/**
 * Formats a date as a readable string.
 * @param date - The date to format
 * @param format - The format style ('short' | 'medium' | 'long')
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'weekday' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: 'numeric', month: 'short' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' },
    weekday: { weekday: 'short', day: 'numeric', month: 'short' },
  };

  return new Intl.DateTimeFormat('en-IN', optionsMap[format]).format(dateObj);
}

/**
 * Formats just the delivery date (without "Delivery by" prefix), e.g. "Mon, 21 Jul"
 * @param format - The book format ('eBook' for instant, others for +3 business days)
 * @param orderDate - The order date (defaults to now)
 */
export function formatDeliveryDate(format: string, orderDate: Date | string = new Date()): string {
  if (format === 'eBook') {
    return 'Instant';
  }

  const date = typeof orderDate === 'string' ? new Date(orderDate) : orderDate;
  const deliveryDate = new Date(date);

  // Add 3 business days
  let daysAdded = 0;
  while (daysAdded < 3) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return formatDate(deliveryDate, 'weekday');
}
