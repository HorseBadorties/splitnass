import { Component } from '@angular/core';
import { Spieler } from 'src/model/spieler';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-spielerauswahl',
  templateUrl: './spielerauswahl.component.html',
  styleUrls: ['./spielerauswahl.component.css']
})
export class SpielerauswahlComponent {

  spieler: Spieler[];
  selectedSpieler: Spieler;
  message: string;

  constructor(public config: DynamicDialogConfig, public dialog: DynamicDialogRef) { 
      this.spieler = config.data["spieler"];
      this.message = config.data["message"];
  }
  
  onClose() {
    this.dialog.close(this.selectedSpieler);
  }

  onCancel() {
    this.dialog.close(null);
  }

}
