import { Injectable } from '@angular/core';
import {User} from '../_model/user';
import {Storage} from '@ionic/storage';
import {AuthentificationService} from './authentification.service';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

    // on récupère la variable de l'utilisateur
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
    };

  constructor(
      private storage:Storage,
      public authService:AuthentificationService
      ) {

  }

  //on récupère la liste des contacts
  getListeContacts() {
      this.localUser=this.authService.localUser;
  }

  //on récupère la liste des contacts
  async searchNew() {
      var listeContacts:Array<any>=[];

      console.log("on va chercher");

      //on met à jour dans firebase
      //TODO : il faut récupérer tous les utilisateurs et ensuite trier le json et garder que ce que l'on veut
      await firebase.firestore().collection('users')
          .get()
          .then(async function(querySnapshot) {
              //on récupère la liste des utilisateurs
              await querySnapshot.docs.forEach(function (doc){
                    listeContacts.push({id:doc.data().id,identifiant:doc.data().identifiant})
              });
              console.log("on a trouv")
              console.log(listeContacts)
          })
          .catch(function(error) {
              console.log("Error getting documents: ", error);
          });

      return listeContacts;
  }
}
