import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from "@ionic/storage";
import { Camera } from "@ionic-native/camera/ngx";
//import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
//import { DocumentScanner } from "@ionic-native/document-scanner/ngx";

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FirebaseX } from '@ionic-native/firebase-x/ngx'
import { Facebook } from "@ionic-native/facebook/ngx";

import { File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { FcmService } from './_services/fcm.service';
import {HttpClientModule} from '@angular/common/http';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {Constantes} from './_model/constantes';
import {OrderModule} from 'ngx-order-pipe';


//configuration de Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyDPvFgItJYCcdJ5UTqUjvoTkMhvv1KfHjo",
    authDomain: "billaps-v0.firebaseapp.com",
    databaseURL: "https://billaps-v0.firebaseio.com",
    projectId: "billaps-v0",
    storageBucket: "billaps-v0.appspot.com",
    messagingSenderId: "592542948699",
    appId: "1:592542948699:web:056ab734f613c7292a0e7e",
    measurementId: "G-KXMJ2N3MMG"

};



@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
        //import des module Firebase
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireStorageModule,
        AngularFirestoreModule,
        OrderModule,

        HttpClientModule,
        IonicStorageModule.forRoot({
            name: 'billaps',
            driverOrder: [
                'indexeddb',
                'sqlite',
                'websql'
            ]
        })],
    providers: [
        Constantes,
        StatusBar,
        SplashScreen,
        Facebook,
        //PhotoViewer,
        //DocumentScanner,
        Camera,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        File,
        FileOpener,
        FirebaseX,
        FcmService,
        EmailComposer,
    ],
    exports: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
