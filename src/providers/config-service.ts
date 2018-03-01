import * as _ from 'underscore';
import * as moment from 'moment';

import { Events } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { Injectable } from '@angular/core';
import { LoggingService } from './logging-service';
import Raven from 'raven-js';
import { Storage } from '@ionic/storage';

// on alerts screen add character name before notification title - how to?


@Injectable()
export class ConfigService {

  constructor(
  public storage: Storage,
  private logger: LoggingService,
  public events: Events,
  public firebase: Firebase,
  ) {
  }

  private CONFIG_LOGIN = 'login';
  private CONFIG_TOKEN = 'token';
  private CONFIG_NOTIF = 'notif';
  private CONFIG_INTROSEEN = 'intro';

  // get the stored username/password
  loginGet(): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.CONFIG_LOGIN).then(
      login => {
        this.logger.log.info('[ConfigService] loginGet triggered', login);
        if (!login)
        return reject();

        resolve([login.username, login.password]);
      });
    });
  }

  // get the stored token
  tokenGet(): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.CONFIG_TOKEN).then(
      token => {
        this.logger.log.info('[ConfigService] tokenGet triggered');
        if (!token)
        return reject();

        resolve([token.token, token.decoded]);
      });
    });
  }

  // get the stored notifications
  notifGet(): Promise<[any]> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.CONFIG_NOTIF).then(
      notif => {
        this.logger.log.info('[ConfigService] notifGet triggered', notif);
        // not needed because notif may be null/undefined
        // if (!notif)
        // return reject();

        resolve(notif);
      });
    });
  }

  // remove stored username/password
  loginForget() {
    this.logger.log.info('[ConfigService] loginForget triggered');
    this.storage.remove(this.CONFIG_LOGIN);
  }

  // remove stored username/password
  tokenForget() {
    this.logger.log.info('[ConfigService] tokenForget triggered');
    this.storage.remove(this.CONFIG_TOKEN);
  }

  // save username/password
  loginSave(username, password) {
    this.logger.log.info('[ConfigService] loginSave triggered with data:', username, password);
    this.storage.set(this.CONFIG_LOGIN, {
      'username': username,
      'password': password,
    });
  }

  // save token and decoded token
  tokenSave(token, decoded) {
    this.logger.log.info('[ConfigService] tokenSave triggered with data: <hidden>');
    this.storage.set(this.CONFIG_TOKEN, {
      'token': token,
      'decoded': decoded,
    });
  }

  // save notification to local database
  notifSave(title, body, icon, ts, charname, botname) {
    this.logger.log.info('[ConfigService] notifSave triggered with data:', title, body, icon, ts, charname, botname);

    this.storage.get(this.CONFIG_NOTIF).then(
    notif => {
      if (!notif) {
        this.logger.log.info('[ConfigService] notifSave - data not present, creating new array in database');
        this.storage.set(this.CONFIG_NOTIF, [{
          title: title,
          note: body,
          icon: icon,
          time: moment().format('HH:mm, Do MMM'),
          sentAt: moment.unix(ts).format('HH:mm, Do MMM'),
          sentAtTs: ts,
          char: charname,
          bot: botname,
        }]).then(() => {
          this.storage.get(this.CONFIG_NOTIF).then((freshNotifications) => {
            notif = freshNotifications;
          }).then(() => {
            this.events.publish('notifications:new', notif);
          });
        });
      } else {
        // clean oldest 10 notications if there are 60
        if (notif.length > 60) {
          this.logger.log.info('[ConfigService] notifSave - need to cleanup some notifications, processing.. - current notifications amount is:', notif.length);
          this.storage.get(this.CONFIG_NOTIF).then((notifs) => {
            let oldNotifications = notifs;
            let indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            for (let val of indexes) {
              if (val > -1) {
                oldNotifications.splice(val, 1);
              }
            }

            notif = oldNotifications;
          }).then(() => {
            notif.push({
              title: title,
              note: body,
              icon: icon,
              time: moment().format('HH:mm, Do MMM'),
              sentAt: moment.unix(ts).format('HH:mm, Do MMM'),
              sentAtTs: ts,
              char: charname,
              bot: botname,
            });
            this.storage.set(this.CONFIG_NOTIF, notif);
            this.logger.log.info('[ConfigService] notifSave - data is present, added new stuff and saved it with data:', notif);
          }).then(() => {
            this.events.publish('notifications:new', notif);
          });
        } else {
          notif.push({
            title: title,
            note: body,
            icon: icon,
            time: moment().format('HH:mm, Do MMM'),
            sentAt: moment.unix(ts).format('HH:mm, Do MMM'),
            sentAtTs: ts,
            char: charname,
            bot: botname,
          });
          this.storage.set(this.CONFIG_NOTIF, notif);
          this.logger.log.info('[ConfigService] notifSave - data is present, added new stuff and saved it with data:', notif);
          this.events.publish('notifications:new', notif);
        }
        // end

        // todo: if above will be removed (the remove notification stuff - uncomment below)
        // notif.push({
          //   title: title,
          //   note: body,
          //   icon: icon,
          //   time: moment().format('HH:mm, Do MMM'),
                // sentAt: moment.unix(ts).format('MMMM Do, h:mm:ss a'),
                // char: charname,
                // bot: botname,
          // });
          // this.storage.set(this.CONFIG_NOTIF, notif);
          // this.logger.log.info('[ConfigService] notifSave - data is present, added new stuff and saved it with data:', notif);

        }
        // not needed?, moved above
        // this.events.publish('notifications:new', notif);
      });
    }

    // if user has seen intro
    introHasSeen(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        this.storage.get(this.CONFIG_INTROSEEN).then(
        introSeen => {
          this.logger.log.info('[ConfigService] introHasSeen triggered with data:', introSeen);
          resolve(introSeen === true);
        });
      });
    }

    // set user has seen intro
    introSetSeen() {
      this.logger.log.info('[ConfigService] introSetSeen triggered');
      this.storage.set(this.CONFIG_INTROSEEN, true);
    }

    // set user tracking info for sentry.io
    setSentryUserInfo() {
      return new Promise((resolve, reject) => {
        this.logger.log.info('[ConfigService] setSentryUserInfo triggered');
        this.tokenGet().then(data => {
          let dataStr = JSON.stringify(data);
          let dataJson = JSON.parse(dataStr);
          let mail = dataJson[1].email;
          let uuid = dataJson[1].user_id;
          Raven.setUserContext({
            email: mail,
            id: uuid,
          });
          resolve();
        });
      });
    }

    // remove user tracking info for sentry.io
    removeSentryUserInfo() {
      return new Promise((resolve, reject) => {
        this.logger.log.info('[ConfigService] removeSentryUserInfo triggered');
        Raven.setUserContext();
        resolve();
      });
    }

    // set user info for Firebase
    setFirebaseUserInfo() {
      return new Promise((resolve, reject) => {
        this.logger.log.info('[ConfigService] setFirebaseUserInfo triggered');
        this.tokenGet().then(data => {
          let dataStr = JSON.stringify(data);
          let dataJson = JSON.parse(dataStr);
          let mail = dataJson[1].email;
          let uuid = dataJson[1].user_id;
          this.firebase.setUserId(uuid);
          this.firebase.setUserProperty('email', mail);
          resolve();
        });
      });
    }

    // remove user info for Firebase
    removeFirebaseUserInfo() {
      return new Promise((resolve, reject) => {
        this.logger.log.info('[ConfigService] removeFirebaseUserInfo triggered');
        this.firebase.setUserId(null);
        this.firebase.setUserProperty('email', null);
        resolve();
      });
    }

    setFbAnalyticsActiveBots(tnb, hb, rb) {
      if (tnb) {
        this.firebase.setUserProperty('rbActive', tnb);
      } else {
        this.firebase.setUserProperty('rbActive', 'false');
      }
      if (hb) {
        this.firebase.setUserProperty('hbActive', hb);
      } else {
        this.firebase.setUserProperty('rbActive', 'false');
      }
      if (rb) {
        this.firebase.setUserProperty('tnbActive', rb);
      } else {
        this.firebase.setUserProperty('rbActive', 'false');
      }
    }

    removeFbAnalyticsActiveBots() {
      this.firebase.setUserProperty('rbActive', null);
      this.firebase.setUserProperty('hbActive', null);
      this.firebase.setUserProperty('tnbActive', null);
    }

  }
