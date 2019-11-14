import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthentificationService} from "../_services/authentification.service";
import {FootNavService} from "../_services/foot-nav.service";

//Import des connexions Facebook
import { Platform } from '@ionic/angular';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Facebook } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  //variable connexion FB
  providerFb: firebase.auth.FacebookAuthProvider;
  //variable mail
  dataUser={
    email:'',
    password:''
  };

  connected:boolean;

  constructor(private router:Router,
              private footService:FootNavService,
              private authService:AuthentificationService,
              //constructeur pour FB
              public afDB: AngularFireDatabase,
              public afAuth: AngularFireAuth,
              private fb: Facebook,
              public platform: Platform) {
    this.providerFb = new firebase.auth.FacebookAuthProvider();

    //on regarde la connection de l'utilisateur
    this.afAuth.authState.subscribe(auth=>{
      if(!auth){
        this.connected=false;
      } else {
        this.connected=true;
      }
    });
  }

  ngOnInit() {
  }

  /*
  onLogin(user) {
    this.authService.login(user.username,user.password).then(data=>{
      if (data){
        this.footService.pageCible='factures';
        this.router.navigateByUrl('factures')
      } else {
        this.router.navigateByUrl('login')
      }
    });
  }
  */

  //Connexion avec Facebook
  facebookLogin() {
    this.authService.facebookLogin();
  }

  //login via Mail
  loginMail() {
    this.authService.loginMail(this.dataUser);
  }

  InscriptionMail() {
    this.router.navigateByUrl('inscription');
  }
}
