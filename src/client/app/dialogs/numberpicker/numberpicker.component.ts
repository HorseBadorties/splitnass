import { Component } from '@angular/core';
import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';

@Component({
  selector: 'app-numberpicker',
  templateUrl: './numberpicker.component.html',
  styleUrls: ['./numberpicker.component.css']
})
export class NumberpickerComponent {

  min = 1;
  max = 999;
  value: number;
  message: string;

  constructor(public config: DialogConfig, public dialog: DialogRef) { 
    if (config["min"]) this.min = config["min"];
    if (config["max"]) this.max = config["max"];
    this.value = config["value"];
    this.message = config["message"];
  }

  onClose() {
    this.dialog.close(this.value);
  }

  onCancel() {
    this.dialog.close(null);
  }

}
