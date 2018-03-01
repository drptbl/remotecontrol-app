import * as _ from 'underscore';

import { AlertController, Events, Platform } from 'ionic-angular';

import { Analytics } from '../providers/analytics-service';
import { AppVersion } from '@ionic-native/app-version';
import { AuthService } from '../providers/auth-service';
import { Badge } from '@ionic-native/badge';
import { Component } from '@angular/core';
import { Config } from '../providers/config';
import { ConfigService } from '../providers/config-service';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Firebase } from '@ionic-native/firebase';
import { HeaderColor } from '@ionic-native/header-color';
import { HockeyApp } from 'ionic-hockeyapp';
import { IntroPage } from '../pages/intro/intro';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LoggingService } from '../providers/logging-service';
import { LoginPage } from '../pages/login/login';
import { Network } from '@ionic-native/network';
import { NetworkService } from '../providers/network-service';
import Raven from 'raven-js';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Subscription } from 'rxjs/Subscription';
import { ToastService } from '../providers/toast-service';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  rootPage = null;
  bots: Array<any> = null;
  showTnbSubmenu: boolean = false;
  showHbSubmenu: boolean = false;
  showRbSubmenu: boolean = false;
  tnbActive: boolean = false;
  hbActive: boolean = false;
  rbActive: boolean = false;
  tnbChars: Array<any> = null;
  hbChars: Array<any> = null;
  rbChars: Array<any> = null;
  activeBot: any;
  activeChar: any;

  public isOnline: boolean = false;
  connected: Subscription;
  disconnected: Subscription;

  constructor(
  public platform: Platform,
  public configService: ConfigService,
  public events: Events,
  public logger: LoggingService,
  public alertCtrl: AlertController,
  public authService: AuthService,
  public config: Config,
  public statusBar: StatusBar,
  public splashScreen: SplashScreen,
  public appVersion: AppVersion,
  public headerColor: HeaderColor,
  public analytics: Analytics,
  public network: Network,
  public networkService: NetworkService,
  public toastService: ToastService,
  public firebase: Firebase,
  public badge: Badge,
  public localNotifications: LocalNotifications,
  public diagnostic: Diagnostic,
  private hockeyapp: HockeyApp,
  ) {
    this.setupNotifications();
    this.initializeApp();

    events.subscribe('bot:list', (arr) => {
      let activeSubs = this.authService.activeSubs;
      this.bots = Object.keys(arr);
      this.tnbActive = _.contains(this.bots, 'TheNoobBot') && _.contains(activeSubs, this.config.tnbSubId);
      this.hbActive = _.contains(this.bots, 'HonorBuddy') && _.contains(activeSubs, this.config.honorBuddySubId);
      this.rbActive = _.contains(this.bots, 'RebornBuddy') && _.contains(activeSubs, this.config.rebornBuddySubId);

      this.configService.setFbAnalyticsActiveBots(this.tnbActive, this.hbActive, this.rbActive);

      this.logger.log.info('[AppComponents - Events] constructor - bot:list trigger | got bot list:', this.bots);
    });

    events.subscribe('TheNoobBot:char:list', (arr) => {
      this.tnbChars = Object.keys(arr);
      this.logger.log.info('[AppComponents - Events] constructor - TheNoobBot:char:list trigger | got chars list:', this.tnbChars);
    });

    events.subscribe('HonorBuddy:char:list', (arr) => {
      this.hbChars = Object.keys(arr);
      this.logger.log.info('[AppComponents - Events] constructor - HonorBuddy:char:list trigger | got chars list:', this.hbChars);
    });

    events.subscribe('RebornBuddy:char:list', (arr) => {
      this.rbChars = Object.keys(arr);
      this.logger.log.info('[AppComponents - Events] constructor - RebornBuddy:char:list trigger | got chars list:', this.rbChars);
    });

    events.subscribe('bot:active', (str) => {
      this.activeBot = str;
    });

    events.subscribe('char:active', (str) => {
      this.activeChar = str;
    });

  }



  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();

      // Android status bar coloring
      if (this.platform.is('android')) {
        this.statusBar.backgroundColorByHexString('#9CAF24');
        this.headerColor.tint('#9CAF24');
      }


      if (this.platform.is('android')) {
        this.diagnostic.requestExternalStorageAuthorization();
      }

      if (this.platform.is('cordova')) {
        this.hockeyapp.start('c1ee2495af2d4c52acc67b1b5c45062b', '07f889bb067142e4a3b756a1839f4f67', true, true);
      }

      if (this.platform.is('cordova')) {
        // network stuff begins
        // todo: while starting app with internet off - there are 3 toasts instead of 1
        if (this.network.type !== 'none') {
          this.isOnline = true;
          this.onOnline();
        } else {
          this.isOnline = false;
          this.toastService.error('Internet connection is offline.');
          this.onOffline();
        }

        this.connected = this.network.onConnect().subscribe(data => {
          setTimeout(() => {
            this.isOnline = true;
            this.toastService.success('Internet connection is back online.');
            this.onOnline();
          }, 3000);
        }, error => console.error(error));

        this.disconnected = this.network.onDisconnect().subscribe(data => {
          setTimeout(() => {
            this.isOnline = false;
            this.toastService.error('Internet connection is offline.');
            this.onOffline();
          }, 2000);
        }, error => console.error(error));
        // end of network stuff
      }

      this.setupSentry();

      // check if we've seen intro
      this.configService.introHasSeen().then(
      result => {
        this.splashScreen.hide();

        if (result)
        return this.rootPage = LoginPage;

        this.rootPage = IntroPage;
      });

    });
}

  protected ionViewWillLeave() {
    if (this.platform.is('cordova')) {
      this.connected.unsubscribe();
      this.disconnected.unsubscribe();
    }
  }

  public onOnline() {
  }

  public onOffline() {
  }

  setupSentry() {
    // Sentry.io error logging
    // Set release version from app version
    if (this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then(result => {
        Raven.setRelease(result);
      });
    }
  }

  setupNotifications() {
    if (this.platform.is('cordova')) {
      this.platform.ready().then(() => {
        this.firebase.onNotificationOpen()
        .subscribe((res) => {
          this.increaseBadge(1);
          this.handleNotification(res);
        });
      });
      this.platform.pause.subscribe(() => {
        this.clearBadge();
        this.firebase.onNotificationOpen()
        .subscribe((res) => {
          this.increaseBadge(1);
          this.handleNotification(res);
        });
      });
      this.platform.resume.subscribe(() => {
        this.clearBadge();
        this.firebase.onNotificationOpen()
        .subscribe((res) => {
          this.handleNotification(res);
        });
      });
    }
  }

  increaseBadge(val) {
    if (this.platform.is('cordova')) {
      this.badge.increase(val);
    }
  }

  clearBadge() {
    if (this.platform.is('cordova')) {
      this.badge.clear();
    }
  }
  handleNotification(notif) {
    if (notif.tap) {
      // comes from background
      this.logger.log.info('[AppComponents/constructor] setupNotifications - Got new notification in background:', notif);

      let alert = this.alertCtrl.create({
        title: `${notif.charname} - ${notif.longTitle}`,
        subTitle: notif.longBody,
        buttons: ['OK'],
        enableBackdropDismiss: true,
      });
      this.configService.notifSave(notif.longTitle, notif.longBody, notif.icon, notif.ts, notif.charname, notif.botname);
      alert.present();

    } else if (!notif.tap) {
      // was in app when notification came in
      this.logger.log.info('[AppComponents/constructor] setupNotifications - Got new notification in foreground:', notif);

      let alert = this.alertCtrl.create({
        title: notif.title,
        subTitle: notif.body,
        buttons: ['OK'],
        enableBackdropDismiss: true,
      });
      this.configService.notifSave(notif.longTitle, notif.longBody, notif.icon, notif.ts, notif.charname, notif.botname);
      alert.present();
    }
  }

  tnbMenuItemHandler(): void {
    this.analytics.event('tnb_menu', {page: 'LeftMenu'});
    this.showTnbSubmenu = !this.showTnbSubmenu;
  }

  hbMenuItemHandler(): void {
    this.analytics.event('hb_menu', {page: 'LeftMenu'});
    this.showHbSubmenu = !this.showHbSubmenu;
  }

  rbMenuItemHandler(): void {
    this.analytics.event('rb_menu', {page: 'LeftMenu'});
    this.showRbSubmenu = !this.showRbSubmenu;
  }

  checkActive(charname, botname) {
    if (charname === this.activeChar && botname === this.activeBot) {
      return true;
    } else {
      return false;
    }
  }

  setChar(charname, botname) {
    this.analytics.event('set_character', {page: 'LeftMenu', bot: botname});
    this.events.publish('char:set', charname, botname);
  }

}
