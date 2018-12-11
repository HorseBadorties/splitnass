import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import * as _ from "lodash";

import { SpieltagService } from '../../services/spieltag.service';
import { Spieltag } from 'src/model/spieltag';
import { Spieler } from 'src/model/spieler';
import { Solo } from 'src/model/solo';
import { playerColors } from './colors';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-current-charts',
  templateUrl: './current.charts.component.html',
  styleUrls: ['./current.charts.component.css']
})
export class CurrentChartsComponent implements OnInit, OnDestroy {
  
  subscribtion: Subscription;
  spieltag: Spieltag;
  spieltagsverlauf: any;
  anzahlGewonnenerRunden: any;
  anzahlSolos: any;
  fontColor: string = "white";
  optionsSpieltagsverlauf;
  optionsAnzahlGewonneneRunden;

  private setOptions() {
      this.optionsSpieltagsverlauf = {
        title: {
          display: false
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            fontColor: this.fontColor
          }
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Runde',
              fontColor: this.fontColor
            },
            ticks: {
              fontColor: this.fontColor
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Punkte',
              fontColor: this.fontColor
            },
            ticks: {
              fontColor: this.fontColor
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
              fontColor: this.fontColor
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              stepSize: 1,
              fontColor: this.fontColor
            }
          }]
        }
      };
    }

  constructor(
    public spieltagService: SpieltagService, 
    private themeService: ThemeService, 
    private location: Location) { 
      this.fontColor = this.themeService.isDarkTheme() ? "white" : "black";
      this.setOptions();
    }

  ngOnInit() {
    this.subscribtion = this.spieltagService.spieltag.subscribe(spieltag => this.calcData(spieltag));
  }

  ngOnDestroy() {
    if (this.subscribtion) {
      this.subscribtion.unsubscribe();
    }
  }

  navigateBack() {
    this.location.back();
  }

  private calcData(spieltag: Spieltag) {  
    if (!spieltag) return;
    this.spieltag = spieltag;
    const gespielteRunden = spieltag.runden.filter(r => r.isBeendet);

    // Spieltagsverlauf
    const newSpieltagsverlaufData = {};
    newSpieltagsverlaufData["labels"] = gespielteRunden.map(r => r.nr.toString());
    const datasetsSpieltagsverlauf = [];
    spieltag.spieler.forEach(s => {
      const dataset = {};     
      dataset["label"] = s.name;      
      dataset["data"] = gespielteRunden.map(r => spieltag.getPunktestand(r, s));      
      dataset["fill"] = false;      
      datasetsSpieltagsverlauf.push(dataset);
    });
    _.forEach(datasetsSpieltagsverlauf, (value, index) => value["borderColor"] = playerColors[index]);
    newSpieltagsverlaufData["datasets"] = datasetsSpieltagsverlauf;
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

  private countAnzahlGespielteSolos(spieler: Spieler) {
    return this.spieltag.runden.filter(r => {
      if (r.spieler.includes(spieler) && r.solo !== Solo.KEIN_SOLO) {
        return (r.reGewinnt && r.gewinner.includes(spieler)) || (!r.reGewinnt && ! r.gewinner.includes(spieler));
      }
    }).length;
  }


}
