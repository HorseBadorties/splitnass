import { Component } from '@angular/core';
import { Spieler } from 'src/model/spieler';
import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';

@Component({
  selector: 'app-gewinnerauswahl',
  templateUrl: './gewinnerauswahl.component.html',
  styleUrls: ['./gewinnerauswahl.component.css']
})
export class GewinnerauswahlComponent {

  spieler: Spieler[];
  selectedSpieler: Spieler[] = [];
  ergebnis: number;
  anzahlGewinner: number;

  constructor(public config: DialogConfig, public dialog: DialogRef) { 
      this.spieler = config["spieler"];
      this.selectedSpieler = config["gewinner"];
      this.ergebnis = config["ergebnis"];
      this.anzahlGewinner = config["anzahlGewinner"];
  }
  
  canConfirm() {
    return this.selectedSpieler.length == this.anzahlGewinner;
  }

  onClose() {
    if (this.canConfirm()) {
      this.dialog.close(this.selectedSpieler);
    }
  }

  onCancel() {
    this.dialog.close(null);
  }

}
