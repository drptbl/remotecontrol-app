import { ToastService } from './toast-service';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';

@Injectable()
export class NetworkService {

  constructor(private network: Network, private toast: ToastService) {}

  noConnection() {
    if (this.network.type === 'none') {
      this.toast.error('No internet connection.');
    }
  }

}
