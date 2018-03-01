import { MenuController, NavController, NavParams, Platform } from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { Component } from '@angular/core';
import { ConfigService } from '../../providers/config-service';
import { Firebase } from '@ionic-native/firebase';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  constructor(
  public navCtrl: NavController,
  public navParams: NavParams,
  public configService: ConfigService,
  public menuCtrl: MenuController,
  public plt: Platform,
  public analytics: Analytics,
  ) {}

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('Intro');
    this.analytics.event('tutorial_begin', {page: 'Intro'});
  }

  goToLogin() {
    this.configService.introSetSeen();
    this.analytics.event('tutorial_complete', {page: 'Intro'});
    this.navCtrl.setRoot(LoginPage, null, { animate: true, direction: 'forward' });
  }

}
