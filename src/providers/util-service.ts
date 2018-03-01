import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

  constructor() {
  }

  createTimeout(timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), timeout);
    });
  }

}
