import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/api';

@Component({
  selector: 'app-numberpicker',
  templateUrl: './numberpicker.component.html',
  styleUrls: ['./numberpicker.component.css']
})
export class NumberpickerComponent {

  min = 0;
  max = 999;
  value: number;
  message: string;

  constructor(public config: DynamicDialogConfig, public dialog: DynamicDialogRef) { 
    if (config.data["min"]) this.min = config.data["min"];
    if (config.data["max"]) this.max = config.data["max"];
    this.value = config.data["value"];
    this.message = config.data["message"];
  }

  onClose() {
    this.dialog.close(this.value);
  }

  onCancel() {
    this.dialog.close(null);
  }

}
