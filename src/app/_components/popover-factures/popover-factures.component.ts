import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {FacturesService} from '../../_services/factures.service';

@Component({
  selector: 'app-popover-factures',
  templateUrl: './popover-factures.component.html',
  styleUrls: ['./popover-factures.component.scss'],
})
export class PopoverFacturesComponent implements OnInit {

  //type d'affichage des factures
  public typeAffichage:string;
  //ordre de l'affichage
  public orderAffichage:string;

  constructor(
      public popoverController:PopoverController,
      public facturesService:FacturesService
  ) { }

  ngOnInit() {
    this.typeAffichage=this.facturesService.typeAffichage;
    this.orderAffichage=this.facturesService.orderAffichage;
  }

  private updateAffichage1(param:string){
    //on remplace le choix de l'arbre ou de la liste
    this.typeAffichage=param+this.typeAffichage.substring(5,this.typeAffichage.length);
  }

  private updateAffichage2(param1:string,param2:string){
    //on modifie pour le tri
    this.typeAffichage=this.typeAffichage.substring(0,9)+param1;
    this.orderAffichage=param2;
  }

  //on valide la modification d'affichage
  async raffraichir() {
    //on met ajour l'affichage des facture
    //await this.facturesService.raffraichirAffichage(this.typeAffichage,this.orderAffichage);
    //on ferme la pop-up
    this.popoverController.dismiss();
  }
}
