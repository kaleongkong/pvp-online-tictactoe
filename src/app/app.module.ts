import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from "@angular/fire";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

const config = {
	apiKey: "AIzaSyAcpC_DCOcN2M7nJBStP057Nzrgz45XjCM",
	authDomain: "tictactoe-27928.firebaseapp.com",
	databaseURL: "https://tictactoe-27928.firebaseio.com",
	projectId: "tictactoe-27928",
	storageBucket: "tictactoe-27928.appspot.com",
	messagingSenderId: "169435984843",
	appId: "1:169435984843:web:6c04df5952fd6eab437c4e"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
