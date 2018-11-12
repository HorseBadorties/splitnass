import { Component } from '@angular/core';
import { Spieler } from 'src/model/spieler';
import { DialogConfig } from '../../dialog/dialog-config';
import { DialogRef } from '../../dialog/dialog-ref';

@Component({
  selector: 'app-spielerauswahl',
  templateUrl: './spielerauswahl.component.html',
  styleUrls: ['./spielerauswahl.component.css']
})
export class SpielerauswahlComponent {

  spieler: Spieler[];
  selectedSpieler: Spieler;
  message: string;

  constructor(public config: DialogConfig, public dialog: DialogRef) { 
      this.spieler = config["spieler"];
      this.message = config["message"];
  }
  
  onClose() {
    this.dialog.close(this.selectedSpieler);
  }

  onCancel() {
    this.dialog.close(null);
  }

}
