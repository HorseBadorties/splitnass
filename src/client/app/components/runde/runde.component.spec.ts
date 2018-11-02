import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RundeComponent } from './runde.component';

describe('RundeComponent', () => {
  let component: RundeComponent;
  let fixture: ComponentFixture<RundeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RundeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RundeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
