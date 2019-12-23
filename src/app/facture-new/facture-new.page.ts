import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, NavController, Platform} from '@ionic/angular';
import {Facture} from "../_model/facture";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FacturesService} from '../_services/factures.service';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import {Router} from "@angular/router";
import {File} from "@ionic-native/file/ngx";
import {FileOpener} from "@ionic-native/file-opener/ngx";
//import {DocumentScanner} from "@ionic-native/document-scanner/ngx";
import {scan} from "rxjs/operators";
//import {DocumentScannerOptions} from "@ionic-native/document-scanner";
import {AngularFireStorage} from "@angular/fire/storage";
import {constantes} from '../_model/_constantes';
import * as firebase from 'firebase/app';
//import de toutes les fonctions de PDFmake
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-facture-new',
  templateUrl: './facture-new.page.html',
  styleUrls: ['./facture-new.page.scss'],
})
export class FactureNewPage implements OnInit {
  //Initialisation des constantes
  new_item_form: FormGroup;
  public newFacture:Facture=new class implements Facture {
    idApp:number;
    emetteur: string;
    photoTitle: string;
    photos: string;
    photoType:string;
    pdfPath:string;
    pdf:any;
    pdfBlob:any;
    prixHT: number;
    prixTTC: number;
    dateAjout:Date;
    dateModif:Date;
    dateFacture:Date;
    title: string;
  };

  dataURL:any;
  docDefinition:any;
  width=null;
  height=null;
  img= new Image();
  factChange:boolean;

  public pdf=null;

  //Driss
    //adresse de stockage de l'image
    imagePath: string;
    //Stock l'avancement de l'envoi de l'image
    upload: any;

  constructor(private navCtrl:NavController,
              public constantes:constantes,
              public formBuilder:FormBuilder,
              private router:Router,
              private file:File,
              private fileOpener:FileOpener,
              //Driss
              public loadingController: LoadingController,
              public alertController: AlertController,
              public afSG: AngularFireStorage,
              //Driss
              private facturesService:FacturesService,
              //public documentScanner:DocumentScanner,
              private platform:Platform,
              private camera:Camera) {
  }

