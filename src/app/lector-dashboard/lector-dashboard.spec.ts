import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LectorDashboard } from './lector-dashboard';

describe('LectorDashboard', () => {
  let component: LectorDashboard;
  let fixture: ComponentFixture<LectorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectorDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(LectorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
