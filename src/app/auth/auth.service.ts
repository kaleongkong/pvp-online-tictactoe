import { Injectable } from '@angular/core';
import { auth } from  'firebase/app';
import { AngularFireAuth } from  "@angular/fire/auth";
import { User } from  'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user:  User;
  constructor(public afAuth: AngularFireAuth) {
  	this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

	async logout(){
    await this.afAuth.signOut();
    localStorage.removeItem('user');
	}

	get isLoggedIn(): boolean {
    const  user  =  JSON.parse(localStorage.getItem('user'));
    return  user  !==  null;
  }

  get userDto(): any {
  	return JSON.parse(localStorage.getItem('user'));
  }

  async loginWithGoogle(){
    await  this.afAuth.signInWithPopup(new auth.GoogleAuthProvider());
	}
}
