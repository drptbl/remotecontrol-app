import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';

// ADD CHECKS FOR TIMESTAMP and send it to database from plugin
// run a script everynight checking for timestamp and delete all records older than for example 1-2 days? so no need to hide them in app?
// also clean bots without characters?
// also check what will happen if you have bots without characters - can you login to the app?

// adding new bot procedure:
// 1. add it in firebase db manually
// 2. add its name to fbDbBots below in config
// 3. check app.html and app.components.ts and add proper stuff there
// 4. add in dataservice - getCharsArray
// 5. home.ts ionViewDidLoad
// 6. dataservice - getDataForChar
// 7. app.html
@Injectable()
export class Config {

  // code config
  public logLevel = 'INFO';
  public fbDbBots = ['TheNoobBot', 'HonorBuddy', 'RebornBuddy'];
  public rebornBuddySubId = '826';
  public honorBuddySubId = '740';
  public tnbSubId = '739';
  // app config
  public email = 'user@example.com';
  public mailTo = `mailto:${ this.email }`;
  public apiRoot = 'https://botremotecontrol.com:8092';
  public apiLogin = `${this.apiRoot}/fb/auth`;
  public homeUrl = 'https://botremotecontrol.com';
  public shopUrl = `${this.homeUrl}/shop/`;
  public subsUrl = `${this.homeUrl}/my-account/subscriptions/`;
  public resetPassUrl = `${this.homeUrl}/wp-login.php?action=lostpassword`;
  public registerUrl = `${this.homeUrl}/wp-login.php?action=register`;

  constructor() {}

  // public get USERID(): string {
    //     return "XCAMPLISHIOUS";
    // }

  }
