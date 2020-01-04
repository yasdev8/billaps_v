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
import {DocumentScanner, DocumentScannerOptions} from '@ionic-native/document-scanner/ngx';
import {OCR, OCRResult, OCRSourceType} from '@ionic-native/ocr/ngx';
import {DocumentViewerOptions} from '@ionic-native/document-viewer/ngx';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-facture-new',
  templateUrl: './facture-new.page.html',
  styleUrls: ['./facture-new.page.scss'],
})
export class FactureNewPage implements OnInit {
  //Initialisation des constantes
  new_item_form: FormGroup;
  //text de l'ocr
  ocrJson:string;

  filedirs: any[] = [];
    photos = [];

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
              private docscan: DocumentScanner,
              private ocr: OCR,
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
              var uuid = "" + Math.round(new Date().getTime() / 1000);
              this.newFacture.photoTitle=this.taskDate() + "_" + uuid;

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

    async getPicsFacture(option: CameraOptions) {
        //alert(this.file.externalDataDirectory) ;
        //  return ;
        let opts: DocumentScannerOptions = {};
        //on va oublier le base64, garder que l'image et le pdf, et utiliser comme dans docView et home
        this.docscan.scanDoc(opts)
            .then(async (res: string) => {
                //la facture a changé du coup
                this.factChange=true;
                console.log(res);
                var uuid = "" + Math.round(new Date().getTime() / 1000);

                /*gestion base 64
                //on crée la data de l'image
                //let base64Image = 'data:image/jpeg;base64,' +res;

                //on met à jour l'image
                //this.img.src=base64Image;

                //on affecte dans la variable photo de l'image photographiée
                //this.newFacture.photos=base64Image;
                */

                //on définit le type de la photo
                this.newFacture.photoType='jpeg';

                //nom du fichier
                this.newFacture.photoTitle=this.taskDate() + "_" + uuid;

                //on sauvegarde la photo (à supprimer quand le pdf est généré)
                this.file.createDir(this.file.externalDataDirectory, this.newFacture.photoTitle, false).then(async (r) => {
                        this.file.listDir(this.file.externalDataDirectory, '').then((l) => {
                        l = l.filter((el) => el.isDirectory);

                        this.filedirs = l.sort((a, b) => {
                            return a.name <= b.name ? -1 : 1;
                        });
                    });

                    //si on veut créer un dossier dans lequel on mettra la facture (gerne de sous-dossier)
                    let n = res.lastIndexOf("/");
                    let oldpath = res.substr(0, n);
                    let oldfile = res.substr(n + 1);
                    let newpath = this.file.externalDataDirectory + this.newFacture.photoTitle;
                    let newfile = this.newFacture.photoTitle + ".jpg";
                    this.file.moveFile(oldpath, oldfile, newpath, newfile).then((r) => console.log("Moved"));

                    //visualiser sur le telephone
                    const alert = await this.alertController.create({
                        header: 'fichier bougé',
                        message: newpath+'/'+newfile ,
                        buttons: ['OK']
                    });
                    await alert.present();

                    //test ocr
                    this.ocr.recText(OCRSourceType.NORMFILEURL, newpath+'/'+newfile)
                        .then(async (res: OCRResult) => {
                                console.log(JSON.stringify(res));
                                //on affecte le Json de l'OCR dans la bonne variable
                                this.ocrJson=JSON.stringify(res);

                                //on envoit l'ocr dans firebase pour le travailler
                                firebase.firestore().collection('ocr').add({
                                    facture: this.newFacture.photoTitle+'.pdf',
                                    ocrJson: this.ocrJson,
                                    resulOcr: res
                                });
                            }
                        )
                        .catch(async (error: any) => {
                            console.error(error);
                        });
                });

            });





        /*
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
        })*/
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


  //Permet de générer le pdf en fonction de la photo
    async generatePdf() {
        // on traite que les photos, les pdf sont déjà enregistré
        if(this.newFacture.photoType!='pdf'){
            if(this.platform.is('cordova')) {
                //on récupère la donnée de la photo depuis le dossier qui porte le meme nom
                await this.file.listDir(this.file.externalDataDirectory, this.newFacture.photoTitle).then(async (l) => {
                    await this.file.listDir(this.file.externalDataDirectory, this.newFacture.photoTitle).then(async (l) => {

                        this.photos = await l.sort((a, b) => {
                            return a.name <= b.name ? -1 : 1;
                        });

                    });

                });

                let allp = [];
                let path = "";
                let file = "";
                let n = 0;
                await this.photos.map(async (el) => {
                    // n = el.imgurl.lastIndexOf("/");
                    path = await this.file.externalDataDirectory + this.newFacture.photoTitle;
                    file = await el.name;
                    await allp.push(this.file.readAsDataURL(path, file));
                });

                let mcontent = await [];
                let onePage = false;
                let _i = 0;

                await Promise.all(allp).then(async (values) => {
                    values.length == 1 ? onePage = true : onePage = false;

                    var topBotMargin;
                    var lefRigMargin;

                    /* avec modification des marge, a retravailler


                    values.forEach( (data) => {
                        //on récupère la taille de l'image
                        this.width=data.width;
                        this.height=data.height;
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

                        _i = _i + 1 ;
                        mcontent.push({
                            image: data,
                            width: this.width,
                            height: this.height
                        });
                        console.log(this.photos.length , _i) ;
                        if (this.photos.length > _i ) {
                            mcontent.push({text: '', pageBreak: 'before'});
                        }
                    });*/

                    await values.forEach((data) => {
                        _i = _i + 1;
                        mcontent.push({
                            image: data,
                            width: 580
                        });
                        console.log(this.photos.length, _i);
                        if (this.photos.length > _i) {
                            mcontent.push({text: '', pageBreak: 'before'});
                        }
                    });


                    var docDefinition = await {
                        pageSize: {
                            width: 595.28,
                            height: 'auto'
                        },
                        pageOrientation: 'portrait',
                        pageMargins: [0, 0, 0, 0],

                        content: mcontent
                    };

                    console.log(docDefinition);
                    this.pdf = await pdfMake.createPdf(docDefinition);

                    var imageDos = this.newFacture.photoTitle;
                    this.newFacture.photoTitle = this.newFacture.photoTitle + '.pdf';
                    this.newFacture.pdfPath = this.file.externalDataDirectory + this.newFacture.photoTitle;

                    const options: DocumentViewerOptions = {
                        title: this.newFacture.photoTitle,

                        email: {enabled: true}
                    };

                    this.pdf.getBuffer((buffer) => {
                        var blob = new Blob([buffer], {type: 'application/pdf'});

                        // Save the PDF to the data Directory of our App
                        this.file.writeFile(this.file.externalDataDirectory, this.newFacture.photoTitle, blob, {replace: true}).then(fileEntry => {

                        });

                        //On supprime la photo
                        this.file.removeDir(this.file.externalDataDirectory, imageDos);
                    });


                });
            } else {
                let allp = [];
                let pat = 'C:\\Users\\khey\\Downloads\\';
                console.log(pat)
                await allp.push(this.file.readAsDataURL(pat,'téléchargement.jpg'));

                let mcontent = await [];
                let onePage = false;
                let _i = 0;
                console.log("allp")
                console.log(allp)

                await Promise.all(allp).then(async (values) => {
                    values.length == 1 ? onePage = true : onePage = false;

                    var topBotMargin;
                    var lefRigMargin;


                    await values.forEach((data) => {
                        _i = _i + 1;
                        mcontent.push({
                            image: data,
                            width: 580.00
                        });
                        console.log(this.photos.length, _i);
                        if (this.photos.length > _i) {
                            mcontent.push({text: '', pageBreak: 'before'});
                        }
                    });


                    var docDefinition = await {
                        pageSize: {
                            width: 595.28,
                            height: 'auto'
                        },
                        pageOrientation: 'portrait',
                        pageMargins: [0, 0, 0, 0],

                        content: mcontent
                    };

                    console.log(docDefinition);
                    this.pdf = await pdfMake.createPdf(docDefinition);

                    var imageDos = this.newFacture.photoTitle;
                    this.newFacture.photoTitle = this.newFacture.photoTitle + '.pdf';
                    this.newFacture.pdfPath = 'C:\Users\khey\Downloads' + this.newFacture.photoTitle;

                    const options: DocumentViewerOptions = {
                        title: this.newFacture.photoTitle,

                        email: {enabled: true}
                    };

                    this.pdf.getBuffer((buffer) => {
                        var blob = new Blob([buffer], {type: 'application/pdf'});

                        // Save the PDF to the data Directory of our App
                        this.file.writeFile('C:\Users\khey\Downloads', this.newFacture.photoTitle, blob, {replace: true}).then(fileEntry => {

                        });
                    });

                });

            }

            /*********************************************************
             * ancienne version avec tel et ordi

            console.log("1")
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
            console.log("2")

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
            console.log("3")

            //on génère le pdf
            this.pdf = pdfMake.createPdf(docDefinition);
            console.log("4")

            //on enregistre le pdf dans le téléphone
            if (this.platform.is('cordova')){


                console.log("5")
                console.log(this.newFacture.photos)
                console.log(this.pdf)
                this.pdf.getBuffer(async (buffer) => {

                    console.log("6")
                    var blob = new Blob([buffer], { type: 'application/pdf' });
                    this.newFacture.pdfBlob=blob;
                    console.log("7")

                    //on renomme le titre de la photo
                    this.newFacture.photoTitle="doc_" + this.newFacture.photoTitle + ".pdf";
                    //on enregistre le path
                    this.newFacture.pdfPath=this.file.externalDataDirectory+this.newFacture.photoTitle;
                    console.log("8")
                    //affiche
                    const alert = await this.alertController.create({
                        header: 'path',
                        message: this.newFacture.pdfPath,
                        buttons: ['OK']
                    });
                    await alert.present();
                    console.log("9")

                    // Save the PDF to the data Directory of our App
                    this.file.writeFile(this.file.externalDataDirectory,
                        this.newFacture.photoTitle, blob, { replace: true }).then(fileEntry => {
                        console.log("10")
                            console.log("PDF file save : " + this.newFacture.photoTitle)
                    });

                    //On supprime la photo
                    this.file.removeDir(this.file.externalDataDirectory,this.newFacture.photoTitle);
                });
            }
            ** fin de l'ancienne version
             */

            //old version
            /*
            await this.pdf.getBuffer( async (buffer) =>{

                //TODO voici 2 méthodes de construction de blob, naturel et firebase, on laisse firebase pour le moment
                //la méthode firebase ne fonctionne pas donc on ne sauvegarde pas le blob, juste dans le téléphone
                //var blob = await firebase.firestore.Blob.fromUint8Array(buffer);
                var utf8 = new Uint8Array(buffer);
                var binaryArray = utf8.buffer;
                var blob = new Blob([binaryArray],{ type: 'application/pdf'});

                this.newFacture.pdfBlob = await blob;
            });*/

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
        //sert dans le cas ou il n'y a pas de pdfPath
        this.newFacture.pdfPath==null?this.newFacture.pdfPath=null:this.newFacture.pdfPath=this.newFacture.pdfPath;

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
