import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {FacturesService} from '../_services/factures.service';
import {AuthentificationService} from '../_services/authentification.service';

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
              public authService:AuthentificationService) { }

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
}
