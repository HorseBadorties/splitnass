import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Spieler } from 'src/model/spieler';
import { SpieltagService } from '../../services/spieltag.service';
import { formatDate } from "../../util"

@Component({
  selector: 'app-neuer-spieltag',
  templateUrl: './neuer-spieltag.component.html',
  styleUrls: ['./neuer-spieltag.component.css']
})
export class NeuerSpieltagComponent {

  moeglicheSpieler = Spieler.all.slice();
  selectedSpieler: Spieler[] = [];
  name = `Spieltag vom ${formatDate(new Date())}`;
  anzahlRunden = 42;

  constructor(public spieltagService: SpieltagService, public config: DynamicDialogConfig, public dialog: DynamicDialogRef) { 
    
  }
  
  canConfirm() {
    return this.selectedSpieler.length >= 4;
  }

  onClose() {
    if (this.canConfirm()) {
      this.spieltagService.startSpieltag(this.name, this.anzahlRunden, this.selectedSpieler, this.selectedSpieler[0]);
      this.dialog.close(null);
    }
  }

  onCancel() {
    this.dialog.close(null);
  }

  

}
