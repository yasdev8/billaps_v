import {Component, Injectable, OnInit} from '@angular/core';
import {FcmService} from '../_services/fcm.service';
import {ToastController} from '@ionic/angular';
import { tap } from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
//import * as admin from 'firebase-admin';

@Component({
  selector: 'app-fcm',
  templateUrl: './fcm.page.html',
  styleUrls: ['./fcm.page.scss'],
})
@Injectable()
export class FcmPage implements OnInit {
  public message:string;
  public toToken:string;
  constructor(
      public fcm:FcmService,
      public httpClient: HttpClient
  ) { }

  ngOnInit() {
  }

  /*
  ionViewDidLoad(){
    this.listenNotif();
  }

  getTok(){
    this.fcm.getToken();
  }

  async listenNotif(){
    //On récupère le token
    this.fcm.getToken();

    await this.fcm.listenToNotifications().pipe(
        await tap(msg=>{
          this.tapFct(msg);
        })
    )

  }

  async tapFct(msg){
    let toast =  await this.toastCtrl.create({
      message: msg.body,
      duration: 3000
    });

    toast.present();
  }
  */

  envoieNotif() {
    //options

    console.log("toToken : "+this.toToken);
    const httpOptions = {
      headers: new HttpHeaders({ 'Authorization': 'key=AIzaSyDPvFgItJYCcdJ5UTqUjvoTkMhvv1KfHjo',
        'Content-Type': 'application/json' })
    };
    //message
    let notification = {
      "notification": {
        "title": "TitreTest",
        "body": "bodyTest",
        "click_action": "FCM_PLUGIN_ACTIVITY",
        "sound": "default"
      }, "data": {
        //OPTIONAL PARAMS
      },
      "to": this.toToken,
      "priority": "high"
    };
    //url
    let url = 'https://fcm.googleapis.com/fcm/send';
    //envoi via http
    this.httpClient.post(url, notification, httpOptions).subscribe(resp=>{
      console.log("remarche stp");
      console.log(resp);
    }, error=>{
      console.log("erreur du post mais on envoit bien")
      console.log(error);
    });




  }


  /*
  testtttt
   */

  test(){
    this.fcm.send(this.message)
        .subscribe(data=>{
          console.log(data)
        }, err=>{
          console.log(err);
        })
  }

  testold(){
    // This registration token comes from the client FCM SDKs.
    var registrationToken = 'fyxq3JxrwMI:APA91bE14Vtw7bQTu2MYnOAGeA7GCk8j6AHsV3xqZ8yYBRuIrXD2NVMzTYxqs0OjibhViG399yDPldgDkj0tBQSbC4uGfxfvVazapngVPl6UwURlRM8JVAgbUVJ7DEJmEo--TGj830SS';

    var message = {
      notification: {
        "title": "TitreTest",
        "body": "bodyTest",
        "click_action": "FCM_PLUGIN_ACTIVITY",
        "sound": "default"
      },
      data: {
        score: '850',
        time: '2:45'
      },
      token: registrationToken
    };

    // Send a message to the device corresponding to the provided
      /* coté serveur
          var admin = require("firebase-admin");

          var serviceAccount = require("/billaps-v0-firebase-adminsdk-q0494-bb2363386f.json");

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://billaps-v0.firebaseio.com"
          });

              // registration token.
              admin.messaging().send(message)
                  .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                  })
                  .catch((error) => {
                    console.log('Error sending message:', error);
                  });*/

  }

  //POST: https://fcm.googleapis.com/fcm/send
//HEADER: Content-Type: application/json
//HEADER: Authorization: key=AIzaSy*******************
/*
  {
    "notification":{
      "title":"Notification title",
      "body":"Notification body",
      "sound":"default",
      "click_action":"FCM_PLUGIN_ACTIVITY",
      "icon":"fcm_push_icon"
    },
    "data":{
      "param1":"value1",
      "param2":"value2"
    },
    "to":"/topics/topicExample",
    "priority":"high",
    "restricted_package_name":""
  }
*/
//sound: optional field if you want sound with the notification
//click_action: must be present with the specified value for Android
//icon: white icon resource name for Android >5.0
//data: put any "param":"value" and retreive them in the JavaScript notification callback
//to: device token or /topic/topicExample
//priority: must be set to "high" for delivering notifications on closed iOS apps
//restricted_package_name: optional field if you want to send only to a restricted app package (i.e: com.myapp.test)


}
