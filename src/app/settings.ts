import { AlertsPage } from '../pages/alerts/alerts';
import { Analytics } from '../providers/analytics-service';
import { AppVersion } from '@ionic-native/app-version';
import { AuthService } from '../providers/auth-service';
import { Badge } from '@ionic-native/badge';
import { CheckSubsPage } from '../pages/check-subs/check-subs';
import { Config } from '../providers/config';
import { ConfigService } from '../providers/config-service';
import { ContactPage } from '../pages/contact/contact';
import { DataService } from '../providers/data-service';
import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';
import { ErrorHandler } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { HeaderColor } from '@ionic-native/header-color';
import { HockeyApp } from 'ionic-hockeyapp';
import { HomePage } from '../pages/home/home';
import { IntroPage } from '../pages/intro/intro';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Logger } from 'angular2-logger/core';
import { LoggingService } from '../providers/logging-service';
import { LoginPage } from '../pages/login/login';
import { MyApp } from './app.component';
import { Network } from '@ionic-native/network';
import { NetworkService } from '../providers/network-service';
import { NotificationService } from '../providers/notification-service';
import { ObjectValuesPipe } from './pipes/objtoarr';
import { PlatformService } from '../providers/platform-service';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { SentryErrorHandler } from '../providers/sentry-error';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TabsPage } from '../pages/tabs/tabs';
import { Toast } from '@ionic-native/toast';
import { ToastService } from '../providers/toast-service';
import { UtilService } from '../providers/util-service';

export class Settings {
  public static firebaseConfig = {
    apiKey: '----',
    authDomain: '----',
    databaseURL: '----',
    storageBucket: '-----',
    messagingSenderId: '-----',
  };
public static declarations = [
    ObjectValuesPipe,
    MyApp,
    LoginPage,
    AlertsPage,
    ContactPage,
    HomePage,
    TabsPage,
    IntroPage,
    CheckSubsPage,
    ItemDetailsPage,
    PrivacyPolicyPage,
];
  public static pages = [
    MyApp,
    LoginPage,
    AlertsPage,
    ContactPage,
    HomePage,
    TabsPage,
    IntroPage,
    CheckSubsPage,
    ItemDetailsPage,
    PrivacyPolicyPage,
];
  public static providers = [
    {
      provide: ErrorHandler,
      useClass: SentryErrorHandler,
    },
    Config,
    Logger,
    SplashScreen,
    StatusBar,
    HeaderColor,
    AppVersion,
    Firebase,
    Analytics,
    Toast,
    Network,
    Device,
    Badge,
    LocalNotifications,
    HockeyApp,
    Diagnostic,
    LoggingService,
    AuthService,
    PlatformService,
    ConfigService,
    DataService,
    NotificationService,
    UtilService,
    ToastService,
    NetworkService,
  ];
}
