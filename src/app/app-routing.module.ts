import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'new-item', loadChildren: './pages/new-item/new-item.module#NewItemPageModule' },
  { path: 'update-item/:id', loadChildren: './pages/update-item/update-item.module#UpdateItemPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'factures', loadChildren: './factures/factures.module#FacturesPageModule' },
  { path: 'facture-detail', loadChildren: './facture-detail/facture-detail.module#FactureDetailPageModule' },
  { path: 'facture-new', loadChildren: './facture-new/facture-new.module#FactureNewPageModule' },
  { path: 'parametres', loadChildren: './parametres/parametres.module#ParametresPageModule' },
  { path: 'contacts', loadChildren: './contacts/contacts.module#ContactsPageModule' },
  { path: 'test-chat', loadChildren: './test-chat/test-chat.module#TestChatPageModule' },
  { path: 'fcm', loadChildren: './fcm/fcm.module#FcmPageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'inscription', loadChildren: './inscription/inscription.module#InscriptionPageModule' },
  { path: 'docview/:doc', loadChildren: './pages/docview/docview.module#DocviewPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
