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
import {AuthentificationService} from './authentification.service';
import * as firebase from 'firebase/app';

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
  //Filtre d'affichage des factures
  public filterAffichage:string;
  //ordre de l'affichage
  public orderAffichage:string;
  //date de mise à jour des factures
  public facturesDate:Date;


  constructor(
      private storage:Storage,
      private file:File,
      private fileOpener:FileOpener,
      private router:Router,
      public loadingController: LoadingController,
      public afSG: AngularFireStorage,
      public alertController: AlertController,
      private platform:Platform,
      private orderPipe:OrderPipe,
      public authService:AuthentificationService
      ) { }

  //on récupère la liste des factures stockées en bdd appli (lancé à l'ouverture)
  async getFactures() {
    //on récupère le type d'affichage
    await this.storage.get("billaps:typeAffichage").then(data => {
      this.typeAffichage = (data != null ? data : 'liste');
      if (data == null) {
        this.storage.set("billaps:typeAffichage", this.typeAffichage);
      }
    });

    //on récupère le filtre d'affichage
    await this.storage.get("billaps:filterAffichage").then(data => {
      this.filterAffichage = (data != null ? data : 'dateAjout');
      if (data == null) {
        this.storage.set("billaps:filterAffichage", this.filterAffichage);
      }
    });

    //on récupère l'ordre d'affichage
    await this.storage.get("billaps:orderAffichage").then(data => {
      this.orderAffichage = (data != null ? data : 'desc');
      if (data == null) {
        this.storage.set("billaps:orderAffichage", this.orderAffichage);
      }
    });

    // on regarde si la date de mise à jour des factures est en accord avec firebase
    await this.storage.get("billaps:factures:date:" + this.authService.localUser.uid).then(data => {
      this.facturesDate = data;
    });
    // on regarde la date dans firebase
    var dateFirebase;
    await firebase.firestore().collection('factures')
        .where('uid', '==', this.authService.localUser.uid)
        .get().then(async function(querySnapshot) {
      //on récupère la date
      if (querySnapshot.docs.length == 1) {
        dateFirebase = await querySnapshot.docs[0].data().lastDate.toDate();
      }
    })
        .catch(function(error) {
          console.log("Error get date facture firebase : ", error);
        });

    //on compare les dates
    if (this.facturesDate != dateFirebase) {
      //si nous avons des dates différentes, on traite


      // Gestion des factures depuis Firebase
      var uid = this.authService.localUser.uid;
      var lastDate = new Date();
      var store = this.storage;
      var facturesDate;
      var tempFactures=[];
      // on récupère les valeurs
      await this.storage.get("billaps:factures:" + uid).then(async data => {
        tempFactures = await (data != null ? data : []);
      });
      await this.storage.get("billaps:factures:date:" + uid).then(async data => {
        facturesDate = await data;
      });

      tempFactures=await this.changeBlobFirestore(tempFactures);
      //on récupère la liste des factures depuis le cloud
      firebase.firestore().collection('factures')
          .where('uid', '==', uid)
          .get().then(async function(querySnapshot) {
        //si l'utilisateur n'existe pas dans la base, on le crée
        if (querySnapshot.docs.length == 0) {
          //on regarde si des factures sont présent sur le téléphone


          //il existe un identifiant, normalement pas plus de 1
          firebase.firestore().collection('factures').add({
            uid: uid,
            lastDate: lastDate,
            factures: tempFactures
          });
          // et on oublie pas de mettre a jour la date dans le téléphone
          facturesDate = lastDate;
          await store.set("billaps:factures:date:" + uid, lastDate);

        } else if (querySnapshot.docs.length == 1) {
          // on regarde la date de mise à jour depuis le cloud ou le telephone
          var dateFactTel:Date;
          await store.get("billaps:factures:date:" + uid).then(async data => {
            dateFactTel = await data;
          });
          // on compare les date
          if ((dateFactTel == null) || (dateFactTel.getTime() < querySnapshot.docs[0].data().lastDate.toDate().getTime())) {
            //s'il n'y a pas de date dans le téléphone ou si les factures dans le cloud sont plus récentes
            await store.set("billaps:factures:date:" + uid, querySnapshot.docs[0].data().lastDate.toDate());
            await store.set("billaps:factures:" + uid, querySnapshot.docs[0].data().factures);

          } else if (dateFactTel.getTime() > querySnapshot.docs[0].data().lastDate.toDate().getTime()) {
            // si les factures dans le téléphone sont plus récentes
            var ttFactures;
            //on récupère les factures dans le téléphones
            await store.get("billaps:factures:" + uid).then(async data => {
              ttFactures = await (data != null ? data : []);
            });
            //on met à jour dans firebase
            firebase.firestore().collection('factures').doc(querySnapshot.docs[0].id).update({
              lastDate: dateFactTel,
              //TODO remettre les factures une fois corrigé
              //factures: ttFactures
            });

          } else if (dateFactTel.getTime() == querySnapshot.docs[0].data().lastDate.toDate().getTime()) {
            // si nous avons les memes dates donc les meme factures
            // Il n'y a rien à faire
          }
        }
      })
          .catch(function(error) {
            console.log("Error update factures firebase : ", error);
          });

      //on n'oubli pas de mettre a jour facturesDate car dans la boucle firebase, on a utilisé une variable
      this.facturesDate=facturesDate;
    }

    // on récupère les factures ou on initialise les factures
    return this.storage.get("billaps:factures:"+this.authService.localUser.uid).then(async data=>{
      this.factures=(data!=null?data:[]);

      //on construit l'arbre des données si l'affichage est en arbre
      if(this.typeAffichage=='arbre'){
        this.facturesArbre = await this.alimenteArbre(this.typeAffichage, this.filterAffichage);
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

    var dateUpdate = new Date();
    //on crée l'id de la facture
    await Promise.all([this.storage.get("billaps:maxIdFacture").then(async data=>{
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
      //on doit ré-arranger les factures pour l'affichage
      //on construit l'arbre des données si l'affichage est en arbre
      if(this.typeAffichage=='arbre'){
        this.facturesArbre = await this.alimenteArbre(this.typeAffichage, this.filterAffichage);
      } else {
        this.facturesArbre=null;
      }
      //on ordonne les factures
      await this.orderFactures();

      this.storage.set("billaps:factures:"+this.authService.localUser.uid,this.factures);

      // on met à jour la date d'update des factures
      await this.storage.set("billaps:factures:date:" + this.authService.localUser.uid,dateUpdate);
    })]);


    //on met à jour la liste des factures
    var tempFactures;
    await this.storage.get("billaps:factures:" + this.authService.localUser.uid).then(async data => {
      tempFactures = await data;
    });
    //on les vide des blob et photo
    tempFactures=await this.changeBlobFirestore(tempFactures);

    //on regarde si les factures existe
    var uid= await this.authService.localUser.uid;
    firebase.firestore().collection('factures').where('uid','==',uid)
        .get().then(async function(querySnapshot) {
      //on récupère la liste des factures
      if (querySnapshot.docs.length == 1) {
        //on met à jour la liste
        firebase.firestore().collection('factures').doc(querySnapshot.docs[0].id).update({
          factures:tempFactures,
          lastDate:dateUpdate
        });
      } else if (querySnapshot.docs.length == 0) {
        //on ajoute la première facture
        firebase.firestore().collection('factures').add({
          uid: uid,
          lastDate: dateUpdate,
          factures: tempFactures
        });
      }
    })
        .catch(function(error) {
          console.log("Error add new factures : ", error);
        });


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
      this.storage.set("billaps:factures:"+this.authService.localUser.uid, this.factures);
    } catch (e) {
      console.log(e);
    }
  }

  //permet de mettre à jour une facture en base
  async updateOneFacture(facture: Facture) {
    //si la date de la facture a été modifiée
    var modifDateFacture:boolean;
    modifDateFacture=false;

    // on récupère la position de la facture et on la met à jour dans la liste
    let index=this.factures.indexOf(facture);

    //on vérifie si la date de facture a été modifiée
    if(this.factures[index].dateFacture!=facture.dateFacture){
      modifDateFacture=true;
    }

    this.factures[index]=facture;

    //on ré-arrange les données
    //on construit l'arbre des données si l'affichage est en arbre
    if(this.typeAffichage=='arbre'){
      this.facturesArbre = await this.alimenteArbre(this.typeAffichage, this.filterAffichage);
    } else {
      this.facturesArbre=null;
    }
    //on ordonne les factures
    await this.orderFactures();

    // on sauvegarde en base la liste des factures
    try {
      const test = await Promise.all([this.storage.set("billaps:factures:"+this.authService.localUser.uid, this.factures).then(data=>{
        return "ok"
      },err=>{
        console.log(err);
      })
      ]);
    } catch (e) {
      console.log(e);
    }

    //on met à jour dans firebase
    var tempFactures=await this.changeBlobFirestore(this.factures);
    var uid= await this.authService.localUser.uid;
    var dateModif=await facture.dateModif;
    firebase.firestore().collection('factures').where('uid','==',uid)
        .get().then(async function(querySnapshot) {
      //on récupère la liste des factures
      if (querySnapshot.docs.length == 1) {
        //on met à jour la liste
        firebase.firestore().collection('factures').doc(querySnapshot.docs[0].id).update({
          factures:tempFactures,
          lastDate:dateModif
        });
      }
    })
        .catch(function(error) {
          console.log("Error add new factures : ", error);
        });
  }

  deleteFacture(facture: Facture) {
    //on supprime le fichier de firebase
    //this.afSG.ref(facture.photoTitle + '.pdf').delete();
  }

  /*
  Le but de cette fonction est d'alimenter les données de factures dans l'arbre
   */
  alimenteArbre(typeAffichage:string,filterAffichage:string){
    var year:number;
    var month:string;
    var monthNum:number;
    //on initialise les variables
    const facturesArbre:Array<FacturesArbreYear>=[];

    //on parcours les factures
    for (var i = 0; i<this.factures.length;i++){
      var item = this.factures[i];

      // on classe en fonction du type d'affichage
      if(filterAffichage=='dateAjout'){
        year=item.dateAjout.getFullYear();
        monthNum=item.dateAjout.getMonth()+1;
      } else if(filterAffichage=='dateFacture'){
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
        facturesArbre.push({open:false,yearNum:year,numberFact:1,liste:[{month:month,monthNum:monthNum,listFactures:[item],open:false}]});
      } else {

          //l'année existe, on vérifie si le mois existe
          var indexMois = facturesArbre[indexAnnee].liste.findIndex(i=>i.monthNum===monthNum);

          if(indexMois==-1){
            // le mois n'existe pas
            facturesArbre[indexAnnee].liste.push({month:month,monthNum:monthNum,listFactures:[item],open:false});
            //on augmente le nombre de facture présent dans l'année
            facturesArbre[indexAnnee].numberFact=facturesArbre[indexAnnee].numberFact+1;
          } else {
            //le mois existe
            facturesArbre[indexAnnee].liste[indexMois].listFactures.push(item);
            //on augmente le nombre de facture présent dans l'année
            facturesArbre[indexAnnee].numberFact=facturesArbre[indexAnnee].numberFact+1;
          }
      }
    }

    return facturesArbre;
  }

  // cette méthode permet d'ordoner les factures pour l'affichage de la liste des factures
  private orderFactures() {
    var ordre:boolean;

    if (this.orderAffichage == 'asc'){
      ordre=false;
    } else {
      ordre=true;
    }


    //on ordonne les factures affichées
    if (this.typeAffichage == 'liste') {
      this.factures = this.orderPipe.transform(this.factures, this.filterAffichage, ordre);
    } else if (this.typeAffichage == 'arbre'){
      //onordonne les années
      this.facturesArbre = this.orderPipe.transform(this.facturesArbre, 'yearNum', ordre);

      //on ordonne les factures en arbres
      for(var y=0;y<this.facturesArbre.length;y++){
        //on ordonne les mois
        this.facturesArbre[y].liste = this.orderPipe.transform(this.facturesArbre[y].liste, 'monthNum', ordre);

        //pour chaque mois
        for(var m=0;m<this.facturesArbre[y].liste.length;m++){
          //on ordonne les facture
          this.facturesArbre[y].liste[m].listFactures=this.orderPipe.transform(this.facturesArbre[y].liste[m].listFactures, this.filterAffichage, ordre);
        }
      }
    }

  }

  async raffraichirAffichage(typeAffichage:string,filterAffichage:string,orderAffichage:string){
    // on met à jour les variables locales et en localStorage
    this.typeAffichage=typeAffichage;
    this.storage.set("billaps:typeAffichage",typeAffichage);
    this.filterAffichage=filterAffichage;
    this.storage.set("billaps:filterAffichage",filterAffichage);
    this.orderAffichage=orderAffichage;
    this.storage.set("billaps:orderAffichage",orderAffichage);

    //si on passe dans le cas d'un arbre, il faut alimente l'arbre
    if (typeAffichage == 'arbre'){
      this.facturesArbre= await  this.alimenteArbre(typeAffichage,filterAffichage);
    }

    //maintenant que nous avons les données, on ordonne les données :
    await this.orderFactures();
  }

  // cette fonction permet de modifier les blob pour les mettre au format firestore
  async changeBlobFirestore(factures:Array<any>){
    var finalFactures;
    for( var i=0;i<factures.length;i++) {
      //on ne sauvegarde pas le pdf en blob, il sera retrouvé avec le nom du fichier et le fichier lui-même
      factures[i].pdfBlob = null;
      factures[i].photos = null;
    }

    finalFactures=factures;
    return finalFactures
  }
}
