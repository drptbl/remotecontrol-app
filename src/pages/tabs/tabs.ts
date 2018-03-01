import { AlertsPage } from './../alerts/alerts';
import { Component } from '@angular/core';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root = HomePage;
  tab2Root = AlertsPage;
  tab3Root = ContactPage;

  constructor() {

  }

  ionViewDidLoad() {
  }

}
