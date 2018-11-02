import { Component } from "@angular/core";
import { SettingsService } from "../services/settings.service";

@Component({
  selector: "app-root",
  template: "<router-outlet></router-outlet>",
})
export class AppComponent {
  constructor(private settingsService: SettingsService) {
    settingsService.offline = false;
  }
}
