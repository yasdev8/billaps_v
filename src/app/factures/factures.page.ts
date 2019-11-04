import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {FacturesService} from "../_services/factures.service";
import {Facture} from "../_model/facture";
import {AlertController, PopoverController} from '@ionic/angular';
import {PopoverFacturesComponent} from '../_components/popover-factures/popover-factures.component';
import {FacturesArbreYear} from '../_model/facturesArbre';

@Component({
  selector: 'app-factures',
  templateUrl: './factures.page.html',
  styleUrls: ['./factures.page.scss'],
})
export class FacturesPage implements OnInit {
  //on crée la liste de factures
  public factures:Array<Facture>;
  //on crée la liste des factures en arbres
  public facturesArbre:Array<FacturesArbreYear>=[];
  //type d'affichage des factures
  public typeAffichage:string;
  //ordre de l'affichage
  public orderAffichage:string;
  constructor(private router:Router,
              private alertCtrl:AlertController,
              private facturesService:FacturesService,
              public popoverController: PopoverController) { }

  ngOnInit() {
  }

  //cette méthode se lance à chaque ouverture de l'écran, on récupère donc toute les factures
  ionViewWillEnter(){
    //on charge les factures ou on charge les arbres
    this.factures=this.facturesService.factures;
    this.facturesArbre=this.facturesService.facturesArbre;
    this.onGetFactures();
  }

  async onGetFactures() {
    //on charge les données de factures
    await this.facturesService.getFactures().then(data=>{
      this.factures=data;
    });
    //on récupère l'arbre du service
    this.facturesArbre=this.facturesService.facturesArbre;
    //on récupère l'affichage
    this.typeAffichage=this.facturesService.typeAffichage;
    this.orderAffichage=this.facturesService.orderAffichage;
  }

  onNewFacture() {
    //on affecte la variable du type de la page newFacture
    this.facturesService.typeNewFacture='add';
    this.router.navigateByUrl('facture-new');
  }

  onDetailFacture(facture:Facture) {
    //on stocke la facture sélectionné
    this.facturesService.currentFacture=facture;
    //on va vers le détail de la facture
    this.router.navigateByUrl('facture-detail');
  }

  delete(facture:Facture) {
    //on demande la confirmation de l'utilisateur
    let alert = this.alertCtrl.create({
      message: 'Etes-vous sûr de vouloir supprimer cette facture?',
      buttons: [
        {
          text: 'Oui',
          handler: () => {
            let index=this.factures.indexOf(facture);
            this.factures.splice(index,1);
            //on met à jour les factures dans l'application
            this.facturesService.updateFactures(this.factures);
            //on supprime la facture du back-end
            this.facturesService.deleteFacture(facture);
          }
        },
        {
          text: 'Non',
          handler: () => {
          }
        }
      ]
    }).then(alert=>alert.present());


  }

  //Affichage des options dans factures
  async presentPopover(event){
    const popover = await this.popoverController.create({
      component :PopoverFacturesComponent,
      event:event,
      translucent: true
    });
    return await popover.present();

  }
}
