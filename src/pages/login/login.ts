import * as $ from 'jquery';

import { AlertController, LoadingController, MenuController, ModalController, NavController, NavParams, Platform } from 'ionic-angular';

import { Analytics } from '../../providers/analytics-service';
import { AuthService } from '../../providers/auth-service';
import { CheckSubsPage } from '../check-subs/check-subs';
import { Component } from '@angular/core';
import { Config } from '../../providers/config';
import { ConfigService } from '../../providers/config-service';
import { Firebase } from '@ionic-native/firebase';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import Raven from 'raven-js';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username = '';
  password = '';
  autologin = true;

  constructor(
  public navCtrl: NavController,
  public navParams: NavParams,
  public alertCtrl: AlertController,
  public authService: AuthService,
  public configService: ConfigService,
  public loadingCtrl: LoadingController,
  private config: Config,
  public menuCtrl: MenuController,
  public plt: Platform,
  public analytics: Analytics,
  public modalCtrl: ModalController,
  ) {}

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
    this.analytics.enterPage('Login');
  }
  ionViewDidLoad() {
    // get saved login details
    this.configService.loginGet().then(
    result => {
      // check if we have any stored login information
      if (!result[0] || !result[1]) {
        // show login
        this.autologin = false;

        // early exit
        return;
      }

      // login
      this.authService.login(result[0], result[1]).then(() => {
        this.goToCheckSubsPage();
      }).catch((err) => {
        let alertMsg;
        console.error(err);

        if (err.name === 'TimeoutError') {
          alertMsg = 'Looks like server is overloaded. Please try logging in again.';
        } else {
          alertMsg = 'Couldn\'t log in with your saved login details. Please re-enter your username and password and try again.';
        }

        let alert = this.alertCtrl.create({
          title: 'Login failed',
          subTitle: alertMsg,
          buttons: ['OK'],
          enableBackdropDismiss: false,
        });
        alert.present();

        // show login form
        this.autologin = false;
      });
    }, err => {
      // show login form
      this.autologin = false;
    });

    // handle login username ENTER behavior
    $('input[name=username]').on('keydown', (e) => {
      if (e.which === 13) {
        // focus to password
        $('input[name=password]').focus();
      }
    });

    // handle login password ENTER behavior
    $('input[name=password]').on('keydown', (e) => {
      if (e.which === 13) {
        // submit log in
        this.logIn();
      }
    });
  }

  openPrivacyPolicy() {
    let modal = this.modalCtrl.create(PrivacyPolicyPage);
    modal.present();
  }

  logIn() {
    // check if username and password filled
    if (!this.username || !this.password) {
      let alert = this.alertCtrl.create({
        title: 'Username and password is required',
        buttons: ['OK'],
        enableBackdropDismiss: false,
      });
      alert.present();
      return;
    }

    let loading = this.loadingCtrl.create({
      content: 'Logging in..',
    });

    loading.present().then(() => {
      this.authService.login(this.username, this.password).then(
      success => {
        // prepare response
        let respStr = JSON.stringify(success);
        let respJson = JSON.parse(respStr);

        this.configService.loginSave(this.username, this.password);
        this.authService.loginCustomToken(respJson.token).then(success => {
          this.analytics.event('login', {page: 'Login'});
          this.goToCheckSubsPage();
        }, err => {
          console.error(err);
          let alert = this.alertCtrl.create({
            title: 'Login failed',
            subTitle: 'Something went wrong. Try again later. If problem persists, please contact developer',
            enableBackdropDismiss: false,
            buttons: ['OK'],
          });
          alert.present();
        });
      },
      error => {
        console.error(error);

        let alertMsg;
        let alertButtons;
        if (error.name === 'TimeoutError') {
          alertMsg = 'Looks like server is overloaded. Please try logging in again.';
          alertButtons = ['OK'];
        } else if (error.status === 403) {
          alertMsg = 'Wrong username or password.';
          alertButtons = [
          {
            text: 'Lost password',
            handler: () => {
              window.open(this.config.resetPassUrl, '_system');
            },
          },
          {
            text: 'OK',
            role: 'cancel',
            handler: () => {
            },
          },
          ];
        } else if (error.status === 429) {
          let err = JSON.parse(error._body);
          alertMsg = err.errorMsg;
          alertButtons = ['OK'];
        } else {
          Raven.captureException(error);
          alertMsg = 'Something went wrong. Try again later. If problem persists, please contact developer';
          alertButtons = ['OK'];
        }
        let alert = this.alertCtrl.create({
          title: 'Login failed',
          subTitle: alertMsg,
          enableBackdropDismiss: false,
          buttons: alertButtons,
        });
        alert.present();
      }).then(() =>
        loading.dismiss(),
      );
    }).catch(() => {
      console.error('There was an error while presenting loader on login page..');
    });

  }

  goToCheckSubsPage() {
    this.configService.setSentryUserInfo().then(() => {
      this.configService.setFirebaseUserInfo().then(() => {
        this.navCtrl.setRoot(CheckSubsPage, null, { animate: false, direction: 'forward' });
      }).catch(err => {
        this.navCtrl.setRoot(CheckSubsPage, null, { animate: false, direction: 'forward' });
      });
    }).catch(err => {
      this.navCtrl.setRoot(CheckSubsPage, null, { animate: false, direction: 'forward' });
    });
  }

  register() {
    this.analytics.event('sign_up', {page: 'Login'});
    window.open(this.config.registerUrl, '_system');
  }

}
