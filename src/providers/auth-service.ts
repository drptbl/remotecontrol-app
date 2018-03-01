import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import { AngularFire, AuthMethods, AuthProviders, FirebaseAuthState } from 'angularfire2';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';

import { Config } from './config';
import { ConfigService } from './config-service';
import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';
import { LoggingService } from './logging-service';
import { NotificationService } from './notification-service';
import Raven from 'raven-js';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper = new JwtHelper();
  private username = null;
  private password = null;
  public fbToken = null;
  public fbTokenDecoded = null;
  public fbUid = null;
  public subsCount = null;
  public activeSubs = null;
  public auth: FirebaseAuthState;

  constructor(
  public af: AngularFire,
  public http: Http,
  public configService: ConfigService,
  public config: Config,
  private logger: LoggingService,
  public events: Events,
  public notifiService: NotificationService,
  ) {
    this.af.auth.subscribe(auth => {
      this.auth = auth;
      // may be unneeded
      this.prepareToken().then(() => {
        this.getSubsCount().catch((err) => {
          this.logger.log.error('[AuthService] getSubsCount', err);
        });
      }).catch((err) => {
        this.logger.log.error('[AuthService] prepareToken', err);
      });
      // end of unneeded
      this.logger.log.info('[AuthService] Authed', auth);
    });
  }

  loggedIn() {
    return this.auth != null;
  }

  // decode firebase token and save to storage
  prepareToken() {
    return new Promise((resolve, reject) => {
      if (this.loggedIn()) {
        this.logger.log.info('[AuthService] prepareToken triggered');
        this.auth.auth.getToken().then(data => {
          this.logger.log.info('[AuthService] getToken triggered, got data: <hidden>');
          this.fbToken = data;
          this.fbTokenDecoded = this.jwtHelper.decodeToken(data);
          this.configService.tokenSave(this.fbToken, this.fbTokenDecoded);
          return resolve(this.fbTokenDecoded);
        }).catch(err => {
          Raven.captureException(err);
          let error = 'Error while fetching token from Firebase.';
          this.logger.log.error('[AuthService] prepareToken error:', error);
          return reject(error);
        }).then(() => {
          this.fbUid = this.auth.uid;
        });
      }
    });
  }

  // get tokens from storage and check subscriptions count
  getSubsCount() {
    return new Promise((resolve, reject) => {
      if (this.loggedIn()) {
        this.logger.log.info('[AuthService] getSubsCount triggered');
        this.configService.tokenGet().then(data => {
          let dataStr = JSON.stringify(data);
          let dataJson = JSON.parse(dataStr);
          this.subsCount = Object.keys(dataJson[1].subs).length;
          this.activeSubs = Object.keys(dataJson[1].subs);
          return resolve(this.subsCount);
        }).catch((err) => {
          Raven.captureException(err);
          let error = 'Error while getting subscriptions count.';
          this.logger.log.error('[AuthService] getSubsCount error:', error);
          return reject(error);
        });
      }
    });
  }

  loginCustomToken(token: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.logger.log.info('[AuthService] loginCustomToken triggered with token: <hidden>');
      this.af.auth.login(token, {
        provider: AuthProviders.Custom,
        method: AuthMethods.CustomToken,
      })
      .then(data => {
        this.logger.log.info('[AuthService] loginCustomToken got data:', data);
        return resolve(data);
      })
      .catch(error => {
        Raven.captureException(error);
        this.logger.log.error('[AuthService] loginCustomToken error:', error);
        return reject(error);
      });
    });
  }

  // log outs user and removes his saved data from storage
  logout() {
    this.logger.log.info('[AuthService] logout triggered');
    this.events.publish('logout:trigger');
    // todo: move function called this.dataService.removeFcmToken(); here - you couldnt do this because of issues with imports
    this.notifiService.topicsUnsub();
    this.configService.removeFbAnalyticsActiveBots();
    this.configService.removeFirebaseUserInfo();
    this.configService.removeSentryUserInfo();
    this.af.auth.logout();
    this.configService.loginForget();
    this.configService.tokenForget();
  }

  // login function
  login(username: string, password: string): Promise<Response> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let body = {
      username: username,
      password: password,
    };

    return new Promise((resolve, reject) => {
      this.logger.log.info('[AuthService] login triggered with data:', username, password);
      this.http.post(this.config.apiLogin, body, options)
      .timeout(20000)
      .map(res => res.json())
      .subscribe(data => {
        this.logger.log.info('[AuthService] login got data:', data);
        // store the last username/password and token
        this.username = username;
        this.password = password;
        this.fbToken = data.token;

        return resolve(data);
      }, error => {
        this.logger.log.error('[AuthService] login error:', error);
        return reject(error);
      });
    });
  }

}
