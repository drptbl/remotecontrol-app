// curl -i "https://api.github.com/repos/vmg/redcarpet/issues?state=open&labels=bug&assignee=drptbl"
// curl -i "https://api.github.com/repos/vmg/redcarpet/issues?state=open&assignee=drptbl"
// curl -i "https://api.github.com/repos/vmg/redcarpet/issues?state=open
// ^ you can get issues from urls above and parse them nicely in app and show for people

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
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {

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
  public modalCtrl: ModalController,
  private hockeyapp: HockeyApp,
  ) {}

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('Settings');
  }

  openPrivacyPolicy() {
    let modal = this.modalCtrl.create(PrivacyPolicyPage);
    modal.present();
  }

 userOptions() {
    this.analytics.event('user_options', {page: 'Settings'});
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
      // {
      //   text: 'Subscriptions',
      //   handler: () => {
      //     this.analytics.event('user_options_subs', {page: 'Settings'});
      //     window.open(this.config.subsUrl, '_system');
      //   },
      // },
      // {
      //   text: 'Shop',
      //   handler: () => {
      //     this.analytics.event('user_options_shop', {page: 'Settings'});
      //     window.open(this.config.shopUrl, '_system');
      //   },
      // },
      {
        text: 'Support',
        handler: () => {
          this.analytics.event('user_options_support', {page: 'Settings'});
          // window.open(this.config.mailTo, '_system');
          this.hockeyapp.feedback();
        },
      },
      {
        text: 'Log out',
        role: 'destructive',
        handler: () => {
          this.analytics.event('user_options_logout', {page: 'Settings'});
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
