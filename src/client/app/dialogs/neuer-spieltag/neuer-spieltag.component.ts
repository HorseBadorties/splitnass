import { Component } from '@angular/core';
import * as _ from "lodash";

import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';
import { Spieler } from 'src/model/spieler';
import { SpieltagService } from '../../services/spieltag.service';

@Component({
  selector: 'app-neuer-spieltag',
  templateUrl: './neuer-spieltag.component.html',
  styleUrls: ['./neuer-spieltag.component.css']
})
export class NeuerSpieltagComponent {

  moeglicheSpieler = Spieler.all.slice();
  selectedSpieler: Spieler[] = [];
  name = `Spieltag vom ${this.formatDate(new Date())}`;
  anzahlRunden = 42;
  message: string;

  constructor(public spieltagService: SpieltagService, public config: DialogConfig, public dialog: DialogRef) { 
    this.message = config["message"];
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

  private formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd  = date.getDate();
    return _.padStart(dd.toString(), 2, "0") + "." + _.padStart(mm.toString(), 2, "0") + "." + yyyy.toString();
  }

}
