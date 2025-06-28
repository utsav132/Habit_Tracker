export class DateManager {
  private static instance: DateManager;
  private devMode: boolean = false;
  private currentDevDate: Date = new Date();

  static getInstance(): DateManager {
    if (!DateManager.instance) {
      DateManager.instance = new DateManager();
    }
    return DateManager.instance;
  }

  setDevMode(enabled: boolean): void {
    this.devMode = enabled;
    if (!enabled) {
      // Reset to actual today when dev mode is disabled
      this.currentDevDate = new Date();
    }
  }

  isDevMode(): boolean {
    return this.devMode;
  }

  getCurrentDate(): string {
    const date = this.devMode ? this.currentDevDate : new Date();
    return date.toISOString().split('T')[0];
  }

  getYesterdayDate(): string {
    const date = this.devMode ? new Date(this.currentDevDate) : new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const date = this.devMode ? new Date(this.currentDevDate) : new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  goToNextDay(): void {
    if (this.devMode) {
      this.currentDevDate.setDate(this.currentDevDate.getDate() + 1);
    }
  }

  goToPreviousDay(): void {
    if (this.devMode) {
      this.currentDevDate.setDate(this.currentDevDate.getDate() - 1);
    }
  }

  getFormattedCurrentDate(): string {
    const date = this.devMode ? this.currentDevDate : new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getCurrentDayOfWeek(): number {
    const date = this.devMode ? this.currentDevDate : new Date();
    return date.getDay();
  }
}

// Legacy functions for backward compatibility
export const getCurrentDate = (): string => {
  return DateManager.getInstance().getCurrentDate();
};

export const getYesterdayDate = (): string => {
  return DateManager.getInstance().getYesterdayDate();
};

export const getTomorrowDate = (): string => {
  return DateManager.getInstance().getTomorrowDate();
};

export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDate();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};