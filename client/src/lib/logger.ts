/**
 * Professional logging system
 * Works only in development mode with configurable log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  levels: {
    debug: boolean;
    info: boolean;
    warn: boolean;
    error: boolean;
  };
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      enabled: import.meta.env.DEV,
      levels: {
        debug: true,
        info: true,
        warn: true,
        error: true,
      },
    };
  }

  /**
   * Enable or disable specific log level
   */
  setLevel(level: LogLevel, enabled: boolean): void {
    this.config.levels[level] = enabled;
  }

  /**
   * Enable or disable all logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Debug level - for detailed debugging information
   */
  debug(...args: any[]): void {
    if (this.config.enabled && this.config.levels.debug) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Info level - for general informational messages
   */
  info(...args: any[]): void {
    if (this.config.enabled && this.config.levels.info) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Warn level - for warning messages
   */
  warn(...args: any[]): void {
    if (this.config.enabled && this.config.levels.warn) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error level - for error messages
   */
  error(...args: any[]): void {
    if (this.config.enabled && this.config.levels.error) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
