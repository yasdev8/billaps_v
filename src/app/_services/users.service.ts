import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public eventListRef: firebase.firestore.CollectionReference;
  constructor() {

        this.eventListRef = firebase
            .firestore()
            .collection(`/users`);

  }
}
