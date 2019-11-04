import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TestChatPage } from './test-chat.page';
import {ComponentsModule} from "../_components/components.module";

const routes: Routes = [
  {
    path: '',
    component: TestChatPage
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
  declarations: [TestChatPage]
})
export class TestChatPageModule {}
