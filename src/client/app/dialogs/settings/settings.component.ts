import { Component } from '@angular/core';
import { DialogConfig } from '../dialog-config';
import { DialogRef } from '../dialog-ref';
import { SettingsService } from '../../services/settings.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  themes: SelectItem[];
  selectedTheme: string;

  constructor(public config: DialogConfig, 
    public dialog: DialogRef,
    public settingsService: SettingsService, 
    public themeService: ThemeService) { 
      this.themes = this.themeService.getThemes().map(theme => {
        return {label: theme.name, value: theme.name};
      });
      this.selectedTheme = this.themeService.currentTheme.name;
    }

  onClose() {
    this.dialog.close('');
  }

  themeChanged() {
    if (this.selectedTheme && this.themeService.currentTheme.name !== this.selectedTheme) {
      this.themeService.setTheme(this.selectedTheme);
    } 
  }

}
