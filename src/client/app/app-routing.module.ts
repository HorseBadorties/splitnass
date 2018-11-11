import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RundenlisteComponent } from "./components/rundenliste/rundenliste.component";
import { RundeComponent } from "./components/runde/runde.component";
import { ChartsComponent } from "./components/charts/charts.component";

const routes: Routes = [
  { path: "rundenliste", component: RundenlisteComponent, data: {animation: 'Rundenliste'} },
  { path: "runde", component: RundeComponent, data: {animation: 'Runde'} },
  { path: "charts", component: ChartsComponent, data: {animation: 'Charts'} },
  { path: "**", component: RundenlisteComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