  ngOnInit() {
    //on initialise le formulaire de saisie
    this.new_item_form = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      emetteur: new FormControl('', Validators.required),
      dateFacture: new FormControl('', Validators.required),
      prixHT: new FormControl(),
      prixTTC: new FormControl()
    });


    //On regarde si on est en ajout ou en modification de facture
    if(this.facturesService.typeNewFacture=='edit'){
      //on récupère la facture
      this.newFacture=this.facturesService.currentFacture;
    }

    //on initialise la variable qui vérifie si on a changer la facture
      this.factChange=false
  }

  /*
  takePic(option){
    //camera
    //this.takePic(option);
    //document scanner
    //this.takeScan(option);
  }*/

  //Prise de photo avec la camera
  async takePic(option) {
    //on regarde si on est sur cordova ou sur le web
      if (this.platform.is('cordova')){
          //Option de l'appareil photo
          const photos: CameraOptions={
              quality:50,
              destinationType:this.camera.DestinationType.DATA_URL,
              encodingType:this.camera.EncodingType.JPEG,
              mediaType:this.camera.MediaType.PICTURE,
              sourceType:this.camera.PictureSourceType.CAMERA,
              allowEdit:true
          };

          //Option de récupération de photo depuis la gallerie
          const images: CameraOptions={
              quality:50,
              destinationType:this.camera.DestinationType.DATA_URL,
              encodingType:this.camera.EncodingType.JPEG,
              mediaType:this.camera.MediaType.PICTURE,
              sourceType:this.camera.PictureSourceType.PHOTOLIBRARY,
              allowEdit:true
          };

          if(option=='photo'){
              await this.getPicsFacture(photos);
          } else {
              await this.getPicsFacture(images);
          }
      } else {
          //depuis le web, on a de suite changer la facture
          this.factChange=true;
          // on est sur le web --> Al Bundy
          var today = new Date();
          var dateNow = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()+'_'+today.getHours()+today.getMinutes()+today.getSeconds();
          if (option=='photo'||option=='image') {
              //Al Bundy
              this.newFacture.photos = this.constantes.imageBase64facture;
              this.newFacture.photoType = 'jpeg';
              this.newFacture.photoTitle=option+'_facture_ordinateur_boulanger_'+dateNow;

              // On récupère les valeurs de l'image pour la taille ultérieurement
              this.img.src = this.newFacture.photos;

              //this.ocr();

          } else if (option=='pdf') {
              //pdf
              this.newFacture.photos=this.constantes.pdfBase64;
              this.newFacture.photoType='pdf';
              this.newFacture.photoTitle='pdf_facture_ordinateur_boulanger_'+dateNow;
          }
      }
  }


  //Permet de générer le pdf en fonction de la photo
    async generatePdf() {
        // on traite que les photos, les pdf sont déjà enregistré
        if(this.newFacture.photoType!='pdf'){
            //on récupère la taille
            this.width=this.img.width;
            this.height=this.img.height;

            //on regarde si la photo est plus grande qu'une feuille A4 et on resize
            var pageOrient;
            if (this.width>this.height){
                pageOrient='landscape';
            } else {
                pageOrient='portrait';
            }

            var topBotMargin;
            var lefRigMargin;
            if(pageOrient=='portrait'){
                if((this.width>595.28)||(this.height>841.89)){

                    if((this.width/595.28)>(this.height/841.89)){
                        this.height=this.height/(this.width/595.28);
                        this.width=595.28;
                        lefRigMargin=0;
                        topBotMargin=(841.89-this.height)/2;
                    } else {
                        this.width=this.width/(this.height/841.89);
                        this.height=841.89;
                        lefRigMargin=(595.28-this.width)/2;
                        topBotMargin=0;
                    }

                } else {
                    lefRigMargin=(595.28-this.width)/2;
                    topBotMargin=(841.89-this.height)/2;
                }
            } else {
                if((this.width>841.89)||(this.height>595.28)){

                    if((this.width/841.89)>(this.height/595.28)){
                        this.height=this.height/(this.width/841.89);
                        this.width=841.89;
                        lefRigMargin=0;
                        topBotMargin=(595.28-this.height)/2;
                    } else {
                        this.width=this.width/(this.height/595.28);
                        this.height=595.28;
                        lefRigMargin=(841.89-this.width)/2;
                        topBotMargin=0;
                    }

                } else {
                    lefRigMargin=(841.89-this.width)/2;
                    topBotMargin=(595.28-this.height)/2;
                }
            }

            //on crée la définition du document
            let docDefinition = {
                content: [
                    {
                        image: this.newFacture.photos,
                        width: this.width,
                        height: this.height
                    },
                ],
                pageSize: 'A4',
                pageMargins: [ lefRigMargin, topBotMargin, lefRigMargin, topBotMargin],
                pageOrientation: pageOrient,
            };

            this.docDefinition=docDefinition;

            this.pdf = pdfMake.createPdf(docDefinition);

            await this.pdf.getBuffer( async (buffer) =>{

                //TODO voici 2 méthodes de construction de blob, naturel et firebase, on laisse firebase pour le moment
                //la méthode firebase ne fonctionne pas donc on ne sauvegarde pas le blob, juste dans le téléphone
                //var blob = await firebase.firestore.Blob.fromUint8Array(buffer);
                var utf8 = new Uint8Array(buffer);
                var binaryArray = utf8.buffer;
                var blob = new Blob([binaryArray],{ type: 'application/pdf'});

                this.newFacture.pdfBlob = await blob;
            });

        } else {

            // decode base64 string, remove space for IE compatibility
            var binary = this.newFacture.photos;
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }


            // create the blob object with content-type "application/pdf"
            var blob = new Blob( [view], { type: "application/pdf" });
            this.newFacture.pdfBlob = blob;
        }


        //console.log(this.newFacture.photos);

        //console.log(dataUrl);
        //alert(dataUrl);
        //this.newFacture.photos=dataUrl;
    }

  async getPicsFacture(option: CameraOptions) {
    await this.camera.getPicture(option).then(data=>{
        //la facture a changé du coup
        this.factChange=true;

      let base64Image = 'data:image/jpeg;base64,' +data;

      //on met à jour l'image
      this.img.src=base64Image;

      //on affecte dans la variable photo de l'image photographiée
      this.newFacture.photos=base64Image;
      //on définit le type de la photo
      this.newFacture.photoType='jpeg';

      // on récupère la date du jour
      var today = new Date();
      var dateNow = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()+'_'+today.getHours()+today.getMinutes()+today.getSeconds();


        this.newFacture.photoTitle==null?this.newFacture.photoTitle='facture_'+dateNow:this.newFacture.photoTitle=this.newFacture.photoTitle;
    },err=>{
      console.log(err);
    })
  }

  /*
  //prise de photo avec document scanner
  //TODO: A MODIFIER POUR TESTER LE SCAN
  takeScan(){
    let opts:DocumentScannerOptions={
      sourceType : 1,
      fileName : "myfile",
      quality : 2.5,
      returnBase64 : true
    };
    this.documentScanner.scanDoc(opts).then(data=>{
        //la facture a changé du coup
        this.factChange=true;

        let base64Image = 'data:image/jpeg;base64,' +data;

        //on met à jour l'image
        this.img.src=base64Image;

        //on affecte dans la variable photo de l'image photographiée
        this.newFacture.photos=base64Image;
        //on définit le type de la photo
        this.newFacture.photoType='jpeg';

        // on récupère la date du jour
        var today = new Date();
        var dateNow = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()+'_'+today.getHours()+today.getMinutes()+today.getSeconds();


        this.newFacture.photoTitle==null?this.newFacture.photoTitle='facture_'+dateNow:this.newFacture.photoTitle=this.newFacture.photoTitle;
    },err=>{
        console.log(err);
    })
  }*/

  //cette fonction permet de créer ou de modifier une facture
  async createFacture(newFacture:Facture) {

    // on génère le pdf en fonction de l'image si on l'a changé
    if(this.factChange) {
        await this.generatePdf();
    }

    //nouvelle facture
    if(this.newFacture.idApp==null) {
      try {
        //On affecte les données à la facture
        this.newFacture.title = newFacture.title;
        this.newFacture.emetteur = newFacture.emetteur;
        this.newFacture.dateFacture = new Date(newFacture.dateFacture);
        this.newFacture.prixHT = newFacture.prixHT;
        this.newFacture.prixTTC = newFacture.prixTTC;
        var newDate=new Date();
        this.newFacture.dateAjout = newDate;
        this.newFacture.dateModif=newDate;
        this.newFacture.pdfPath=null;

        // on sauvegarde la facture
        const result = await Promise.all([this.facturesService.createNewFacture(this.newFacture,this.pdf)]);
        //on reset le formulaire
        this.new_item_form.reset();

      } catch (e) {
        console.log(e);
      }
    } else {
        //TODO : il faut vérifier que les factures n'ont pas été modifiés depuis un autre device web, comparer les date factures
        //penser a le faire quand la version web arrivera car pour le moment, si vous vous connecter à un deuxième mobile, pas traité mais pervers


      //modification de facture
      /*toutes les données dans le FormGroup sont les données modifiées
      ATTENTION : pour les données REQUIRED du form, il ne renvoit pas null mais VIDE
      */
      var dateModif = new Date();
      this.newFacture.title=(newFacture.title==null||newFacture.title=='')?this.newFacture.title:newFacture.title;
      this.newFacture.emetteur=(newFacture.emetteur==null||newFacture.emetteur=='')?
          this.newFacture.emetteur:newFacture.emetteur;
      // @ts-ignore
      this.newFacture.dateFacture=(newFacture.dateFacture==null||newFacture.dateFacture=='')?
          this.newFacture.dateFacture:(new Date(newFacture.dateFacture));
      this.newFacture.prixHT=(newFacture.prixHT==null)?this.newFacture.prixHT:newFacture.prixHT;
      this.newFacture.prixTTC=(newFacture.prixTTC==null)?this.newFacture.prixTTC:newFacture.prixTTC;
      this.newFacture.dateModif = dateModif;
      console.log("ok")
      // on sauvegarde la facture modiffiée
      const result = await Promise.all([this.facturesService.updateOneFacture(this.newFacture)]);
      //on reset le formulaire
      this.new_item_form.reset();
      // on revient à la page précédente
      this.back();
    }
  }



  //retour à la page précédente
  back() {
    this.navCtrl.back();
  }



    downloadPDF2(){
        console.log(this.platform);
        if(this.platform.is('cordova')){
            this.pdf.getBlob((blob)=>{
                this.file.writeFile(this.file.dataDirectory, 'myletter.pdf',blob,{replace: true}).then(fileEntry =>{
                    this.fileOpener.open(this.file.dataDirectory+'myletter.pdf', 'application/pdf');
                });
            });
        } else {
            this.pdf.getBlob((blob)=>{
                console.log(blob);
            })
        }
    }

    private GetDataUrl(pdf) {
        return new Promise((resolve, reject) => {
            pdf.getDataUrl(dataUrl => {
                resolve(dataUrl);
            });
        });
    }

    openPdf(){
        pdfMake.createPdf(this.docDefinition).download();

    }


    /************************************************************
     * Tuto DRISS
     ************************************************************/

    async openPicDriss(source:string){
        if (source === 'camera') {
            const cameraPhoto = await this.openCamera();
            this.newFacture.photos = 'data:image/jpg;base64,' + cameraPhoto;
        } else {
            const libraryImage = await this.openLibrary();
            this.newFacture.photos = 'data:image/jpg;base64,' + libraryImage;
        }
    }

    async openLibrary() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            targetWidth: 1000,
            targetHeight: 1000,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        };
        return await this.camera.getPicture(options);
    }

    async openCamera() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            targetWidth: 1000,
            targetHeight: 1000,
            sourceType: this.camera.PictureSourceType.CAMERA
        };
        return await this.camera.getPicture(options);
    }

    async uploadFirebase() {
        const loading = await this.loadingController.create({
            duration: 2000
        });

        this.imagePath = new Date().getTime() + '.pdf';

        await loading.present();
        this.upload = this.afSG.ref(this.imagePath).putString(this.dataURL, 'data_url');

        this.upload.then(async () => {
            await loading.onDidDismiss();
            //this.newFacture.photos = 'https://www.kasterencultuur.nl/editor/placeholder.jpg';
            const alert = await this.alertController.create({
                header: 'Félicitation',
                message: 'L\'envoi de la photo dans Firebase est terminé!',
                buttons: ['OK']
            });
            await alert.present();
        });
    }
}
