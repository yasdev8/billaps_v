import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FactureNewPage } from './facture-new.page';
import {ComponentsModule} from "../_components/components.module";

const routes: Routes = [
  {
    path: '',
    component: FactureNewPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule
    ],
  declarations: [FactureNewPage]
})
export class FactureNewPageModule {}
