import { Component } from '@angular/core';
import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  constructor(public config: DialogConfig, 
    public dialog: DialogRef,
    public settingsService: SettingsService) { }

  onClose() {
    this.dialog.close('some value');
  }
}
