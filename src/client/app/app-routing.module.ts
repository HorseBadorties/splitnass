import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RundenlisteComponent } from "./components/rundenliste/rundenliste.component";
import { RundeComponent } from "./components/runde/runde.component";

const routes: Routes = [
  { path: "rundenliste", component: RundenlisteComponent, data: {animation: 'Rundenliste'} },
  { path: "runde", component: RundeComponent, data: {animation: 'Runde'} },
  { path: "**", component: RundenlisteComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
