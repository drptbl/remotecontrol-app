// check timestamp and show fresh data only?
// dont reset character while closing app and going back to it - hold name in localstorage?

// add section for remote bot control? and some buttons?
// fix downloading data from firebase for required only
// ogarnij wowa na windowsie - vs potrzebny?
// fix subscribe and proper unsubscribe from events while logging out and changing characters
// add checks for amount of bots currently running
// add hwid locks?
// multi-char is supported or not? I think yes but adding new bot is pain in the ass
// multi-char same name - how to fix?
// timeout na login?

// add no notifications yet placeholder if no alerts yet

import * as _ from 'underscore';
import * as moment from 'moment';

import {
  ActionSheetController,
  App,
  Events,
  MenuController,
  ModalController,
  NavController,
  Platform,
  ToastController,
} from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { AngularFire } from 'angularfire2';
import { AuthService } from '../../providers/auth-service';
import { Component } from '@angular/core';
import { Config } from '../../providers/config';
import { ConfigService } from '../../providers/config-service';
import { DataService } from '../../providers/data-service';
import { HockeyApp } from 'ionic-hockeyapp';
import { LoggingService } from '../../providers/logging-service';
import { LoginPage } from '../login/login';
import { NotificationService } from '../../providers/notification-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  charData: Array<any> = null;
  charName: String = null;
  botName: String = null;
  charTs;

  constructor(
  public app: App,
  public actionSheetCtrl: ActionSheetController,
  public navCtrl: NavController,
  af: AngularFire,
  public authService: AuthService,
  public menuCtrl: MenuController,
  private config: Config,
  public dataService: DataService,
  public events: Events,
  private logger: LoggingService,
  public notifiService: NotificationService,
  public cnfgService: ConfigService,
  public analytics: Analytics,
  private hockeyapp: HockeyApp,
  ) {
    this.events.subscribe('char:data', (arr) => {
      this.charData = arr;
      this.logger.log.info('[Home - Events] constructor - char:data trigger | got char data:', this.charData);
    });
    this.events.subscribe('char:ts', (ts) => {
      this.charTs = moment.unix(ts).format('MMMM Do, h:mm:ss a');
      this.logger.log.info('[Home - Events] constructor - char:ts trigger | got char ts:', this.charTs);
    });
    this.events.subscribe('char:set', (charname, botname) => {
      this.charName = charname;
      this.botName = botname;
      this.logger.log.info('[Home - Events] constructor - char:set trigger | got char name and bot name:', this.charName, this.botName);
      this.dataService.getDataForChar(this.botName, this.charName).then(() => {
        this.events.publish('bot:active', this.botName);
        this.events.publish('char:active', this.charName);
      });
    });
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(true);
    this.analytics.enterPage('Home');
  }

  ionViewDidLoad() {
    // prepare firebase tokens and send them to server
    this.dataService.getAndPushFcmTokens();

    // first we have to show any available character and set it as default
    // we need a botname and charactername to get its data
    // first get first botname available later first character for this bot, select menu and show it
    let botArray = Object.keys(this.dataService.bots);
    if (!this.botName) {
      this.botName = botArray[0];
    }

    if (!this.charName) {
      // add new bot there
      if (this.botName === 'TheNoobBot') {
        let charsArray = Object.keys(this.dataService.tnbChars);
        this.charName = charsArray[0];
      } else if (this.botName === 'HonorBuddy') {
        let charsArray = Object.keys(this.dataService.tnbChars);
        this.charName = charsArray[0];
      } else if (this.botName === 'RebornBuddy') {
        let charsArray = Object.keys(this.dataService.tnbChars);
        this.charName = charsArray[0];
      }

      this.dataService.getDataForChar(this.botName, this.charName).then(() => {
        this.events.publish('bot:active', this.botName);
        this.events.publish('char:active', this.charName);
      });
    }

  }

 userOptions() {
    this.analytics.event('user_options', {page: 'Home'});
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
      // {
      //   text: 'Subscriptions',
      //   handler: () => {
      //     this.analytics.event('user_options_subs', {page: 'Home'});
      //     window.open(this.config.subsUrl, '_system');
      //   },
      // },
      // {
      //   text: 'Shop',
      //   handler: () => {
      //     this.analytics.event('user_options_shop', {page: 'Home'});
      //     window.open(this.config.shopUrl, '_system');
      //   },
      // },
      {
        text: 'Support',
        handler: () => {
          this.analytics.event('user_options_support', {page: 'Home'});
          // window.open(this.config.mailTo, '_system');
          this.hockeyapp.feedback();
        },
      },
      {
        text: 'Log out',
        role: 'destructive',
        handler: () => {
          this.analytics.event('user_options_logout', {page: 'Home'});
          // todo: refactor and move to logout function
          this.dataService.removeFcmToken();

          this.authService.logout();
          this.menuCtrl.enable(false);

          // go to log in page
          this.app.getRootNav().setRoot(LoginPage, null, { animate: true, direction: 'back' });
        },
      },
      ],
    });

    actionSheet.present();
  }

}
