import { Component } from '@angular/core';
import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.css']
})
export class GenericDialogComponent {

  type = Type.INFO;  
  header: string;
  message: string;

  constructor(public config: DialogConfig, public dialog: DialogRef) { 
    if (config["type"]) this.type = config["type"];    
    this.message = config["message"];
    this.header = config["header"];
  }

  onClose() {
    this.dialog.close(this.type === Type.CONFIRMATION ? "Yes" : null);
  }

  onCancel() {
    this.dialog.close(null);
  }

  isConfirmationType() {
    return this.type === Type.CONFIRMATION;
  }

}

export enum Type {
  INFO,
  CONFIRMATION    
}