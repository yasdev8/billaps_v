import { Component, OnInit } from '@angular/core';
import {AuthentificationService} from '../_services/authentification.service';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {User} from '../_model/user';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.page.html',
  styleUrls: ['./inscription.page.scss'],
})
export class InscriptionPage implements OnInit {

  //variable user
  dataUser={
    nom:'',
    prenom:'',
    identifiant:'',
    sexe:'',
    phone:'',
    email:'',
    password:'',
    password2:'',
    connexionType:'mail'
  };
  public sexe:string;

  //variable messageErr
  messErr:string=null;
  step:number=0;

  constructor(
      private authService:AuthentificationService,
      private router:Router,
      ) {
    this.sexe="M";
  }

  ngOnInit() {
  }

  //on lance l'inscription de l'utilisateur via son mail
  async InscriptionMail() {
    //on vérifie que les données entrées sont correctes
    let checkD = await this.checkData();


    //Si tout est ok, on lance l'inscription
    if(checkD){
      //on ajoute le sexe
      this.dataUser.sexe=this.sexe;
      //on lance l'inscription
      this.authService.inscriptionMail(this.dataUser);
    } else{
      if(this.step==1){
        this.messErr="L'identifiant existe déjà";
      } else if(this.step==2){
        this.messErr="L'email existe déjà";
      }
    }

    console.log(checkD);
    console.log(this.messErr);
    /*
    firebase.firestore().collection(`/users`).add({
      nom:'khel',
      prenom:'yass',
      identifiant:'yastes',
      email:'yasdeb8@gmail.com',
      password:'897444564987'
    });


    this.authService.inscriptionMail(this.dataUser);
    //on réinitialise le formulaire
    this.dataUser={
      nom:'',
      prenom:'',
      identifiant:'',
      email:'',
      password:''
    };*/
  }

  //permet de vérifier les données renseignées
  async checkData(){
    var check:boolean=true;
    var step:number=0;
    this.messErr=null;


    //on vérifie que les données sont bien renseignées
    if((this.dataUser.email=='')||(this.dataUser.password=='')||(this.dataUser.password2=='')){
      this.messErr="des données sont manquantes";
      check=false;
    }

    //on vérifie que le mot de passe est correcte
    if(this.dataUser.password!=this.dataUser.password2){
      this.messErr="Les mot de passe saisis sont différents";
      check=false;
    }

    //on vérifie que le mot de passe possède bien au moins 6 caractère
    if(this.dataUser.password.length<6){
      this.messErr="Le mot de passe doit contenir au moins 6 caractères";
      check=false;
    }

    //on vérifie que l'identifiant ou le mail n'existe pas deja
    //identifiant
    await firebase.firestore().collection('users').where('identifiant','==',this.dataUser.identifiant)
        .where('connexionType','==','mail')
        .get().then(function(querySnapshot) {
      if(querySnapshot.docs.length>0){
        //il existe un identifiant, normalement pas plus de 1
        step=1;
        check=false;
      }
    })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });

    //mail
    await firebase.firestore().collection('users').where('email','==',this.dataUser.email)
        .where('connexionType','==','mail')
        .get().then(function(querySnapshot) {
      if(querySnapshot.docs.length>0){
        //il existe un identifiant, normalement pas plus de 1
        step=2;
        check=false;
      }
    })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });

    //si jusqu'ici, pas de retour, nous avons passé tous les tests
    this.step=step;
    return check;
  }

  annuler(){
    this.router.navigateByUrl('login');
  }
}
