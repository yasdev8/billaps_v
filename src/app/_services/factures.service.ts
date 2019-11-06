import { Injectable } from '@angular/core';
import {Storage} from "@ionic/storage";
import {Facture} from "../_model/facture";
import {FacturesArbreYear,FacturesArbreMonth} from "../_model/facturesArbre";
import {AlertController, LoadingController, Platform} from '@ionic/angular';
import {File} from "@ionic-native/file/ngx";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {AngularFireStorage} from "@angular/fire/storage";
import {Router} from '@angular/router';
import {forEach} from '@angular-devkit/schematics';
import {OrderPipe} from 'ngx-order-pipe';
import {test} from '@angular-devkit/core/src/virtual-fs/host';

@Injectable({
  providedIn: 'root'
})
export class FacturesService {
  //liste des factures
  public factures:Array<Facture>=[];
  //liste des factures triées par mois/année
  public facturesArbre:Array<FacturesArbreYear>=[];
  //facture sélectionnée
  public currentFacture:Facture;
  //paramètres d'où on appelle la page newFacture
  public typeNewFacture:string;
  //Data URL du pdf à enregistrer
  dataURL:any;
  //type d'affichage des factures
  public typeAffichage:string;
  //ordre de l'affichage
  public orderAffichage:string;


  constructor(
      private storage:Storage,
      private file:File,
      private fileOpener:FileOpener,
      private router:Router,
      public loadingController: LoadingController,
      public afSG: AngularFireStorage,
      public alertController: AlertController,
      private platform:Platform,
      private orderPipe:OrderPipe
      ) { }

  //on récupère la liste des factures stockées en bdd appli (lancé à l'ouverture)
  async getFactures(){
    //on récupère le type d'affichage
    await this.storage.get("billaps:typeAffichage").then(data=>{
      this.typeAffichage=(data!=null?data:'listeDateAjout');
      if(data==null){
        this.storage.set("billaps:typeAffichage",this.typeAffichage);
      }
    });

    //on récupère l'ordre d'affichage
    await this.storage.get("billaps:orderAffichage").then(data=>{
      this.orderAffichage=(data!=null?data:'desc');
      if(data==null){
        this.storage.set("billaps:orderAffichage",this.orderAffichage);
      }
    });

    // on récupère les factures ou on initialise les factures
    return this.storage.get("billaps:factures").then(async data=>{
      this.factures=(data!=null?data:[]);

      //on construit l'arbre des données si l'affichage est en arbre
      if((this.typeAffichage=='arbreDateAjout')||(this.typeAffichage=='arbreDateFacture')){
        this.facturesArbre = await this.alimenteArbre(this.typeAffichage);
      } else {
        this.facturesArbre=null;
      }

      //on ordonne les factures
      await this.orderFactures();

      //on retourne les factures
      return this.factures.slice();
    });
  }

  async createNewFacture(newFacture:Facture, pdf){
    //Sauvegarde FireBase
    //On sauvegarde le pdf dans le système et dans firebase
    if(this.platform.is('cordova')){
        //on sauvegarde le fichier dans le tel puis on l'envoi à firebase
        console.log('this.file.dataDirectory = '+this.file.dataDirectory);
        await this.file.writeFile(this.file.dataDirectory, newFacture.photoTitle+'.pdf',newFacture.pdfBlob,{replace: true})
            .then(async fileEntry =>{
            newFacture.pdfPath=this.file.dataDirectory+newFacture.photoTitle+'.pdf';
            console.log("enregistr : "+newFacture.pdfPath);
        });

        console.log("avant firebase");
      await this.uploadFirebasePdf(newFacture, pdf);
    } else {
      if (newFacture.photoType!='pdf'){
        //si le document était initialement une photo
        pdf.getBase64(async (data) => {
          newFacture.photos = 'data:application/pdf;base64,' + data;

          //on sauvegarde le fichier dans fireBase
          await this.uploadFirebasePdf(newFacture, pdf);
        });
      } else {
        // si le document était initialement un pdf
        //on sauvegarde le fichier dans fireBase
        this.uploadFirebasePdf(newFacture,pdf);
      }
    }

    //on crée l'id de la facture
    await Promise.all([this.storage.get("billaps:maxIdFacture").then(data=>{
      //cas ou pas de maxId donc pas de facture
      if(data==null){
        newFacture.idApp=1;
        this.storage.set("billaps:maxIdFacture",1);
      } else {
        newFacture.idApp=data+1;
        this.storage.set("billaps:maxIdFacture",data+1);
      }

      //permet d'ajouter la facture au début de la liste des factures
      this.factures.unshift(newFacture);
      this.storage.set("billaps:factures",this.factures);
    })]);

    //l'enregistrement est terminé, on retourne à la page facture
    this.router.navigateByUrl('factures');
  }

  async uploadFirebasePdf(newFacture:Facture, pdf) {
    const loading = await this.loadingController.create({
      duration: 2000
    });

    const imagePath = newFacture.photoTitle + '.pdf';

    console.log("tout va bien");
    if(newFacture.photoType=='pdf'){
      //si c'était deja un pdf à la base, on a déja la data
      this.dataURL = newFacture.photos;
    } else {
      //Si c'était une photo, on récupère le dataUrl
      this.dataURL =  await this.GetDataUrl(pdf);
      console.log("dataUrl ok");
    }

    await loading.present();
     this.afSG.ref(imagePath).putString(this.dataURL, 'data_url').then(async () => {
      await loading.onDidDismiss();
      const alert = await this.alertController.create({
        header: 'Félicitation',
        message: 'L\'envoi de la photo dans Firebase est terminé!',
        buttons: ['OK']
      });
      await alert.present();

    });
  }

