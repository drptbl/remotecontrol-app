import { Config } from './config';
import { IonicErrorHandler } from 'ionic-angular';
import Raven from 'raven-js';

// only initialize Sentry.io if on actual device
if (((<any>window).cordova)) {
  if ((<any>window).cordova.platformId === 'android') {
    // android
    Raven
    .config('------------------')
    .install();
  } else if ((<any>window).cordova.platformId === 'ios') {
    // ios
    Raven
    .config('------------------')
    .install();
  }
}

// todo: after going to prod uncomment this for browser sentry.io
// else {
  //   // browser
  //   Raven
  //     .config('-------------------')
  //     .install();
  // }

// Sentry.io error handling
export class SentryErrorHandler extends IonicErrorHandler {

  handleError(error) {
    super.handleError(error);

    try {
      Raven.captureException(error.originalError || error);
      // Raven.showReportDialog({});
    } catch (e) {
      console.error(e);
    }
  }
}
