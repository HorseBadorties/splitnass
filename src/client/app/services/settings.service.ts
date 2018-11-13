import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline = false;
  private _animateRoutes = false;
  private _adminMode = false;
  private _autoShowRundendetails = true;
  private _hideInactivePlayers = true;

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

  constructor(private localStorage: LocalStorage) { 
    this.getBoolean("offline").pipe(first()).subscribe(value => {
        this._offline = value && value.valueOf();
        this.offlineStatus.next(this._offline);
      });
    this.getBoolean("animateRoutes").pipe(first())
      .subscribe(value => this._animateRoutes = value && value.valueOf())
    this.getBoolean("adminMode").pipe(first())
      .subscribe(value => this._adminMode = value && value.valueOf())
    this.getBoolean("autoShowRundendetails").pipe(first())
      .subscribe(value => this._autoShowRundendetails = value && value.valueOf())
    this.getBoolean("hideInactivePlayers").pipe(first())
      .subscribe(value => this._hideInactivePlayers = value && value.valueOf())
  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.setItemSubscribe(name, value);
  }

  private getBoolean(name: string): Observable<Boolean> {
    return this.localStorage.getItem<boolean>(name, { schema: { type: 'boolean' } });
  }

}
