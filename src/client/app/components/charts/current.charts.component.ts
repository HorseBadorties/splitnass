import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import * as _ from "lodash";
import { Chart } from 'chart.js';

import { SpieltagService } from '../../services/spieltag.service';
import { Spieltag } from 'src/model/spieltag';
import { Spieler } from 'src/model/spieler';
import { Solo } from 'src/model/solo';
import { playerColors } from './colors';
import { ThemeService } from '../../services/theme.service';
import { DialogService } from "primeng/api";
import { SettingsComponent } from "../../dialogs/settings/settings.component";
import { SettingsService } from '../../services/settings.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-current-charts',
  templateUrl: './current.charts.component.html',
  styleUrls: ['./current.charts.component.css'],
  providers: [DialogService]
})
export class CurrentChartsComponent implements OnInit, OnDestroy {
  
  spieltagServiceSubscribtion: Subscription;
  settingsServiceSubscribtion: Subscription;
  spieltag: Spieltag;
  spieltagsverlauf: any;
  anzahlGewonnenerRunden: any;
  anzahlSolos: any;
  optionsSpieltagsverlauf;
  optionsAnzahlGewonneneRunden;
  displayMenu = false;
  menuItems: MenuItem[];

  private setOptions() {
      Chart.defaults.global.elements.point.radius = 0;
      this.optionsSpieltagsverlauf = {
        title: {
          display: false
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            padding: 24
          }
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Runde',
            },
            ticks: {
              display: true
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Punkte',
            },
            ticks: {
              display: true
            }
          }]
        }
      };
      this.optionsAnzahlGewonneneRunden = {
        legend: {
          display: false
        },
        title: {
          display: false      
        },
        scales: {
          xAxes: [{
            ticks: {
              display: true
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              stepSize: 1,
              display: true
            }
          }]
        }
      };
    }

    private initMenu() {
      this.menuItems = [        
        {
          label: "Settings", id: MenuItemId.Settings,
          icon: "pi pi-fw pi-cog", command: _ => this.openSettings()
        },
        {
          label: "Regelbuch", id: MenuItemId.Rules,
          icon: "pi pi-fw pi-paperclip", command: _ => {
            this.displayMenu = false;
            window.open("https://github.com/HorseBadorties/splitnass/wiki/Regeln", "Regeln");
          }
        },
      ];
    }
  


  openSettings() {
    this.displayMenu = false;
    this.dialogService.open(SettingsComponent, { showHeader: false });
  }

  constructor(
    public spieltagService: SpieltagService, 
    private themeService: ThemeService, 
    private settingsService: SettingsService,
    private location: Location,
    private dialogService: DialogService) {       
      this.setOptions();
    }

  ngOnInit() {
    this.initMenu();
    this.spieltagServiceSubscribtion = this.spieltagService.spieltag.subscribe(spieltag => this.calcData(spieltag));
    this.settingsServiceSubscribtion = this.settingsService.chartsFontSizeStatus.subscribe(value => this.calcData(this.spieltag));
  }

  ngOnDestroy() {
    if (this.spieltagServiceSubscribtion) {
      this.spieltagServiceSubscribtion.unsubscribe();
    }
    if (this.settingsServiceSubscribtion) {
      this.settingsServiceSubscribtion.unsubscribe();
    }
  }

  navigateBack() {
    this.location.back();
  }

  private calcData(spieltag: Spieltag) {  
    if (!spieltag) return;
    this.updateFont(this.settingsService.chartsFontSize);
    this.spieltag = spieltag;
    const gespielteRunden = spieltag.runden.filter(r => r.isBeendet);

    // Spieltagsverlauf
    const newSpieltagsverlaufData = {};
    newSpieltagsverlaufData["labels"] = gespielteRunden.map(r => r.nr.toString());
    const datasetsSpieltagsverlauf = [];
    spieltag.spieler.forEach(s => {
      const dataset = {};     
      dataset["label"] = `${s.name}: ${spieltag.getPunktestand(spieltag.aktuelleRunde, s)}`;      
      dataset["data"] = gespielteRunden.map(r => spieltag.getPunktestand(r, s));      
      dataset["fill"] = false;      
      dataset["borderWidth"] = 12;      
      // dataset["pointStyle"] = "";      
      datasetsSpieltagsverlauf.push(dataset);
    });
    _.forEach(datasetsSpieltagsverlauf, (value, index) => value["borderColor"] = playerColors[index]);
    newSpieltagsverlaufData["datasets"] = datasetsSpieltagsverlauf;
    const letzteRunde = this.spieltag.getVorherigeRunde(this.spieltag.aktuelleRunde);    
    let rundenLabel = 'Runden';
    if (letzteRunde) {
      rundenLabel = `Ergebnis der ${letzteRunde.nr}. Runde: `;
      rundenLabel += letzteRunde.isGespaltenerArsch() ? '💩 Gespaltener Arsch 💩' : `${letzteRunde.ergebnis} Punkte für ${letzteRunde.gewinner.map(s => s.name).join(' und ')}`
    }
    this.optionsSpieltagsverlauf.scales.xAxes[0].scaleLabel.labelString = rundenLabel;
    this.spieltagsverlauf = newSpieltagsverlaufData;

    // Anzahl gewonnene Runden
    const newAnzahlGewonnenerRundenData = {};
    newAnzahlGewonnenerRundenData["labels"] = spieltag.spieler.map(s => s.name);
    const dataset = {"label": ""};
    dataset["data"] = spieltag.spieler.map(s => this.countAnzahlGewonnenerRunden(s));
    dataset["backgroundColor"] = playerColors.slice(0, spieltag.spieler.length);
    newAnzahlGewonnenerRundenData["datasets"] = [dataset];
    this.anzahlGewonnenerRunden = newAnzahlGewonnenerRundenData;

    // Anzahl Solos
    const newAnzahlSolos = {};
    newAnzahlSolos["labels"] = spieltag.spieler.map(s => s.name);
    const datasetSolos = {"label": ""};
    datasetSolos["data"] = spieltag.spieler.map(s => this.countAnzahlGespielteSolos(s));
    datasetSolos["backgroundColor"] = playerColors.slice(0, spieltag.spieler.length);
    newAnzahlSolos["datasets"] = [datasetSolos];
    this.anzahlSolos = newAnzahlSolos;
  }

  private countAnzahlGewonnenerRunden(spieler: Spieler) {
    return this.spieltag.runden.filter(r => r.gewinner.includes(spieler)).length;
  }

  private updateFont(size: number) {
    let color = this.themeService.isDarkTheme() ? "white" : "black";    
    this.optionsSpieltagsverlauf.legend.labels.padding = size;
    this.setFont(this.optionsSpieltagsverlauf.legend.labels, color, size);
    this.setFont(this.optionsSpieltagsverlauf.scales.xAxes[0].scaleLabel, color, size);
    this.setFont(this.optionsSpieltagsverlauf.scales.xAxes[0].ticks, color, size);
    this.optionsSpieltagsverlauf.scales.xAxes[0].ticks.fontSize = 12;
    this.setFont(this.optionsSpieltagsverlauf.scales.yAxes[0].scaleLabel, color, size);
    this.setFont(this.optionsSpieltagsverlauf.scales.yAxes[0].ticks, color, size);

    this.setFont(this.optionsAnzahlGewonneneRunden.scales.xAxes[0].ticks, color, size);
    this.setFont(this.optionsAnzahlGewonneneRunden.scales.yAxes[0].ticks, color, size);
  }

  private setFont(object: any, color: string, size: number) {
    object.fontColor = color;
    object.fontSize = size;
  }

  private countAnzahlGespielteSolos(spieler: Spieler) {
    return this.spieltag.runden.filter(r => {
      if (r.spieler.includes(spieler) && r.solo !== Solo.KEIN_SOLO) {
        return (r.reGewinnt && r.gewinner.includes(spieler)) || (!r.reGewinnt && ! r.gewinner.includes(spieler));
      }
    }).length;
  }


}

enum MenuItemId {
  Settings = "Settings",  
  Rules = "Rules",  
}