import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FcmService {

  constructor(private firebase: FirebaseX,
              private afs: AngularFirestore,
              private platform: Platform) {}

  async getToken(uid:string) {
    let token;

    //phone
    if(this.platform.is('cordova')) {
      if (this.platform.is('android')) {
        token = await this.firebase.getToken();
      }

      if (this.platform.is('ios')) {
        token = await this.firebase.getToken();
        await this.firebase.grantPermission();
      }

      this.saveToken(token,uid);
    } else {
      //Web
      //TODO : get token for angular web application
      //token = await this.firebase.getToken();
    }
  }

  private saveToken(token,uid) {
    if (!token) return;

    const devicesRef = this.afs.collection('devices');

    //TODO il faut vérifier que l'utilisateur n'a pas un device deja donc s'il se connecte à un autre device, il faut le déconnecter du premier et mettre à jour le token (plutot le supprimer et recréer)

    const data = {
      token,
      userId: uid
    };

    return devicesRef.doc(token).set(data);
  }

  onNotifications() {
    return this.firebase.onMessageReceived();
  }
}
