import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/api';
import { SpieltagService } from '../../services/spieltag.service';
import { formatDate } from "../../util"

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

@Component({
  selector: 'app-spieltagauswahl',
  templateUrl: './spieltagauswahl.component.html',
  styleUrls: ['./spieltagauswahl.component.css']
})
export class SpieltagauswahlComponent {
  
  spieltage: Object[];
  selectedSpieltag: Object;
  message: string;

  constructor(public config: DynamicDialogConfig, public dialog: DynamicDialogRef, private spieltagService: SpieltagService) { 
      this.spieltage = config.data["spieltage"];
      this.message = config.data["message"];
  }
  
  onClose() {
    if (this.selectedSpieltag) {
      this.spieltagService.setAktuellerSpieltag(this.selectedSpieltag["beginn"]);
    }
    this.dialog.close(this.selectedSpieltag);
  }

  onCancel() {
    this.dialog.close(null);
  }

  format(dateJSON: string) {
    return formatDate(new Date(dateJSON));
  }

}

const dateJSON = "2016-04-26T18:09:16Z";
console.log(JSON.parse)
