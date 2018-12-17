import { NgModule, Injectable } from "@angular/core";
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { SpinnerModule } from "primeng/spinner";
import { TableModule } from "primeng/table";
import { FieldsetModule } from "primeng/fieldset";
import { ChipsModule } from "primeng/chips";
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from "primeng/checkbox";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { ListboxModule } from "primeng/listbox";
import { ToolbarModule } from "primeng/toolbar";
import { MessageModule } from "primeng/message";
import { PanelModule } from "primeng/panel";
import { PickListModule } from "primeng/picklist";
import { SidebarModule } from "primeng/sidebar";
import { PanelMenuModule } from "primeng/panelmenu";
import { InputTextModule } from "primeng/inputtext";
import { ChartModule } from "primeng/chart";
import { TabViewModule } from "primeng/tabview";
import { CardModule } from "primeng/card";
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AccordionModule } from 'primeng/accordion';


import { AppComponent } from "./app.component";
import { RundeComponent } from "./components/runde/runde.component";
import { RundenlisteComponent } from "./components/rundenliste/rundenliste.component";
import { AppRoutingModule } from "./app-routing.module";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CurrentChartsComponent } from './components/charts/current.charts.component';
import { SettingsComponent } from './dialogs/settings/settings.component';

import { SpielerauswahlComponent } from './dialogs/spielerauswahl/spielerauswahl.component';
import { NumberpickerComponent } from './dialogs/numberpicker/numberpicker.component';
import { NeuerSpieltagComponent } from './dialogs/neuer-spieltag/neuer-spieltag.component';
import { GewinnerauswahlComponent } from './dialogs/gewinnerauswahl/gewinnerauswahl.component';
import { GenericDialogComponent } from './dialogs/generic-dialog/generic-dialog.component';
import { SpieltagauswahlComponent } from './dialogs/spieltagauswahl/spieltagauswahl.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { GlobalChartsComponent } from './components/charts/global-charts.component';
import { CardsComponent } from './components/cards/cards.component';
import { RegelaenderungComponent } from './dialogs/regelaenderung/regelaenderung.component';


@Injectable()
export class ScollFixHammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = new (<any>window).Hammer(element);

    for (const eventName in this.overrides) {
      if (eventName) {
        mc.get(eventName).set(this.overrides[eventName]);
      }
    }

    return mc;
  }
  // overrides = {
  //   pan: {
  //     direction: 6
  //   },
  //   pinch: {
  //     enable: false
  //   },
  //   rotate: {
  //     enable: false
  //   }
  // };
}

@NgModule({
  declarations: [
    AppComponent,
    RundeComponent,
    RundenlisteComponent,
    CurrentChartsComponent,
    SettingsComponent,
    SpielerauswahlComponent,
    NumberpickerComponent,
    NeuerSpieltagComponent,
    GewinnerauswahlComponent,
    SpieltagauswahlComponent,
    GenericDialogComponent,
    SpinnerComponent,
    GlobalChartsComponent,
    CardsComponent,
    RegelaenderungComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SpinnerModule,
    FieldsetModule,
    ChipsModule,
    DropdownModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    ListboxModule,
    ToolbarModule,
    MessageModule,
    PanelModule,
    PickListModule,
    SidebarModule,
    PanelMenuModule,
    InputTextModule,
    ChartModule,
    TabViewModule,
    AppRoutingModule,
    CardModule,
    DynamicDialogModule,
    AccordionModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: ScollFixHammerConfig
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    GenericDialogComponent,
    GewinnerauswahlComponent,
    NeuerSpieltagComponent,
    NumberpickerComponent,
    SettingsComponent,
    SpielerauswahlComponent,
    SpieltagauswahlComponent,
    RegelaenderungComponent
]
})
export class AppModule { }


