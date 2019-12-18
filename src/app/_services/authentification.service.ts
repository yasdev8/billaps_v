import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {FootNavService} from "./foot-nav.service";
import * as firebase from 'firebase/app';
import {Facebook} from "@ionic-native/facebook/ngx";
import {AngularFireAuth} from "@angular/fire/auth";
import {Platform, ToastController} from '@ionic/angular';
import {AngularFireDatabase} from "@angular/fire/database";
import UserCredential = firebase.auth.UserCredential;
import {Storage} from "@ionic/storage";
import {AngularFirestore} from '@angular/fire/firestore';
import {User} from '../_model/user';
import {FcmService} from './fcm.service';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {
  //variable connexion FB
  providerFb: firebase.auth.FacebookAuthProvider;

  public authentificated:boolean;

  public token:string;

  //variable de l'utilisateur en localStorage
  public localUser:User=new class implements User {
    connexionType: string;
    email: string;
    identifiant: string;
    nom: string;
    phone: any;
    photo: string;
    photoURL: string;
    prenom: string;
    sexe: string;
    uid: string;
    contacts:Array<any>;
    demandeContact:Array<any>;
  };

  constructor(private router:Router,
              private fb: Facebook,
              public afDB: AngularFireDatabase,
              private afs: AngularFirestore,
              public afAuth: AngularFireAuth,
              public platform: Platform,
              private storage:Storage,
              private fcm: FcmService,
              public toastController:ToastController,
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
    let res=await this.loadToken();
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
  private goAfterLogin(value: boolean){
    //permet de colorer la bonne icone
    this.footService.pageCible='factures';
    //On crée l'instance de création des notification pour l'user (FCM)
    if(value){
      this.notificationSetup();
    }

    //redirection
    //TODO modifier la redirection pour le test
    //value?this.router.navigateByUrl('factures'):this.router.navigateByUrl('login');
    value?this.router.navigateByUrl('factures'):this.router.navigateByUrl('login');
  }

  //sauvegarde du token de connexion
  async saveToken(token:string) {
    await this.storage.set("billaps:connected",token)
    //localStorage.setItem("connected",token);
  }

  //chargement du token de connexion
  async loadToken() {
    await this.storage.get("billaps:connected").then(async data=>{

      this.token=await data;
      if (this.token==null){
        await this.saveToken('disconnected');
        this.token=await 'disconnected';
      }
      await this.token=='connected'?this.authentificated=true:this.authentificated=false;
    });

    return  this.authentificated;
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
      console.log("response");
      console.log(response);
      const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);
      firebase.auth().signInWithCredential(facebookCredential)
          .then((success) => {
            console.log("success");
            console.log(success);
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

  async inscriptionMail(dataUser) {
    //on crée l'utilisateur dans AfAuth et on se login
    try {
      //on crée l'utilisateur
      await this.afAuth.auth.createUserWithEmailAndPassword(dataUser.email,dataUser.password);
      // on récupère les infos nouvellement créé par l'utilisateur
      this.afAuth.auth.signInWithEmailAndPassword(dataUser.email,dataUser.password).then(async data=>{
        //on sauvegarde ce nouvel utilisateur dans firestore
        await firebase.firestore().collection(`users`).add({
          uid:data.user.uid,
          nom:dataUser.nom,
          prenom:dataUser.prenom,
          sexe:dataUser.sexe,
          identifiant:dataUser.identifiant,
          phone:dataUser.phone,
          email:dataUser.email,
          connexionType:dataUser.connexionType,
          photo:null,
          photoURL:null
        });

        //on continue la connexion comme la première fois
        this.acceptedConnexion(data,'mail');
      }, err=>{
        console.log(err.code + " : " + err.message);
      });

      //dès que l'inscription a fonctionné, on le connecte
      this.loginMail(dataUser);
    } catch (e) {
      console.log("Error in inscription : "+e)
    }
  }

  /****************************************************************************************
   *   fin de connexion par mail ou facebook
   *****************************************************************************************/

  //Connexion acceptée par firebase
  async acceptedConnexion(success,methodConnexion:string){
  //async acceptedConnexion(success:UserCredential,methodConnexion:string){
    //pour voir toute les infos recu par firebase console.log('Info Firebase: ' + JSON.stringify(success));
    //on vérifie si l'utilisateur existe deja dans la base
    if(methodConnexion=='facebook') {
      await firebase.firestore().collection('users').where('email', '==', success.user.email)
          .where('connexionType', '==', 'facebook')
          .get().then(function(querySnapshot) {
            //si l'utilisateur n'existe pas dans la base, on le crée
            if (querySnapshot.docs.length == 0) {
              //il existe un identifiant, normalement pas plus de 1
              firebase.firestore().collection('users').add({
                  uid:success.user.uid,
                  nom: success.additionalUserInfo.profile.last_name,
                  prenom: success.additionalUserInfo.profile.first_name,
                  sexe:null,
                  identifiant: success.user.displayName,
                  phone: success.user.phoneNumber,
                  email: success.user.email,
                  photo:null,
                  photoURL:success.user.photoURL,
                  connexionType: 'facebook'
              });
            } else {
              //sinon, on met à jour les donées
              firebase.firestore().collection('users').doc(querySnapshot.docs[0].id).update({
                photoURL:success.user.photoURL,
                identifiant: success.user.displayName,
              });
            }
          })
          .catch(function(error) {
            console.log("Error getting documents: ", error);
          });
    } else if(methodConnexion=='mail'){
      //pas besoin car la connexion par mail ne modifie pas les données il faut passer par la poge profil
    }

    //Maintenant qu'on est authentifié auprès de firebase, on va alimenter les données dans l'application
    // on va créer l'utilisateur dans le storage avec toute ses informations
    await this.createUser(success,methodConnexion);

    // on sauve le token
    await this.saveToken("connected");
    //on se log
    this.login();

  }

  //on crée l'utilisateur dans la base de donnée
  async createUser(infos:UserCredential, methodConnexion:string){
    var localUser={
      connexionType: '',
      email: '',
      identifiant: '',
      nom: '',
      phone: '',
      photo: '',
      photoURL: '',
      prenom: '',
      sexe: '',
      contacts:Array<any>(),
      demandeContact:Array<any>(),
      uid: ''
    };

    //on récupère les infos de firestore
    localUser.uid=infos.user.uid;
    localUser.connexionType=methodConnexion;

      await firebase.firestore().collection('users').where('uid', '==', infos.user.uid)
          .get().then(function(querySnapshot) {
              //si l'utilisateur n'existe pas dans la base, on le crée
              if (querySnapshot.docs.length == 1) {
                  //on a récupérer le bon utlisateur
                  localUser.nom=querySnapshot.docs[0].data().nom;
                  localUser.prenom=querySnapshot.docs[0].data().prenom;
                  localUser.sexe=querySnapshot.docs[0].data().sexe;
                  localUser.identifiant=querySnapshot.docs[0].data().identifiant;
                  localUser.phone=querySnapshot.docs[0].data().phone;
                  localUser.email=querySnapshot.docs[0].data().email;
                  localUser.photo=querySnapshot.docs[0].data().photo;
                  localUser.photoURL=querySnapshot.docs[0].data().photoURL;
                  localUser.contacts=querySnapshot.docs[0].data().contacts?querySnapshot.docs[0].data().contacts:[];
                  localUser.demandeContact=querySnapshot.docs[0].data().demandeContact?querySnapshot.docs[0].data().demandeContact:[];
              } else {
                  console.log("on ne retrouve pas le profil avec l'id user : "+infos.user.uid)
              }
          })
          .catch(function(error) {
              console.log("Error getting documents: ", error);
          });

    //on met à jour la variable locale
    this.localUser=localUser;

    //on sauvegarde dans le storage les données de l'utilisateur
    this.storage.set("billaps:user",this.localUser);

  }

  /*****************************************************************************************
  ** Gestion du profil utilisateur
   *****************************************************************************************/
  async  updateUser(){
    //on initialise une variable locale
    var lucalUser=this.localUser;

    //on met à jour dans firebase
    await firebase.firestore().collection('users').where('uid','==',this.localUser.uid).get()
        .then(async function(querySnapshot) {
          //si l'utilisateur n'existe pas dans la base, on le crée
          if (querySnapshot.docs.length == 1) {
            //on met à jour les données de l'utilisateur dans la base firestore
            await firebase.firestore().collection('users').doc(querySnapshot.docs[0].id).update({
              nom:lucalUser.nom,
              prenom:lucalUser.prenom,
              identifiant:lucalUser.identifiant,
              email:lucalUser.email,
              phone:lucalUser.phone,
            });
          } else {
            console.log("on ne retrouve pas le profil avec l'id user : "+ this.localUser.uid)
          }
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });

    // on met à jour dans le local storage
    await this.storage.set("billaps:user",this.localUser);
  }

  /******************************************************************************************
  ** FCM notification
   ******************************************************************************************/
  //Permet d'instancier le fonctionnement des notifications
  private notificationSetup() {
    this.fcm.getToken(this.localUser.uid);
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
            console.log("message notif");
            console.log(msg);
            alert(msg)

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
