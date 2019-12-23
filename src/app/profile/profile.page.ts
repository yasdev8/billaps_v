import { Component, OnInit } from '@angular/core';
import {NavController, Platform, ToastController} from '@ionic/angular';
import {FacturesService} from '../_services/factures.service';
import {AuthentificationService} from '../_services/authentification.service';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  phone:any;
  modeEdit:boolean=false;

  constructor(private navCtrl:NavController,
              public facturesService:FacturesService,
              public authService:AuthentificationService,
              private platform:Platform,
              public toastController: ToastController,
              private camera:Camera) { }

  ngOnInit() {
  }

  //cette méthode se lance à chaque ouverture de l'écran, on récupère donc toute les factures
  ionViewWillEnter(){
    this.phone=this.phoneFormat(this.authService.localUser.phone,10)
  }

  //retour à la page précédente
  back() {
    this.navCtrl.back();
  }

  phoneFormat(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }

  //change le mode
  editMode(){
    this.modeEdit=!this.modeEdit;
  }

  //permet d'enregistrer les modification de profil
  async update(){
    //on réattribut le numéro
    this.authService.localUser.phone=this.phone;
    //on met à jour l'utilisateur
    await this.authService.updateUser();

    //on recharge le format téléphone
    this.phone=this.phoneFormat(this.authService.localUser.phone,10);
    //à la fin du traitement, on change le mode
    this.editMode();
  }

  //cette fonction permet de changer la photo de profil
  changePic(){
    /*
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
        this.newFacture.photos = this.constantes.imageBase64Land;
        this.newFacture.photoType = 'jpeg';
        this.newFacture.photoTitle=option+'_facture_ordinateur_boulanger_'+dateNow;

        // On récupère les valeurs de l'image pour la taille ultérieurement
        this.img.src = this.newFacture.photos;

      } else if (option=='pdf') {
        //pdf
        this.newFacture.photos=this.constantes.pdfBase64;
        this.newFacture.photoType='pdf';
        this.newFacture.photoTitle='pdf_facture_ordinateur_boulanger_'+dateNow;
      }
    }*/
  }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      position: 'bottom',
      cssClass: "my-custom-class",
      animated: true,
      buttons: [
        {
          side: 'start',
          icon: 'camera',
          text: ' Take a pic',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          icon: 'image',
          text: ' Gallery',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }
}
