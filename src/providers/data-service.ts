// each change for char data triggers:
// getCharsArray getBotArray
// fix this ^

// todo:
// adjust database firebase rules to exclude subs write access
// backend should also save subs to database for each user
// app should use this (has read privileges) to let in/out of app
// https://firebase.google.com/docs/database/admin/save-data
// https://firebase.google.com/docs/database/admin/start

// bot plugin should:
// save characters in proper place in firebase database
// save data in other place

// more todo:
// limit connections somehow - but how?
// treat your codebase as public one - verify and think about it - what about locking/hacking login/etc

import 'rxjs/add/operator/map';

import * as _ from 'underscore';
import * as moment from 'moment';

import { AlertController, Events, Platform } from 'ionic-angular';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { AuthService } from './auth-service';
import { Config } from './config';
import { Device } from '@ionic-native/device';
import { Firebase } from '@ionic-native/firebase';
import { Injectable } from '@angular/core';
import { LoggingService } from './logging-service';
import { NotificationService } from './notification-service';

@Injectable()
export class DataService {
  public af: AngularFire;
  public bots: Array<any>;
  public tnbChars: Array<any> = null;
  public hbChars: Array<any> = null;
  public rbChars: Array<any> = null;
  public tnbCharData: Array<any> = null;
  public hbCharData: Array<any> = null;
  public rbCharData: Array<any> = null;
  public lastSynced = 0;

  constructor(
  private authService: AuthService,
  private config: Config,
  private logger: LoggingService,
  private device: Device,
  public plt: Platform,
  public notifiService: NotificationService,
  public events: Events,
  public alertCtrl: AlertController,
  public firebase: Firebase,

  af: AngularFire,
  ) {
    this.af = af;
  }

  // pushes fcm token to user database
  pushFcmToken(token: string) {
    return new Promise((resolve, reject) => {
      if (this.authService.loggedIn()) {
        // todo: tokens should be stored in a list, not an object if you want to support multiple devices for sending push notifications - removefcmtoken has to be updated too
        this.logger.log.info(`[DataService] pushFcmToken - /users/${this.authService.fbUid}/devices/${this.device.uuid} | Logged in: ${this.authService.loggedIn()}`);
        const userObject = this.af.database.object(`/users/${this.authService.fbUid}/devices/${this.device.uuid}`);
        userObject.set(token).then(() => {
          resolve();
        });
      } else {
        reject();
      }
    });
  }

  // removes fcm token from user database
  removeFcmToken() {
    if (this.authService.loggedIn() && this.plt.is('cordova')) {
      this.logger.log.info(`[DataService] removeFcmToken - /users/${this.authService.fbUid}/devices/${this.device.uuid} | Logged in: ${this.authService.loggedIn()}`);
      const userObject = this.af.database.object(`/users/${this.authService.fbUid}/devices/${this.device.uuid}`);
      userObject.remove();
    }
  }

  // get tokens for device and save them remotely
  getAndPushFcmTokens() {
    if (this.plt.is('cordova')) {

      // todo: get token is not needed - onTokenRefresh does the same, remove after confirmed
      // this.firebase.getToken()
      //   .then(token => console.log(`The token is ${token}`)) // save the token server-side and use it to push notifications to this device
      //   .catch(error => console.error('Error getting token', error));

      this.firebase.onTokenRefresh().subscribe((token: string) => {
        this.logger.log.info('[DataService] getAndPushFcmTokens (onTokenRefresh) - got FCM token:', token);
        this.pushFcmToken(token).then(() => {
          this.notifiService.topicsSub(this.authService.fbUid, this.bots);
        });
      });

      // todo: verify that this topicsSub works properly - it may be called before pushFcmToken above
      // edit2: already moved above after then
      // edit3: if still works remove this part
      // this.notifiService.topicsSub(this.authService.fbUid, this.bots);
    }
  }

