import 'rxjs/add/operator/map';

import { Config } from './config';
import { Injectable } from '@angular/core';
import { Logger } from 'angular2-logger/core';

@Injectable()
export class LoggingService {
  public log: Logger;

  constructor(public logger: Logger, private config: Config) {
    this.log = this.logger;
    // Set the log level using the config value
    switch (this.config.logLevel) {
      case 'OFF':
      this.log.level = this.logger.Level.OFF;
      break;
      case 'ERROR':
      this.log.level = this.logger.Level.ERROR;
      break;
      case 'WARN':
      this.log.level = this.logger.Level.WARN;
      break;
      case 'INFO':
      this.log.level = this.logger.Level.INFO;
      break;
      case 'DEBUG':
      this.log.level = this.logger.Level.DEBUG;
      break;
      default:
      this.log.level = this.logger.Level.LOG;
    }
    console.log('Log level is ', this.log.level);
  }

}
