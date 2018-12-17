import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from "rxjs/operators";
import { Rules } from 'src/model/rules';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline: boolean;
  private _animateRoutes: boolean;
  private _adminMode: boolean;
  private _autoShowRundendetails: boolean;
  private _hideInactivePlayers: boolean;
  private _rules = new Rules();

  public offlineStatus = new BehaviorSubject(undefined);
  public hideInactivePlayersStatus = new BehaviorSubject(undefined);  
  
  public get offline(): boolean {
    return this._offline;
  }
  
  public set offline(value: boolean) {
    this._offline = value;
    this.setBoolean("offline", value);
    this.offlineStatus.next(value);
  }

  public get animateRoutes(): boolean {
    return this._animateRoutes;
  }
  
  public set animateRoutes(value: boolean) {
    this._animateRoutes = value;
    this.setBoolean("animateRoutes", value);
  }

  public get adminMode(): boolean {
    return this._adminMode;
  }
  
  public set adminMode(value: boolean) {
    this._adminMode = value;
    this.setBoolean("adminMode", value);
  }

  public get autoShowRundendetails(): boolean {
    return this._autoShowRundendetails;
  }
  
  public set autoShowRundendetails(value: boolean) {
    this._autoShowRundendetails = value;
    this.setBoolean("autoShowRundendetails", value);
  }

  public get hideInactivePlayers(): boolean {
    return this._hideInactivePlayers;
  }
  
  public set hideInactivePlayers(value: boolean) {
    this._hideInactivePlayers = value;
    this.setBoolean("hideInactivePlayers", value);
    this.hideInactivePlayersStatus.next(value);
  }

  public get rules(): Rules {
    return this._rules;
  }

  public set rules(value: Rules) {
    this._rules = value;
    this.localStorage.setItemSubscribe("rules", value);
  }

  public saveSpieltagJSON(spieltagJSON: string) {
    this.localStorage.setItemSubscribe("savedSpieltag", spieltagJSON);
  }

  public getSavedSpieltagJSON(): Observable<string> {
    return this.localStorage.getItem<string>("savedSpieltag", { schema: { type: 'string' } });
  } 

  public joinedSpieltag(beginn: string) {
    this.localStorage.setItemSubscribe("joinedSpieltag", beginn);
  }

  public getJoinedSpieltag(): Observable<string> {
    return this.localStorage.getItem<string>("joinedSpieltag", { schema: { type: 'string' } });
  } 

  public setTheme(themeName: string) {
    this.localStorage.setItemSubscribe("theme", themeName);
  }

  public getTheme(): Observable<string> {
    return this.localStorage.getItem<string>("theme", { schema: { type: 'string' } });
  } 

  constructor(private localStorage: LocalStorage) { 
    this.getBoolean("offline").pipe(first()).subscribe(value => {
        this._offline = value && value.valueOf();
        this.offlineStatus.next(this._offline);
      });
    this.getBoolean("animateRoutes").pipe(first())
      .subscribe(value => this._animateRoutes = value !== null ? value.valueOf() : true);
    this.getBoolean("adminMode").pipe(first())
      .subscribe(value => this._adminMode = value !== null ? value.valueOf() : false);
    this.getBoolean("autoShowRundendetails").pipe(first())
      .subscribe(value => this._autoShowRundendetails = value !== null ? value.valueOf() : true);
    this.getBoolean("hideInactivePlayers").pipe(first())
      .subscribe(value => this._hideInactivePlayers = value !== null ? value.valueOf() : true);
    this.localStorage.getItem("rules").pipe(first())
      .subscribe(value => this._rules = value !== null ? value as Rules : new Rules());     
       
  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.setItemSubscribe(name, value);
  }

  private getBoolean(name: string): Observable<Boolean> {
    return this.localStorage.getItem<boolean>(name, { schema: { type: 'boolean' } });
  }

}
