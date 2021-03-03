import { Injectable } from '@angular/core';

import { SettingsService } from './settings.service';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themes: Themes = new Themes();
  currentThemeName: string = 'Luna Blue';

  constructor(private settingsService: SettingsService) { }

  getThemes() {
    return this.themes.getThemes();
  }

  setTheme(themeName: string) {
    const newTheme = this.findTheme(themeName);
    // if (newTheme) {
    //   this.currentThemeName = newTheme.name;
    //   var d = document.getElementById('theme-css')
    //   d.setAttribute('href', newTheme.path); 
    //   this.settingsService.setTheme(themeName);     
    // }
  }

  isDarkTheme() {
    return this.currentThemeName ? this.findTheme(this.currentThemeName).isDarkTheme : true; 
  }

  private findTheme(themeName: string) {
    return this.getThemes().find(th => th.name === themeName);
  }

}

export class Theme {
  name: string;
  path: string;
  isDarkTheme: boolean;

  constructor(name: string, path: string, isDarkTheme: boolean) {
    this.name = name;
    this.path = path;
    this.isDarkTheme = isDarkTheme;
  }

  public toString() {
    return this.name;
  }
}

class Themes {
  themes: Theme[];

  constructor() {
    this.themes = this.getThemes();
  }

  getThemes(): Theme[] {
    var themeArray: Theme[] = [];
    var basePath: string = 'client/assets/themes/';
    var endPath: string = '/app.css';

    themeArray.push(new Theme('Rhea', basePath + 'rhea' + endPath, false));
    themeArray.push(new Theme('Luna Blue', basePath + 'luna-blue' + endPath, true));
    themeArray.push(new Theme('Luna Green', basePath + 'luna-green' + endPath, true));
    themeArray.push(new Theme('Luna Amber', basePath + 'luna-amber' + endPath, true));
    themeArray.push(new Theme('Luna Pink', basePath + 'luna-pink' + endPath, true));
    themeArray.push(new Theme('Nova Dark', basePath + 'nova-dark' + endPath, false));
    themeArray.push(new Theme('Nova Light', basePath + 'nova-light' + endPath, false));
    themeArray.push(new Theme('Nova Colored', basePath + 'nova-colored' + endPath, false));

    return themeArray;
  }
}