import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/database";

@Component({
  selector: 'app-test-chat',
  templateUrl: './test-chat.page.html',
  styleUrls: ['./test-chat.page.scss'],
})
export class TestChatPage implements OnInit {
  messageText:any;
  userId:any=1;
  messages=[];

  constructor(
      public afDB: AngularFireDatabase
  ) {
    //au lancement de la page, on execute getMessages
    this.getMessages();
  }

  ngOnInit() {
  }

  sendMessage(){
    console.log("messageText : "+this.messageText);
    this.afDB.list('Messages/').push({
      text:this.messageText,
      userId: this.userId,
      date: new Date().toISOString()
    });
    this.messageText='';
  }

  getMessages(){
    //snapshot se lance dès qu'il y a un changement dans la base firebase
    this.afDB.list('Messages/').snapshotChanges(['child_added']).subscribe(actions=>{
      //on réinitialise la variable car les messages vont tous arriver ce qui va générer des messages en double
      this.messages=[];
      actions.forEach(action=>{
        //on liste tout les messages
        //console.log("messagesText env : "+action.payload.exportVal().text);
        this.messages.push({
          text: action.payload.exportVal().text,
          userId: action.payload.exportVal().userId,
          date: action.payload.exportVal().date
        })
      });
    });
  }
}
