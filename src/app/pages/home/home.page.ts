import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import {AngularFireDatabase} from "@angular/fire/database";
import {Platform} from "@ionic/angular";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {File} from "@ionic-native/file/ngx";


import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  items: Array<any>;

  letterObj={
    from:'yass',
    to:'esma',
    text:"je cherche du boulot et c'est pas facile"
  };

  pdfObj=null;

  constructor(
    private router: Router,
    public afDB: AngularFireDatabase,
    public itemService: ItemService,
    private platform:Platform,
    private file:File,
    private fileOpener:FileOpener,
  ){}

  ngOnInit(){
    this.items = this.itemService.getItems();
  }

  add() {
    this.afDB.list('Users').push({
      pseudo: 'yassine'
    });
  }

  /*
  PDF
   */


  createPDF(){
    var docDefinition={
      content: [
        { text: 'REMINDER', style: 'header'},
        { text: new Date().toTimeString(), alignment: 'right'},

        { text: 'From', style: 'subheader'},
        { text: this.letterObj.from},

        { text: 'To', style: 'subheader'},
        { text: this.letterObj.to},

        { text: this.letterObj.text, style: 'story', margin: [0,20,0,20]},

        {
          ul: [
            'Bacon',
              'Rips',
              'BBQ',
          ]
        }
      ],
      styles: {
        header: {
          fontSize:18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0,15,0,0]
        },
        story: {
          italic: true,
          alignment: 'center',
          width: '50%'
        }
      }
    };

    this.pdfObj = pdfMake.createPdf(docDefinition);

  }

  downloadPDF(){
    if(this.platform.is('cordova')){
      this.pdfObj.getBuffer((buffer) =>{
        var utf8 = new Uint8Array(buffer);
        var binaryArray = utf8.buffer;
        var blob = new Blob([binaryArray],{ type: 'application/pdf'});

        this.file.writeFile(this.file.dataDirectory, 'myletter.pdf',blob,{replace: true}).then(fileEntry =>{
          this.fileOpener.open(this.file.dataDirectory+'myletter.pdf', 'application/pdf');
        })
      })
    } else {
      this.pdfObj.getBuffer((buffer) =>{
        var utf8 = new Uint8Array(buffer);
        var binaryArray = utf8.buffer;
        var blob = new Blob([binaryArray],{ type: 'application/pdf'});

        //console.log(blob);
        this.pdfObj.open();
      })
    }
  }

  downloadPDF2(){
    console.log(this.platform);
    if(this.platform.is('cordova')){
      this.pdfObj.getBlob((blob)=>{
        this.file.writeFile(this.file.dataDirectory, 'myletter.pdf',blob,{replace: true}).then(fileEntry =>{
          this.fileOpener.open(this.file.dataDirectory+'myletter.pdf', 'application/pdf');
        });
      });
    } else {
      this.pdfObj.getBlob((blob)=>{
        console.log(blob);
      })
    }
  }


  /*
  blob to base64



  downloadBlobToPDF(){
    let downloadPDF: any = 'W0JFR0lOXQolUERGLTEuMgp6R1/V+d9KpBi3sCNzNh…….';
        fetch('data:application/pdf;base64,' + downloadPDF,
            {
              method: "GET"
            }).then(res => res.blob()).then(blob => {
          this.file.writeFile(this.file.externalApplicationStorageDirectory, 'statement.pdf',
              blob, { replace: true }).then(res => {
            this.fileOpener.open(
                res.toInternalURL(),
                'application/pdf'
            ).then((res) => {

            }).catch(err => {
              console.log('open error');
            });
          }).catch(err => {
            console.log('save error');
          });
        }).catch(err => {
          console.log('error');
        });
  }
  */
}
