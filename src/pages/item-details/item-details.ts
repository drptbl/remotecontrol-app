import { MenuController, NavController, NavParams } from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { Component } from '@angular/core';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html',
})
export class ItemDetailsPage {
  selectedItem: any;

  constructor(
  public navCtrl: NavController,
  public navParams: NavParams,
  public menuCtrl: MenuController,
  public analytics: Analytics,
  ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('ItemDetails');
  }

}
