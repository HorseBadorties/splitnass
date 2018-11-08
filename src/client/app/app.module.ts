import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
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
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SidebarModule } from "primeng/sidebar";
import { PanelMenuModule } from "primeng/panelmenu";
import { InputTextModule } from "primeng/inputtext";

import { AppComponent } from "./components/app.component";
import { RundeComponent } from "./components/runde/runde.component";
import { RundenlisteComponent } from "./components/rundenliste/rundenliste.component";
import { AppRoutingModule } from "./app-routing.module";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    RundeComponent,
    RundenlisteComponent
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
    ProgressSpinnerModule,
    SidebarModule,
    PanelMenuModule,
    InputTextModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

