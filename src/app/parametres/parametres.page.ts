import { Component, OnInit } from '@angular/core';
import {AuthentificationService} from "../_services/authentification.service";
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/auth";

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.page.html',
  styleUrls: ['./parametres.page.scss'],
})
export class ParametresPage implements OnInit {

  constructor(private authService:AuthentificationService,
              public afAuth: AngularFireAuth,
              private router:Router) { }

  ngOnInit() {
  }

  //déconnexion
  logout() {
    this.authService.logout();
  }

  //naviguer vers
  public goTo(destination:string){
    this.router.navigateByUrl(destination);
  }
}
