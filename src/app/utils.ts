/** Message to show when a call to the backend fails. */
export function errorMessage(err: any): string {
  if (err && err.status === 0) {
    return 'Cannot reach the server. Please start the Spring Boot backend (port 8080).';
  }
  return err?.error?.message ?? 'Something went wrong. Please try again.';
}

/** Date as yyyy-MM-dd in local time (used by <input type="date">). */
export function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-02" -> "02 Nov" */
export function shortDate(isoDate: string): string {
  return isoDate.slice(8, 10) + ' ' + MONTHS[Number(isoDate.slice(5, 7)) - 1];
}
