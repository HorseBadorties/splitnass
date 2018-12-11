import { Component, AfterViewInit } from "@angular/core";
import { RouterOutlet } from '@angular/router';

import { routingAnimation } from './animations';
import { SettingsService } from "./services/settings.service";
import { ThemeService } from "./services/theme.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-root",
  template: `<div [@routeAnimations]="prepareRoute(outlet)" >
              <router-outlet #outlet="outlet"></router-outlet>
            </div>`,
  animations: [ routingAnimation ]
})
export class AppComponent implements AfterViewInit {

  constructor(private settingsService: SettingsService, private themeService: ThemeService) {}

  ngAfterViewInit() {
    this.settingsService.getTheme().pipe(first()).subscribe(themeName => this.themeService.setTheme(themeName));
  }

  prepareRoute(outlet: RouterOutlet) {
    return this.settingsService.animateRoutes && outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

 }
