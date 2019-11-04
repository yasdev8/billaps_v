import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturesPage } from './factures.page';
import {ComponentsModule} from "../_components/components.module";
import {PopoverFacturesComponent} from '../_components/popover-factures/popover-factures.component';

const routes: Routes = [
  {
    path: '',
    component: FacturesPage
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
    entryComponents: [PopoverFacturesComponent],
  declarations: [FacturesPage,PopoverFacturesComponent]
})
export class FacturesPageModule {}
