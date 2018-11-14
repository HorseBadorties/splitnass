import { Component } from '@angular/core';
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
  anzahlRunden = 42;
  message: string;

  constructor(public spieltagService: SpieltagService, public config: DialogConfig, public dialog: DialogRef) { 
    this.message = config["message"];
  }
  
  onClose() {
    this.spieltagService.startSpieltag(this.anzahlRunden, this.selectedSpieler, this.selectedSpieler[0]);
    this.dialog.close(null);
  }

  onCancel() {
    this.dialog.close(null);
  }

}
