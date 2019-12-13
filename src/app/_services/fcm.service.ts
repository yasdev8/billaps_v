import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import {HttpClient} from "@angular/common/http";
import { AngularFirestore } from '@angular/fire/firestore';
import {User} from '../_model/user';
import {NotifMessage} from '../_model/notifMessage';
import * as firebase from 'firebase/app';

@Injectable()
export class FcmService {

  public notifMessage:NotifMessage=new class implements NotifMessage {
    userTokenFrom:string;
    userTokenTo:string;
    userUidFrom:string;
    userUidTo:string;
    message:string;
    title:string;
    type:string;
  };

  constructor(private firebase: FirebaseX,
              private afs: AngularFirestore,
              private platform: Platform,
              public http:HttpClient) {}

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

    const devicesRef = firebase.firestore().collection('devices');
    const data = {
      token,
      userId: uid
    };

    //on vérifie que l'utilisateur n'a pas un autre device, si c'est le cas, on le remet à jour
    devicesRef.where('userId', '==', uid)
        .get().then(function(querySnapshot) {
      //si l'utilisateur n'existe pas dans la base, on le crée
      if (querySnapshot.docs.length == 1) {
        //sinon, supprime l'ancien token
        firebase.firestore().collection('devices').doc(querySnapshot.docs[0].id).delete().then(function() {
          console.log("old token delete!");
        }).catch(function(error) {
          console.error("Error deleting old token : ", error);
        });
      }
      //on ajoute le token
      devicesRef.doc(token).set(data);
    })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });


  }

  onNotifications() {
    return this.firebase.onMessageReceived();
  }

  send(message:string){
    this.notifMessage.message=message;
    return this.http.post("http://localhost:8080/send",this.notifMessage,
        {
          headers: { 'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
          }
        })
  }
}
