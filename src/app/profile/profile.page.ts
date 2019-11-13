import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {FacturesService} from '../_services/factures.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(private navCtrl:NavController,
              public facturesService:FacturesService) { }

  ngOnInit() {
  }

  //cette méthode se lance à chaque ouverture de l'écran, on récupère donc toute les factures
  ionViewWillEnter(){
  }

  //retour à la page précédente
  back() {
    this.navCtrl.back();
  }

}
