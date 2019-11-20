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
        demandeContact:Array<any>;
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

      //on met à jour dans firebase
      //TODO : il faut récupérer tous les utilisateurs et ensuite trier le json et garder que ce que l'on veut
      await firebase.firestore().collection('users')
          .get()
          .then(async function(querySnapshot) {
              //on récupère la liste des utilisateurs
              await querySnapshot.docs.forEach(function (doc){
                    listeContacts.push({id:doc.data().id,identifiant:doc.data().identifiant,
                    email:doc.data().email,phone:doc.data().phone})
              });
          })
          .catch(function(error) {
              console.log("Error getting documents: ", error);
          });

      return listeContacts;
  }

  //permet d'ajouter un contact
  async ajouterContact(contact){
      var newContact:any;

        await firebase.firestore().collection('users')
            .where('email','==',contact.email)
            .get()
            .then(async function(querySnapshot) {
                //on récupère l'utilisateur et on l'ajoute à la liste d'amis
                if(querySnapshot.docs.length==1){
                    newContact = await querySnapshot.docs[0].data();
                    //on ajoute le type de demande
                    newContact.added=contact.added;
                    newContact.contacts=null;
                    newContact.demandeContact=null;
                } else {
                    console.log("email non unique lors de l'ajout à un contact : "+querySnapshot.docs);
                }
            })
            .catch(function(error) {
                console.log("Error getting email to add user : ", error);
            });

        //on l'ajoute en local
      this.localUser.contacts.push(newContact);

      // on l'ajoute dans l'objet dans les différente base
      this.ajoutContactBase(newContact);
  }

  //permet de mettre à jour toute les base de l'ajout d'un nouveau contact
    async ajoutContactBase(newContact){
      var contacts=this.localUser.contacts;

      //on met à jour la variable locale
      this.authService.localUser.contacts=await this.localUser.contacts;

      //on met à jour dans le local storage
      await this.storage.set("billaps:user",this.authService.localUser);

      // on met à jour dans firestore() la demande d'ami
        firebase.firestore().collection('users')
            .where('email','==',this.authService.localUser.email)
            .get()
            .then(async function(querySnapshot) {
                //on récupère l'utilisateur et on l'ajoute à la liste d'amis
                if(querySnapshot.docs.length==1){
                    //on met à jour la liste des contacts
                    firebase.firestore().collection('users').doc(querySnapshot.docs[0].id)
                        .update({
                            contacts:contacts
                        });

                    var demandeListe=[];
                    //on renseigne les données de l'utilisateur
                    var userData=querySnapshot.docs[0].data();
                    // pas besoin de fournir les informations des autres utilisateurs
                    userData.contacts=null;
                    userData.demandeContact=null;
                    //on met à jour dans firestore pour l'ami pour dire qu'il a une demande
                    firebase.firestore().collection('users')
                        .where('email','==',newContact.email)
                        .get()
                        .then(async function(querySnapshot) {
                            //on récupère l'utilisateur et on lui spécifie qu'il a une demande
                            if(querySnapshot.docs.length==1){
                                //on met à jour la liste des contacts
                                querySnapshot.docs[0].data().demandeContact!=null?demandeListe=querySnapshot.docs[0].data().demandeContact:demandeListe=[];
                                //on ajoute à la liste de demande la demande que l'on vient de faire
                                demandeListe.unshift(userData);
                                firebase.firestore().collection('users').doc(querySnapshot.docs[0].id)
                                    .update({
                                        demandeContact:demandeListe
                                    })
                            } else {
                                console.log("email non unique lors de l'ajout d'un contact à un user: "+querySnapshot.docs);
                            }
                        })
                        .catch(function(error) {
                            console.log("Error getting email to add user : ", error);
                        });




                } else {
                    console.log("email non unique lors de l'ajout d'un contact à un user: "+querySnapshot.docs);
                }
            })
            .catch(function(error) {
                console.log("Error getting email to add user : ", error);
            });



        //TODO envoyer la notification au contact pour dire qu'il a une demande
    }
}
