import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/api';
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

  constructor(public config: DynamicDialogConfig, 
    public dialog: DynamicDialogRef,
    public settingsService: SettingsService, 
    public themeService: ThemeService) { 
      this.themes = this.themeService.getThemes().map(theme => {
        return {label: theme.name, value: theme.name};
      });
      this.selectedTheme = this.themeService.currentThemeName;
    }

  onClose() {
    this.dialog.close('');
  }

  themeChanged() {
    if (this.selectedTheme && this.selectedTheme !== this.themeService.currentThemeName) {
      this.themeService.setTheme(this.selectedTheme);
    } 
  }

}
