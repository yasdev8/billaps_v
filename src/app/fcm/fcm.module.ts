import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FcmPage } from './fcm.page';
import {ComponentsModule} from '../_components/components.module';

const routes: Routes = [
  {
    path: '',
    component: FcmPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FcmPage]
})
export class FcmPageModule {}
