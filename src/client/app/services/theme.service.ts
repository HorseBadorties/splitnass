import { Injectable } from '@angular/core';

import { first } from "rxjs/operators";;
import { SettingsService } from './settings.service';


@Injectable({
  providedIn: "root"
})
export class ThemeService {
  themes: Themes = new Themes();
  currentThemeName: string = "Rhea";

  constructor(private settingsService: SettingsService) { }

  getThemes() {
    return this.themes.getThemes();
  }

  setTheme(themeName: string) {
    const newTheme = this.getThemes().find(th => th.name === themeName);
    if (newTheme) {
      this.currentThemeName = newTheme.name;
      var d = document.getElementById('theme-css')
      d.setAttribute('href', newTheme.path); 
      this.settingsService.setTheme(themeName);     
    }
  }

}

export class Theme {
  name: string;
  path: string;
  contentBorderColor: string;
  contentBackgroundColor: string;
  themeType: string;

  constructor(name: string, path: string, contentBorderColor: string, contentBackgroundColor: string, themeType: string) {
    this.name = name;
    this.path = path;
    this.contentBorderColor = contentBorderColor;
    this.contentBackgroundColor = contentBackgroundColor;
    this.themeType = themeType;
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
    var basePath: string = "client/assets/themes/";
    var endPath: string = "/app.css";

    themeArray.push(new Theme("Rhea", basePath + "rhea" + endPath, "#262626", "#4d4d4d", "light"));
    themeArray.push(new Theme("Luna Blue", basePath + "luna-blue" + endPath, "#262626", "#4d4d4d", "dark"));
    themeArray.push(new Theme("Luna Green", basePath + "luna-green" + endPath, "#262626", "#4d4d4d", "dark"));
    themeArray.push(new Theme("Luna Amber", basePath + "luna-amber" + endPath, "#262626", "#4d4d4d", "dark"));
    themeArray.push(new Theme("Luna Pink", basePath + "luna-pink" + endPath, "#262626", "#4d4d4d", "dark"));
    themeArray.push(new Theme("Nova Dark", basePath + "nova-dark" + endPath, "#262626", "#4d4d4d", "dark"));
    themeArray.push(new Theme("Nova Light", basePath + "nova-light" + endPath, "#262626", "#4d4d4d", "light"));
    themeArray.push(new Theme("Nova Colored", basePath + "nova-colored" + endPath, "#262626", "#4d4d4d", "light"));

    return themeArray;
  }
}