import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline: boolean;
  private _animateRoutes: boolean;
  private _adminMode: boolean;
  private _autoShowRundendetails: boolean;
  private _hideInactivePlayers: boolean;

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

  constructor(private localStorage: LocalStorage) { 
    this.getBoolean("offline").pipe(first()).subscribe(value => {
        this._offline = value && value.valueOf();
        this.offlineStatus.next(this._offline);
      });
    this.getBoolean("animateRoutes").pipe(first())
      .subscribe(value => this._animateRoutes = value ? value.valueOf() : true)
    this.getBoolean("adminMode").pipe(first())
      .subscribe(value => this._adminMode = value ? value.valueOf() : false)
    this.getBoolean("autoShowRundendetails").pipe(first())
      .subscribe(value => this._autoShowRundendetails = value ? value.valueOf() : true)
    this.getBoolean("hideInactivePlayers").pipe(first())
      .subscribe(value => this._hideInactivePlayers = value ? value.valueOf() : true)
  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.setItemSubscribe(name, value);
  }

  private getBoolean(name: string): Observable<Boolean> {
    return this.localStorage.getItem<boolean>(name, { schema: { type: 'boolean' } });
  }

}
