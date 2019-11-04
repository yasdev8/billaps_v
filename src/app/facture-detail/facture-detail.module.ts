import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FactureDetailPage } from './facture-detail.page';
import {ComponentsModule} from "../_components/components.module";

const routes: Routes = [
  {
    path: '',
    component: FactureDetailPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
  declarations: [FactureDetailPage]
})
export class FactureDetailPageModule {}
