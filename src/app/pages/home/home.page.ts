import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner/ngx';
import { File } from '@ionic-native/file/ngx';
import {OCR, OCRResult, OCRSourceType} from '@ionic-native/ocr/ngx';
import {AlertController} from '@ionic/angular';
import {FootNavService} from '../../_services/foot-nav.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  doclist$: any;
  filedirs: any[] = [];
  docs: any[] = [];


  constructor(
      private router: Router,
      private docscan: DocumentScanner,
      private file: File,
      private ocr: OCR,
      public alertController: AlertController,
      public ocrserv:FootNavService

  ) {

    // this.doclist$ = this.sqldata.doclist$.subscribe((r) => this.docs = r);
    //  console.log("In Init") ;
    //  this.sqldata.getdoclist()  ;

  }
  ngOnInit() {
    this.file.listDir(this.file.externalDataDirectory, '').then((l) => {
      l = l.filter((el) => el.isDirectory);

      this.filedirs = l.sort((a, b) => {
        return a.name <= b.name ? -1 : 1;
      });
    });
  }

  showdoc(doc) {
    this.router.navigate(['/docview/' + doc.name]);
  }

  taskDate() {

    var d = new Date();
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }


  takePhoto() {
    // "" + Math.round(new Date().getTime() / 1000) ;


    //alert(this.file.externalDataDirectory) ;
    //  return ;
    let opts: DocumentScannerOptions = {};
    this.docscan.scanDoc(opts)
        .then(async (res: string) => {
          console.log(res);
          var uuid = "" + Math.round(new Date().getTime() / 1000);
          var docname = this.taskDate() + "_" + uuid;

          this.file.createDir(this.file.externalDataDirectory, docname, false).then(async (r) => {
            this.file.listDir(this.file.externalDataDirectory, '').then((l) => {
              l = l.filter((el) => el.isDirectory);

              this.filedirs = l.sort((a, b) => {
                return a.name <= b.name ? -1 : 1;
              });
            });


            let n = res.lastIndexOf("/");
            let oldpath = res.substr(0, n);
            let oldfile = res.substr(n + 1);
            let newpath = this.file.externalDataDirectory + docname;
            let newfile = "doc_" + docname + '.jpg';
            this.file.moveFile(oldpath, oldfile, newpath, newfile).then((r) => console.log("Moved"));


            const alert = await this.alertController.create({
              header: 'fichier bougé',
              message: newpath+'/'+newfile ,
              buttons: ['OK']
            });
            await alert.present();

            //test ocr
            this.ocr.recText(OCRSourceType.NORMFILEURL, newpath+'/'+newfile)
                .then(async (res: OCRResult) => {
                    console.log(JSON.stringify(res))
                  this.ocrserv.ttocr=JSON.stringify(res);
            const alert = await this.alertController.create({
              header: 'Félicitation',
              message: JSON.stringify(res),
              buttons: ['OK']
            });
            await alert.present();
                }
                )
                .catch(async (error: any) => {
                  console.error(error);
                  const alert = await this.alertController.create({
                    header: 'fichier erreur',
                    message: error ,
                    buttons: ['OK']
                  });
                  await alert.present();
                });
          });

        });
  }

  deletephoto(doc) {
    console.log(doc);
    //   this.file.removeRecursively()
    this.file.removeRecursively(this.file.externalDataDirectory, doc.name).then((r) => {


      this.file.listDir(this.file.externalDataDirectory, '').then((l) => {
        l = l.filter((el) => el.isDirectory);
        this.filedirs = l.sort((a, b) => {
          return a.name <= b.name ? -1 : 1;
        });


      });

    });

  }


}


/*import { Component, OnInit } from '@angular/core';
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

/*
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
  }*/


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

}*/
