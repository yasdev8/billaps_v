import { Component } from '@angular/core';

import {Platform, ToastController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {Router} from "@angular/router";
import {AuthentificationService} from "./_services/authentification.service";
import {FacturesService} from "./_services/factures.service";
import {Storage} from "@ionic/storage";
import {FcmService} from './_services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router:Router,
    private storage:Storage,
    private authService:AuthentificationService,

    //FCM
    private fcm: FcmService,
    public toastController:ToastController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      //on lance l'authentification
      this.authService.tryLogin();
    });
  }
}
