import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { AngularFireModule } from 'angularfire2';
import { BrowserModule } from '@angular/platform-browser';
import { Config } from '../providers/config';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { Settings } from './settings';

export function declarations() {
  return Settings.declarations;
}

export function entryComponents() {
  return Settings.pages;
}

@NgModule({
  declarations: declarations(),
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(Settings.firebaseConfig),
  ],
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: Settings.providers,
})
export class AppModule {}
