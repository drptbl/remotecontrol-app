import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

/*
Generated class for the PlatformService provider.

See https://angular.io/docs/ts/latest/guide/dependency-injection.html
for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PlatformService {

  constructor(public platform: Platform) {
    platform.ready().then(() => {
      console.log('platform: ', platform);
    });

  }

}
