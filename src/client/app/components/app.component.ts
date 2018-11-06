import { Component } from "@angular/core";
import { RouterOutlet } from '@angular/router';

import { fadeInAnimation } from './animations';
import { SettingsService } from "../services/settings.service";

@Component({
  selector: "app-root",
  template: `<div [@routeAnimations]="prepareRoute(outlet)" >
              <router-outlet #outlet="outlet"></router-outlet>
            </div>`,
  animations: [ fadeInAnimation ]
})
export class AppComponent {

  constructor(private settingsService: SettingsService) {}

  prepareRoute(outlet: RouterOutlet) {
    return this.settingsService.animateRoutes && outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

 }
