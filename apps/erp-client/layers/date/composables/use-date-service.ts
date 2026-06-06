export interface DateService {
  formatDate(value: string | Date): string;
  formatDateTime(value: string | Date): string;
  formatTime(value: string | Date): string;
  getStartOfToday(): Date;
}

export function useDateService(): DateService {
  function formatDate(value: string | Date): string {
    return new Date(value).toLocaleDateString();
  }

  function formatDateTime(value: string | Date): string {
    return new Date(value).toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatTime(value: string | Date): string {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStartOfToday(): Date {
    const date: Date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }

  return { formatDate, formatDateTime, formatTime, getStartOfToday };
}
