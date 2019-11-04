import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {FootNavService} from "./foot-nav.service";
import * as firebase from 'firebase/app';
import {Facebook} from "@ionic-native/facebook/ngx";
import {AngularFireAuth} from "@angular/fire/auth";
import {Platform} from "@ionic/angular";
import {AngularFireDatabase} from "@angular/fire/database";
import UserCredential = firebase.auth.UserCredential;
import {Storage} from "@ionic/storage";

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {
  //variable connexion FB
  providerFb: firebase.auth.FacebookAuthProvider;

  public authentificated:boolean;

  public token:string;

  //variable de l'utilisateur en localStorage
  public localUser={
    idBackEnd:'',
    idFirebase:'',
    displayName:'',
    email:'',
    phoneNumber:'',
    photoURL:'',
    methodConnexion:'',
  };

  constructor(private router:Router,
              private fb: Facebook,
              public afDB: AngularFireDatabase,
              public afAuth: AngularFireAuth,
              public platform: Platform,
              private storage:Storage,
              private footService:FootNavService) {
    //on alimente le fournisseur de donnée de Facebook dans la variable prévue
    this.providerFb = new firebase.auth.FacebookAuthProvider();

    /****************
     * permet de voir si on est connecté
     * si on veut travailler hors connexion, on peut toujours rester connecté et donc pas besoin de regarder sur firebase
     * normalement, si on n'est plus connecté sur firebase, c'est qu'on a lancé depuis l'application
     * le cas de connecté dans l'appli et déconnecté sur firebase ne devrait pas exister
     *
    //on regarde la connection de l'utilisateur
    this.afAuth.authState.subscribe(auth=>{
      if(!auth){
        this.connectedFirebase=false;
      } else {
        this.connectedFirebase=true;
      }
    });
    */
  }

  async login(){
    let res=this.loadToken();
    this.goAfterLogin(res);
  }

  //on check à l'ouverture de l'application si on est deja connecté
  public tryLogin() {
    //on récupère les informations de l'utilisateur enregistré en localstorage
    this.getLocalUser();
    //on essaye de se connectet
    this.login();
  }

  //navigation si on est connecté
  private goAfterLogin(value:boolean){
    //permet de colorer la bonne icone
    this.footService.pageCible='factures';
    //redirection
    value?this.router.navigateByUrl('factures'):this.router.navigateByUrl('login');
  }

  //sauvegarde du token de connexion
  saveToken(token:string) {
    localStorage.setItem("connected",token);
  }

  //chargement du token de connexion
  loadToken() {
    this.token=localStorage.getItem("connected");
    if (this.token==null){
      this.saveToken('disconnected');
      this.token=localStorage.getItem("connected");
    }
    this.token=='connected'?this.authentificated=true:this.authentificated=false;
    return this.authentificated;
  }

  //déconnexion de l'application
  public logout() {
    //déconnexion de firebase
    this.afAuth.auth.signOut();
    //on se déconnecte de l'application
    this.saveToken('disconnected');
    this.authentificated=false;
    //on retourne à la page de login
    this.router.navigateByUrl('login');
  }

  //on récupère les infos de l'utilisateur stocké dans le storage
  async getLocalUser(){
    await this.storage.get("billaps:user").then(data=>{
      if(data!=null){
        this.localUser=data;
      }
    });
  }

  /*****************************************************************************************
   *  CONNEXION AVEC FACEBOOK
   ****************************************************************************************/

  //Connexion avec Facebook
  facebookLogin() {
    if(this.platform.is('cordova')){
      console.log('platform : cordova');
      this.facebookCordova();
    } else {
      console.log('platform : web');
      this.facebookWeb();
    }
  }

  //Connexion via Facebook depuis Cordova
  private facebookCordova() {
    //cela va lancer l'authentification via facebook avec validation par le module facebook
    this.fb.login(['email']).then( (response) => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);
      firebase.auth().signInWithCredential(facebookCredential)
          .then((success) => {
            //validé par Facebbok, on continue la connexion
            this.acceptedConnexion(success,'facebook');

          }).catch((error) => {
        console.log('Erreur: ' + JSON.stringify(error));
      });
    }).catch((error) => { console.log(error); });
  }

  //Connexion via Facebook depuis le Web
  private facebookWeb() {
    this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then((success) => {
          //validé par Facebbok, on continue la connexion
          this.acceptedConnexion(success,'facebook');

        }).catch((error) => {
      console.log('Erreur: ' + JSON.stringify(error));
    });
  }

  /****************************************************************************************
   *   CONNEXION PAR MAIL
   ****************************************************************************************/



  //login via Mail
  loginMail(dataUser) {
    this.afAuth.auth.signInWithEmailAndPassword(dataUser.email,dataUser.password).then(data=>{
      //validé par Mail, on continue la connexion
      this.acceptedConnexion(data,'mail');
    }, err=>{
      console.log(err.code + " : " + err.message);
    });
  }

  inscriptionMail(dataUser) {
    this.afAuth.auth.createUserWithEmailAndPassword(dataUser.email,dataUser.password);
  }

  /****************************************************************************************
   *   fin de connexion par mail
   *****************************************************************************************/

  //Connexion acceptée par firebase
  private acceptedConnexion(success:UserCredential,methodConnexion:string){
    //pour voir toute les infos recu par firebase console.log('Info Firebase: ' + JSON.stringify(success));
    //on ajoute les données utiles de l'utilisateur dans la base FireBase
    this.afDB.object('Users/'+success.user.uid).set({
      displayName:success.user.displayName,
      photoURL: success.user.photoURL
    });

    //Maintenant qu'on est authentifié auprès de firebase, on va alimenter les données dans l'application
    // on va créer l'utilisateur dans le storage avec toute ses informations
    this.createUser(success,methodConnexion);
    // on sauve le token
    this.saveToken("connected");
    //on se log
    this.login();

  }

  //Connexion avec le profil userFB, on le crée s'il n'existe pas déjà
  private createUser(infos:UserCredential, methodConnexion:string){
    //on vérifie si l'utilisateur connecté est celui déjà existant
    if(this.localUser.idFirebase!=infos.user.uid){
      //on change les id et la method si l'utilisateur n'est pas le même
      this.localUser.idFirebase=infos.user.uid;
      this.localUser.idBackEnd='';
      this.localUser.methodConnexion=methodConnexion;

      //TODO: supprimer toutes les factures si on se connecte avec un autre compte
    }
    //Si c'est le bon utilisateur, on met quand même à jour les données si par exemple il a fait des modification sur FB
    this.localUser.email=infos.user.email;
    this.localUser.photoURL=infos.user.photoURL;
    this.localUser.phoneNumber=infos.user.phoneNumber;
    this.localUser.displayName=infos.user.displayName;

    //on sauvegarde dans le storage les données de l'utilisateur
    this.storage.set("billaps:user",this.localUser);
  }
}
