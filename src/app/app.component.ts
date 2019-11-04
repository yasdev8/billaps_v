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
      //FCM
      this.notificationSetup();
      this.authService.tryLogin();
    });
  }

  private notificationSetup() {
    this.fcm.getToken();
    this.fcm.onNotifications().subscribe(
        (msg) => {
          //Phone
          if(this.platform.is('cordova')) {
            if (this.platform.is('ios')) {
              this.presentToast(msg.aps.alert);
            } else {
              this.presentToast(msg.body);
              console.log("message : "+msg);
            }
          } else {
            //Web
            //TODO : notification de message pour le web

          }
        });
  }

  private async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 3000
    });
    toast.present();
  }
}
