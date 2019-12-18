import { Component, OnInit } from '@angular/core';
import {NavController, Platform} from '@ionic/angular';
import {Facture} from "../_model/facture";
import {FacturesService} from "../_services/factures.service";
//import {PhotoViewer} from "@ionic-native/photo-viewer/ngx";
import {Router} from "@angular/router";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {File} from "@ionic-native/file/ngx";
import {EmailComposer} from '@ionic-native/email-composer/ngx';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-facture-detail',
  templateUrl: './facture-detail.page.html',
  styleUrls: ['./facture-detail.page.scss'],
})
export class FactureDetailPage implements OnInit {
  //facture affichée
  public facture:Facture;

  constructor(private navCtrl:NavController,
              private router:Router,
              private file:File,
              private fileOpener:FileOpener,
              private platform:Platform,
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
      //On vérifie que la facture est bien sur le téléphone et non seulement dans le cloud
      if(this.facture.pdfPath==null){
        //on doit créer la facture en local
        let path = await this.facturesService.importPdfFactureFromFirebase(this.facture.photoTitle);
        //on met à jour la facture dans la liste des factures ainsi que la path des facture dans le device
        let index=await this.facturesService.factures.indexOf(this.facture);
        this.facture.pdfPath=await path;
        this.facturesService.factures[index].pdfPath=await path
      }
      //Permet d'ouvrir le pdf en utilisant le chemin de la facture sur le téléphone
      this.fileOpener.open(this.facture.pdfPath, 'application/pdf');
    } else {
      alert("le pdf s'affiche normalement ... ")
    }
  }

  sendEmail(){
    let email = {
      attachments: [
        'file:'+this.facture.pdfPath+'.pdf'
      ],
      subject: this.facture.title,
      body: 'Bonjour,' +
          '' +
          'Veuillez trouver en copie de ce mail la facture '+ this.facture.title+'.' +
          '' +
          'Cordialement',
      isHtml: true
    };

    this.emailComposer.open(email);

  }
}