  getUserData() {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getUserData - /users/${this.authService.fbUid} | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.list(`/users/${this.authService.fbUid}`);
    }
  }
  getUserBots() {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getUserBots - /users/${this.authService.fbUid}/bots | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.list(`/users/${this.authService.fbUid}/bots`);
    }
  }

  getUserBotData(botname: string) {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getUserBotData - /users/${this.authService.fbUid}/bots/${botname} | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.list(`/users/${this.authService.fbUid}/bots/${botname}`);
    }
  }

  getUserBotChars(botname: string) {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getUserBotChars - /users/${this.authService.fbUid}/bots/${botname}/chars | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.list(`/users/${this.authService.fbUid}/bots/${botname}/chars`);
    }
  }

  getBotCharData(botname: string, charname: string) {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getBotCharData - /users/${this.authService.fbUid}/bots/${botname}/chars/${charname}/data | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.object(`/users/${this.authService.fbUid}/bots/${botname}/chars/${charname}/data`);
    }
  }

  getBotCharTimestamp(botname: string, charname: string) {
    if (this.authService.loggedIn()) {
      this.logger.log.info(`[DataService] getBotCharTimestamp - /users/${this.authService.fbUid}/bots/${botname}/chars/${charname}/ts | Logged in: ${this.authService.loggedIn()}`);
      return this.af.database.object(`/users/${this.authService.fbUid}/bots/${botname}/chars/${charname}/ts`);
    }
  }

  getTimestampForChar(botname, charname) {
    return new Promise((resolve, reject) => {
      let tsDataSub = this.getBotCharTimestamp(botname, charname).subscribe((data) => {

        this.events.subscribe('logout:trigger', () => {
          this.logger.log.info('[DataService - Events] getTimestampForChar - logout trigger');
          tsDataSub.unsubscribe();
        });

        this.logger.log.info('[DataService] getTimestampForChar - got this data:', data.$value);
        if (data) {
          this.lastSynced = data.$value;
          this.events.publish('char:ts', this.lastSynced);
          resolve(this.lastSynced);
        }

      });
    });
  }

  getDataForChar(botname, charname) {
    return new Promise((resolve, reject) => {
      let charDataArraySub = this.getBotCharData(botname, charname).subscribe((data) => {

        this.events.subscribe('logout:trigger', () => {
          this.logger.log.info('[DataService - Events] getDataForChar - logout trigger');
          charDataArraySub.unsubscribe();
        });

        this.events.subscribe('char:set', () => {
          this.logger.log.info('[DataService - Events] getDataForChar - char set trigger');
          charDataArraySub.unsubscribe();
        });

        this.logger.log.info('[DataService] getDataForChar - got this data:', data);
        if (data) {
          // add new bots in this place
          if (botname === 'TheNoobBot') {
            this.tnbCharData = data;
            this.events.publish('char:data', this.tnbCharData);
            this.getTimestampForChar(botname, charname).then(() => {
              resolve(this.tnbCharData);
            });
          } else if (botname === 'HonorBuddy') {
            this.hbCharData = data;
            this.events.publish('char:data', this.hbCharData);
            this.getTimestampForChar(botname, charname).then(() => {
              resolve(this.hbCharData);
            });
          } else if (botname === 'RebornBuddy') {
            this.rbCharData = data;
            this.events.publish('char:data', this.rbCharData);
            this.getTimestampForChar(botname, charname).then(() => {
              resolve(this.rbCharData);
            });
          }
        }

      });
    });
  }

  getBotArray() {
    return new Promise((resolve, reject) => {
      let botArraySub = this.getUserData().subscribe((data) => {

        this.events.subscribe('logout:trigger', () => {
          this.logger.log.info('[DataService - Events] getBotArray - logout trigger');
          botArraySub.unsubscribe();
        });

        this.logger.log.info('[DataService] getBotArray - got this data:', data);
        if (data) {
          for (let entry of data) {
            for (let bot of this.config.fbDbBots) {
              if (_.contains(Object.keys(entry), bot) && this.bots !== entry) {
                this.logger.log.info('[DataService] getBotArray - filtered data:', entry);
                this.bots = entry;
                this.events.publish('bot:list', this.bots);
                resolve(this.bots);
              }
            }
          }
        }
      });
    });
  }

  getCharsArray(botName) {
    return new Promise((resolve, reject) => {
      let botCharsArraySub = this.getUserBotData(botName).subscribe((data) => {

        this.events.subscribe('logout:trigger', () => {
          this.logger.log.info('[DataService - Events] getCharsArray - logout trigger');
          botCharsArraySub.unsubscribe();
        });

        this.logger.log.info('[DataService] getCharsArray - got this data:', data);
        if (data) {
          for (let entry of data) {
            this.logger.log.info('[DataService] getCharsArray - filtered data:', entry);
            this.events.publish(`${botName}:char:list`, entry);

            // add new bots in this place
            if (botName === 'TheNoobBot') {
              this.tnbChars = entry;
            } else if (botName === 'HonorBuddy') {
              this.hbChars = entry;
            } else if (botName === 'RebornBuddy') {
              this.rbChars = entry;
            }

            resolve(entry);
          }
        }
      });
    });
  }

  getCharsArrayForEachBot(array) {
    return new Promise((resolve, reject) => {
      for (let entry of array) {
        this.getCharsArray(entry);
      }
      resolve();
    });
  }

}
