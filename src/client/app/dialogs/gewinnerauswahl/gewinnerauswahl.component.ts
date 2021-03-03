import { Component } from '@angular/core';
import { Spieler } from 'src/model/spieler';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

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

  constructor(public config: DynamicDialogConfig, public dialog: DynamicDialogRef) { 
      this.spieler = config.data["spieler"];
      this.selectedSpieler = config.data["gewinner"];
      this.ergebnis = config.data["ergebnis"];
      this.anzahlGewinner = config.data["anzahlGewinner"];
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
