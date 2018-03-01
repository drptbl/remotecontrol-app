import { IonicPage, MenuController, NavController, NavParams, ViewController } from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { Component } from '@angular/core';

@IonicPage()
@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
})
export class PrivacyPolicyPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public menuCtrl: MenuController,
    public analytics: Analytics,
    ) {
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('PrivacyPolicy');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
