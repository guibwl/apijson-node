import { LoggerService } from '@nestjs/common';
import * as accesslog from 'access-log';

export function logger(req, res, next) {
    const format = '[ACCESS_LOG]:ip - :userID ":method :url :protocol/:httpVersion" :statusCode :contentLength ":referer" ":userAgent"';
    accesslog(req, res, format);
    next();
};


export class MyLogger implements LoggerService {
    log(message: string) {
      console.log('[LOG] ', message);
    }
    error(message: string, trace: string) {
      console.error('[ERROR] ', message, trace);
      console.trace(trace);
    }
    warn(message: string) {
      console.warn('[WARN] ', message);
    }
    debug(message: string) {
      console.debug('[DEBUG] ', message);
    }
    verbose(message: string) {
      console.log('[VERBOSE] ', message);
    }
}