  //permet d'avoir les données URL du pdf
  private GetDataUrl(pdf) {
    return new Promise((resolve, reject) => {
      pdf.getDataUrl(dataUrl => {
        resolve(dataUrl);
      });
    });
  }

  //permet de mettre à jour la liste des factures en base
  public updateFactures(factures: Array<Facture>) {
    this.factures=factures;
    try {
      this.storage.set("billaps:factures", this.factures);
    } catch (e) {
      console.log(e);
    }
  }

  //permet de mettre à jour une facture en base
  async updateOneFacture(facture: Facture) {
    // on récupère la position de la facture et on la met à jour dans la liste
    let index=this.factures.indexOf(facture);
    this.factures[index]=facture;
    // on sauvegarde en base la liste des factures
    try {
      const test = await Promise.all([this.storage.set("billaps:factures", this.factures).then(data=>{
        return "ok"
      },err=>{
        console.log(err);
      })
      ]);
    } catch (e) {
      console.log(e);
    }
  }

  deleteFacture(facture: Facture) {
    //on supprime le fichier de firebase
    //this.afSG.ref(facture.photoTitle + '.pdf').delete();
  }

  /*
  Le but de cette fonction est d'alimenter les données de factures dans l'arbre
   */
  alimenteArbre(typeAffichage:string){
    var year:number;
    var month:string;
    var monthNum:number;
    //on initialise les variables
    const facturesArbre:Array<FacturesArbreYear>=[];

    //on parcours les factures
    for (var i = 0; i<this.factures.length;i++){
      var item = this.factures[i];

      // on classe en fonction du type d'affichage
      if(typeAffichage=='arbreDateAjout'){
        year=item.dateAjout.getFullYear();
        monthNum=item.dateAjout.getMonth()+1;
      } else if(typeAffichage=='arbreDateFacture'){
        year=item.dateFacture.getFullYear();
        monthNum=item.dateFacture.getMonth()+1;
      }

      //on récupère le mois en string
      month=(monthNum==1?'Janvier':(monthNum==2?'Février':(monthNum==3?'Mars':(monthNum==4?'Avril':
          (monthNum==5?'Mai':(monthNum==6?'Juin':(monthNum==7?'Juillet':(monthNum==8?'Août':
              (monthNum==9?'Septembre':(monthNum==10?'Octobre':(monthNum==11?'Novembre':'Décembre')))))))))));

      // on regarde si l'année existe
      var indexAnnee = facturesArbre.findIndex(i=>i.yearNum===year);

      if(indexAnnee==-1){
        //si elle n'existe pas, on crée l'année
        facturesArbre.push({yearNum:year,liste:[{month:month,monthNum:monthNum,listFactures:[item]}]});
      } else {

          //l'année existe, on vérifie si le mois existe
          var indexMois = facturesArbre[indexAnnee].liste.findIndex(i=>i.monthNum===monthNum);

          if(indexMois==-1){
            // le mois n'existe pas
            facturesArbre[indexAnnee].liste.push({month:month,monthNum:monthNum,listFactures:[item]});
          } else {
            //le mois existe
            facturesArbre[indexAnnee].liste[indexMois].listFactures.push(item);
          }
      }
    }

    return facturesArbre;
  }

  // cette méthode permet d'ordoner les factures pour l'affichage de la liste des factures
  private orderFactures() {
    var tri:string;
    var ordre:boolean;

    if ((this.typeAffichage == 'listeDateAjout')||(this.typeAffichage == 'arbreDateAjout')) {
      tri='dateAjout';
    } else if ((this.typeAffichage == 'listeDateFacture')||(this.typeAffichage == 'arbreDateFacture')) {
      tri='dateFacture';
    }

    if (this.orderAffichage == 'asc'){
      ordre=false;
    } else {
      ordre=true;
    }


    //on ordonne les factures affichées
    if ((this.typeAffichage == 'listeDateAjout')||(this.typeAffichage == 'listeDateFacture')) {
      this.factures = this.orderPipe.transform(this.factures, tri, ordre);
    } else if ((this.typeAffichage == 'arbreDateAjout')||(this.typeAffichage == 'arbreDateFacture')) {

      //on ordonne les factures en arbres
      for(var y;y<this.facturesArbre.length;y++){
        //pour chaque mois
        for(var m;m<this.facturesArbre[y].liste.length;m++){
          //facture
          this.facturesArbre[y].liste[m].listFactures=this.orderPipe.transform(this.facturesArbre[y].liste[m].listFactures, tri, ordre);
        }

        this.facturesArbre[y].liste = this.orderPipe.transform(this.facturesArbre[y].liste, 'monthNum', ordre);
      }

      this.facturesArbre = this.orderPipe.transform(this.facturesArbre, 'yearNum', ordre);
    }

  }

  async raffraichirAffichage(typeAffichage:string,orderAffichage:string){
    // on met à jour les variables locales et en localStorage
    this.typeAffichage=typeAffichage;
    this.storage.set("billaps:typeAffichage",typeAffichage);
    this.orderAffichage=orderAffichage;
    this.storage.set("billaps:orderAffichage",orderAffichage);

    //si on passe dans le cas d'un arbre, il faut alimente l'arbre
    if ((typeAffichage == 'arbreDateAjout')||(typeAffichage == 'arbreDateFacture')) {
      this.facturesArbre= await  this.alimenteArbre(typeAffichage);
    }

    //maintenant que nous avons les données, on ordonne les données :
    await this.orderFactures();
  }
}
