import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, NavController, Platform} from '@ionic/angular';
import {Facture} from "../_model/facture";
import {FacturesService} from "../_services/factures.service";
//import {PhotoViewer} from "@ionic-native/photo-viewer/ngx";
import {Router} from "@angular/router";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {File} from "@ionic-native/file/ngx";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer/ngx";
import {EmailComposer} from '@ionic-native/email-composer/ngx';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import {DocumentViewer, DocumentViewerOptions} from '@ionic-native/document-viewer/ngx';
import {AngularFireStorage} from '@angular/fire/storage';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-facture-detail',
  templateUrl: './facture-detail.page.html',
  styleUrls: ['./facture-detail.page.scss'],
})
export class FactureDetailPage implements OnInit {
  //facture affichée
  public facture:Facture;
  public fileTransfer:FileTransferObject = this.transfer.create();

  constructor(private navCtrl:NavController,
              private router:Router,
              private file:File,
              private transfer:FileTransfer,
              private fileOpener:FileOpener,
              public afSG: AngularFireStorage,
              public alertController: AlertController,
              public loadingController: LoadingController,
              private platform:Platform,
              private documentviewer : DocumentViewer,
              private emailComposer:EmailComposer,
              //private photoViewer:PhotoViewer,
              private facturesService:FacturesService) { }

  ngOnInit() {
    this.facture=this.facturesService.currentFacture;
  }

  back() {
    this.navCtrl.back();
  }

  openViewImage(image){
    //this.photoViewer.show(image);
  }


  getDate(date:Date) {
    return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()
  }

  // passe a la page d'édition
  edit() {
    //on affecte la valeur Edit ou type de la page newFacture
    this.facturesService.typeNewFacture='edit';
    this.facturesService.currentFacture=this.facture;
    //on affiche la page de nouvelle facture en mode modification
    this.router.navigateByUrl('facture-new');
  }

  //on ouvre le PDF
  async openPDF(){
    if(this.platform.is('cordova')){
      // on met un loader
      const loading = await this.loadingController.create({
        duration: 2000
      });
      await loading.present();

      // on va ouvrir la facture
      const options: DocumentViewerOptions = {
        title: this.facture.photoTitle,

        email: { enabled: true }
      };

      // on vérifie que la facture existe dans le téléphone
      await this.file.checkFile(this.file.externalDataDirectory, this.facture.photoTitle).then(async ()=>{
        //si le fichier existe, on l'ouvre
        await this.documentviewer.viewDocument(this.file.externalDataDirectory + this.facture.photoTitle, 'application/pdf', options);
      }, async (error) =>{
          // si la facture n'existe pas on la télécharge et on l'affiche
          await this.downloadAndShow(options);
      });

      //on ferme le loader
      await loading.onDidDismiss();
    } else {
      console.log("la facture suivante s'affiche");
      //on affiche en log le lien de la facture
      this.afSG.ref(this.facture.photoTitle).getDownloadURL().subscribe(async (value) => {
        //on affiche le lien du dl
        console.log(value)
      });
    }
  }

  sendEmail(){
    let email = {
      attachments: [
        'file:'+this.file.externalDataDirectory + this.facture.photoTitle
      ],
      subject: this.facture.title,
      body: 'Bonjour,' +
          '\n' +
          'Veuillez trouver en copie de ce mail la facture '+ this.facture.title+'.' +
          '\n' +
          'Cordialement',
      isHtml: true
    };

    this.emailComposer.open(email);

  }

  //méthode permettant de télécharger la facture et de l'afficher
  async downloadAndShow(options){
    await this.afSG.ref(this.facture.photoTitle).getDownloadURL().subscribe(async (value) => {
      //on télécharge le fichier pdf et on l'enregistre dans le téléphone
      await this.fileTransfer.download(value, this.file.externalDataDirectory + this.facture.photoTitle)
          .then(async (entry) => {
            //on ouvre maintenant le document
            console.log('download complete: ' + entry.toURL());
            await this.documentviewer.viewDocument(this.file.externalDataDirectory + this.facture.photoTitle, 'application/pdf', options);

          }, (error) => {
            // handle error
          });
    });
  }
}
