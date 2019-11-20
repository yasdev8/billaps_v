import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ContactsService} from '../_services/contacts.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  segmentTab: any;
  public chatData:Array<any>;
  public newContactData:Array<any>=[];
  public newContact=false;
  public seeNewContact:string='';
  public isToutContactCharge:boolean;
  public listeToutContacts:Array<any>=[];

  constructor(private route: Router,
              public contactsService:ContactsService) {

  }

  async ngOnInit() {
    let res = await Promise.all([this.initData()]);
    console.log(this.chatData);
  }

  ionViewWillEnter(){
    //on récupère la liste des contacts
    this.contactsService.getListeContacts();
    //on initialise la variable de chargement de l'ensemble des utilisateurs
    this.isToutContactCharge=false;

    console.log(this.contactsService.localUser.demandeContact.length)
  }

  //permet d'afficher le champ de recherche pour un nouveau contact
  searchNewContact(){
    this.newContact=!this.newContact;
  }

  //methode qui permet de lancher la recherche dès qu'une valeur est saisie
  async onInputSearch($event){
    this.newContactData=[];
    //on regarde si on a déjà chargé la liste de tous les contacts
    //TODO voir si on met cette méthode directement dès qu'on appui sur le +
    if(!this.isToutContactCharge){
      this.listeToutContacts = await this.contactsService.searchNew();
      this.isToutContactCharge=true;
    }
    //on alimente la liste des utilisateurs recherché
    this.newContactData = this.listeToutContacts.filter(e =>
        //on vérifie en fonction de l'identifiant, mail ou téléphone
        ((e.identifiant.toLowerCase().includes(this.seeNewContact.toLowerCase())||
            (e.email.toLowerCase().includes(this.seeNewContact.toLowerCase()))||
            (('0'+e.phone).toLowerCase().includes(this.seeNewContact.toLowerCase())))
        // on évite de prendre en compte son propre profil
        &&(e.email!=this.contactsService.localUser.email))
    );

    //on regarde si les utilisateurs trouvés sont déjà des amis
    await this.newContactData.forEach(async (contact)=>{
      contact.added=null;
      await this.contactsService.localUser.contacts.forEach((ami)=>{
        if(ami.email==contact.email){
          contact.added=ami.added;
        }
      })
    });
  }

  //permet d'ajouter un contact à sa liste d'ami
  ajouterContact(contact){
    //on montre la demande
    contact.added='demande';
    //on lance l'ajout via le mail
    this.contactsService.ajouterContact(contact);
  }


  async initData(){
    this.chatData = [{
      "name": 'Jovenica',
      "image": '../../assets/chat/user.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'online',
      "count": '2',
      "time":'2 min ago'

    }, {
      "name": 'Oliver',
      "image": ' ../../assets/chat/user3.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "badge":'4',
      "sendTime":'18:34',
      "group": true

    }, {
      "name": 'George',
      "image": ' ../../assets/chat/user4.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "count": '2',
      "sendTime":'18:30',
      "broadcast": true

    }, {
      "name": 'Harry',
      "image": ' ../../assets/chat/user1.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'online',
      "badge":'6',
      "sendTime":'17:55'
    }, {
      "name": 'Jack',
      "image": ' ../../assets/chat/user.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "sendTime":'17:55'
    }, {
      "name": 'Jacob',
      "image": ' ../../assets/chat/user3.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "count": '1',
      "sendTime":'17:50'
    }, {
      "name": 'Noah',
      "image": ' ../../assets/chat/user2.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "sendTime":'17:40'
    }, {
      "name": 'Charlie',
      "image": ' ../../assets/chat/user4.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'online',
      "count": '6',
      "badge":'8',
      "sendTime":'17:40'
    }, {
      "name": 'Logan',
      "image": ' ../../assets/chat/user.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "badge":'8',
      "sendTime":'17:40'
    }, {
      "name": 'Harrison',
      "image": ' ../../assets/chat/user2.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "sendTime":'17:40'
    }, {
      "name": 'Sebastian',
      "image": ' ../../assets/chat/user1.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'online',
      "sendTime":'17:40'
    }, {
      "name": 'Zachary',
      "image": ' ../../assets/chat/user4.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "sendTime":'17:40'
    }, {
      "name": 'Elijah',
      "image": ' ../../assets/chat/user3.jpeg',
      "description": ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Enim laboriosam sunt nulla minima ratione, pariatur quaerat aut ex a ullam? Officia, explicabo optio. Dolores, ab exercitationem? Neque illo soluta sapiente!',
      "status":'offline',
      "badge":'8',
      "sendTime":'17:40'
    }
    ]
  }

  segmentChanged(event: any) {
    this.segmentTab = event.detail.value;
  }
  goforChat(chat) {
    this.route.navigate(['bubble', chat]);
  }

}
