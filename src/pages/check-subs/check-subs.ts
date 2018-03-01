import { AlertController, Events, MenuController, NavController, NavParams, Platform } from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { AuthService } from '../../providers/auth-service';
import { Component } from '@angular/core';
import { Config } from '../../providers/config';
import { ConfigService } from '../../providers/config-service';
import { DataService } from '../../providers/data-service';
import { Firebase } from '@ionic-native/firebase';
import { HomePage } from '../home/home';
import { LoggingService } from '../../providers/logging-service';
import { LoginPage } from '../login/login';
import { NotificationService } from '../../providers/notification-service';
import { Settings } from '../../app/settings';
import { TabsPage } from '../tabs/tabs';
import { UtilService } from '../../providers/util-service';

@Component({
  selector: 'page-check-subs',
  templateUrl: 'check-subs.html',
})

export class CheckSubsPage {

  constructor(
  public navCtrl: NavController,
  public navParams: NavParams,
  public authService: AuthService,
  public configService: ConfigService,
  public alertCtrl: AlertController,
  public utilService: UtilService,
  private config: Config,
  public dataService: DataService,
  public events: Events,
  public menuCtrl: MenuController,
  public logger: LoggingService,
  public plt: Platform,
  public notifiService: NotificationService,
  public analytics: Analytics,
  ) {}

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('CheckSubscriptions');
  }

  ionViewDidLoad() {
    this.utilService.createTimeout(350).then(() => {
      this.checkSubs();
    });
  }

  checkSubs() {
    this.analytics.event('check_subs', {page: 'CheckSubscriptions'});
    this.authService.prepareToken().then(() => {
      this.authService.getSubsCount().then(() => {
        if (this.authService.subsCount >= 1) {
          this.dataService.getBotArray().then(() => {

            let botArray = Object.keys(this.dataService.bots);
            this.dataService.getCharsArrayForEachBot(botArray).then(() => {
              this.goToHomePage();
            });

          });
        } else {
          this.goToLoginPage();
          let alert = this.alertCtrl.create({
            title: 'No subscriptions',
            subTitle: 'You have no active subscriptions.',
            enableBackdropDismiss: false,
            buttons: [
            {
              text: 'Shop',
              handler: () => {
                window.open(this.config.shopUrl, '_system');
              },
            },
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
              },
            },
            ],
          });
          alert.present();
        }
      }).catch((err) => {
        this.logger.log.error('[CheckSubsPage] checkSubs - got error when getting subscriptions count:', err);
      });
    }).catch((err) => {
      this.logger.log.error('[CheckSubsPage] checkSubs - got error when preparing token:', err);
    });
  }

  goToHomePage() {
    this.analytics.event('go_to_home', {page: 'CheckSubscriptions'});
    this.notifiService.grantPerm();
    this.navCtrl.setRoot(TabsPage, null, { animate: false, direction: 'forward' });
  }

  goToLoginPage() {
    this.analytics.event('go_to_login', {page: 'CheckSubscriptions'});
    // todo: refactor and move to logout function
    this.dataService.removeFcmToken();
    this.authService.logout();
    this.navCtrl.setRoot(LoginPage, null, { animate: false, direction: 'back' });
  }

}
