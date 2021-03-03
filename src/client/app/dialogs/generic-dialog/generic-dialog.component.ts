import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.css']
})
export class GenericDialogComponent {

  type = Type.INFO;  
  header: string;
  message: string;

  constructor(public config: DynamicDialogConfig, public dialog: DynamicDialogRef) { 
    if (config.data) {
      if (config.data["type"]) this.type = config.data["type"];    
      this.message = config.data["message"];
      this.header = config.data["header"];
    }
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