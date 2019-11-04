import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-popover-factures',
  templateUrl: './popover-factures.component.html',
  styleUrls: ['./popover-factures.component.scss'],
})
export class PopoverFacturesComponent implements OnInit {

  constructor(
      public popoverController:PopoverController
  ) { }

  ngOnInit() {}

  doc(){
    console.log("doc");
    this.popoverController.dismiss();
  }

  close(){
    console.log("close");
    this.popoverController.dismiss();
  }

}
