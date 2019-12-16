import { Component, OnInit } from '@angular/core';
import {LoadingController, PopoverController} from '@ionic/angular';
import {FacturesService} from '../../_services/factures.service';


@Component({
  selector: 'app-popover-factures',
  templateUrl: './popover-factures.component.html',
  styleUrls: ['./popover-factures.component.scss'],
})
export class PopoverFacturesComponent implements OnInit {

  //type d'affichage des factures
  public typeAffichage:string;
  //filtre d'affichage des factures
  public filterAffichage:string;
  //ordre de l'affichage
  public orderAffichage:string;

  constructor(
      public popoverController:PopoverController,
      public facturesService:FacturesService,
      public loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.typeAffichage=this.facturesService.typeAffichage;
    this.filterAffichage=this.facturesService.filterAffichage;
    this.orderAffichage=this.facturesService.orderAffichage;
  }

  public updateAffichage1(param:string){
    //on remplace le choix de l'arbre ou de la liste
    this.typeAffichage=param;
  }

  public updateAffichage2(filter:string,order:string){
    //on modifie pour le tri
    this.filterAffichage=filter;
    this.orderAffichage=order;
  }

  //on valide la modification d'affichage
  async raffraichir() {
    const loading = await this.loadingController.create({
      //spinner: null,
      message: 'Chargement',
      translucent: true,
    });
    loading.present();
    //on met ajour l'affichage des facture
    await this.facturesService.raffraichirAffichage(this.typeAffichage,this.filterAffichage,this.orderAffichage);

    //on ferme la pop-up
    await this.popoverController.dismiss(true);
    loading.dismiss();
  }
}
