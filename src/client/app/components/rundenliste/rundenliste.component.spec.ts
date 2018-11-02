import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RundenlisteComponent } from './rundenliste.component';

describe('RundenlisteComponent', () => {
  let component: RundenlisteComponent;
  let fixture: ComponentFixture<RundenlisteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RundenlisteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RundenlisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
