import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RundenlisteComponent } from "./components/rundenliste/rundenliste.component";
import { RundeComponent } from "./components/runde/runde.component";
import { CurrentChartsComponent } from "./components/charts/current.charts.component";
import { GlobalChartsComponent } from "./components/charts/global-charts.component";

const routes: Routes = [
  { path: "rundenliste", component: RundenlisteComponent, data: {animation: 'Rundenliste'} },
  { path: "runde", component: RundeComponent, data: {animation: 'Runde'} },
  { path: "currentcharts", component: CurrentChartsComponent, data: {animation: 'Charts'} },
  { path: "globalcharts", component: GlobalChartsComponent, data: {animation: 'Charts'} },
  { path: "**", component: RundenlisteComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
