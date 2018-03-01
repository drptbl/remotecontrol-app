import 'rxjs/add/operator/map';

import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { Badge } from '@ionic-native/badge';
import { Firebase } from '@ionic-native/firebase';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LoggingService } from './logging-service';
import { Platform } from 'ionic-angular';
import Raven from 'raven-js';

@Injectable()
export class NotificationService {

  public fbUuid = null;
  public bots = null;

  public af: AngularFire;

  constructor(
  public plt: Platform,
  public logger: LoggingService,
  public firebase: Firebase,
  public badge: Badge,
  public localNotifications: LocalNotifications,
  af: AngularFire,
  ) {
    this.af = af;
  }

  // if ios then request notification permissions
  grantPerm() {
    if (this.plt.is('cordova')) {
      if (this.plt.is('ios')) {
        this.firebase.grantPermission();
        this.localNotifications.registerPermission();
      }
      this.badge.registerPermission();
    }
  }

  // subscribe from all topics
  topicsSub(fbUuid, bots) {
    let botz = Object.keys(bots);
    this.bots = botz;
    this.fbUuid = fbUuid;

    if (this.plt.is('cordova')) {
      if (botz) {
        for (let bot of botz) {
          this.firebase.subscribe(bot).then(() => {
            this.logger.log.info('[NotifiService] topicsSub - subscribed to topic:', bot);
          }).catch((err) => {
            Raven.captureException(err);
            this.logger.log.error('[NotifiService] topicsSub - failed to subscribe to topic:', bot, err);
          });
        }
      }

      this.firebase.subscribe('rcNews').then(() => {
        this.logger.log.info('[NotifiService] topicsSub - subscribed to topic: rcNews');
      }).catch((err) => {
        Raven.captureException(err);
        this.logger.log.error('[NotifiService] topicsSub - failed to subscribe to topic: rcNews', err);
      });

      this.firebase.subscribe(fbUuid).then(() => {
        this.logger.log.info('[NotifiService] topicsSub - subscribed to topic:', fbUuid);
      }).catch((err) => {
        Raven.captureException(err);
        this.logger.log.error('[NotifiService] topicsSub - failed to subscribe to topic:', fbUuid, err);
      });
    }
  }

  // unsubscribe from all topics
  topicsUnsub() {
    if (this.plt.is('cordova')) {
      if (this.bots) {
        for (let bot of this.bots) {
          this.firebase.unsubscribe(bot).then(() => {
            this.logger.log.info('[NotifiService] topicsUnsub - unsubscribed from topic:', bot);
          }).catch((err) => {
            Raven.captureException(err);
            this.logger.log.error('[NotifiService] topicsUnsub - failed to unsubscribe from topic:', bot, err);
          });
        }
      }

      this.firebase.unsubscribe('rcNews').then(() => {
        this.logger.log.info('[NotifiService] topicsUnsub - unsubscribed from topic: rcNews');
      }).catch((err) => {
        Raven.captureException(err);
        this.logger.log.error('[NotifiService] topicsUnsub - failed to unsubscribe from topic: rcNews', err);
      });

      this.firebase.unsubscribe(this.fbUuid).then(() => {
        this.logger.log.info('[NotifiService] topicsUnsub - unsubscribed from topic:', this.fbUuid);
      }).catch((err) => {
        Raven.captureException(err);
        this.logger.log.error('[NotifiService] topicsUnsub - failed to unsubscribe from topic:', this.fbUuid, err);
      });
    }
  }

}
