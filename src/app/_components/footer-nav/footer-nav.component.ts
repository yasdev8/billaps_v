import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {FootNavService} from "../../_services/foot-nav.service";

@Component({
  selector: 'app-footer-nav',
  templateUrl: './footer-nav.component.html',
  styleUrls: ['./footer-nav.component.scss'],
})
export class FooterNavComponent implements OnInit {

  constructor(private router:Router,
              private footService:FootNavService) { }

  ngOnInit() {
  }

  //on stocke la page de destination dans un service afin d'afficher la bonne icon
  public getCurrentPage(){
    return this.footService.pageCible;
  }

  public navigation(pageCible:string) {
    //on met à jour la future page
    this.footService.pageCible=pageCible;
    //on navigue vers la cible de la page
    this.router.navigateByUrl(pageCible);
  }

}
