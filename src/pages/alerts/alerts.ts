import {
  ActionSheetController,
  App,
  Events,
  MenuController,
  ModalController,
  NavController,
  NavParams,
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
import { ItemDetailsPage } from '../item-details/item-details';
import { LoggingService } from '../../providers/logging-service';
import { LoginPage } from '../login/login';
import { NotificationService } from '../../providers/notification-service';

@Component({
  selector: 'page-alerts',
  templateUrl: 'alerts.html',
})
export class AlertsPage {

  selectedItem: any;
  icons: string[];
  items;

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
  public navParams: NavParams,
  public analytics: Analytics,
  private hockeyapp: HockeyApp,
  ) {
    this.selectedItem = navParams.get('item');

    // this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    // 'american-football', 'boat', 'bluetooth', 'build'];
    if (!this.items) {
      this.cnfgService.notifGet().then((notifs) => {
        if (notifs) {
          this.items = notifs.sort(function(x, y){
            return y.sentAtTs - x.sentAtTs;
          });

          this.logger.log.info('[AlertsPage] No notifications shown yet, made first call, data is:', this.items);
        } else {
          this.logger.log.info('[AlertsPage] No notifications present yet at all in database');
        }
      });
    }

    this.events.subscribe('notifications:new', (notif) => {
      this.items = notif.sort(function(x, y){
        return y.sentAtTs - x.sentAtTs;
      });

      this.logger.log.info('[AlertsPage] notifications:new event triggered, current data is:', this.items);
    });

  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('Alerts');
  }

  itemTapped(event, item) {
    this.analytics.event('alert_item', {page: 'Alerts'});
    this.navCtrl.push(ItemDetailsPage, {
      item: item,
    });
  }

  userOptions() {
    this.analytics.event('user_options', {page: 'Alerts'});
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
      // {
      //   text: 'Subscriptions',
      //   handler: () => {
      //     this.analytics.event('user_options_subs', {page: 'Alerts'});
      //     window.open(this.config.subsUrl, '_system');
      //   },
      // },
      // {
      //   text: 'Shop',
      //   handler: () => {
      //     this.analytics.event('user_options_shop', {page: 'Alerts'});
      //     window.open(this.config.shopUrl, '_system');
      //   },
      // },
      {
        text: 'Support',
        handler: () => {
          this.analytics.event('user_options_support', {page: 'Alerts'});
          // window.open(this.config.mailTo, '_system');
          this.hockeyapp.feedback();
        },
      },
      {
        text: 'Log out',
        role: 'destructive',
        handler: () => {
          this.analytics.event('user_options_logout', {page: 'Alerts'});
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
