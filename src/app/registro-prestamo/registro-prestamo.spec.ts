import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPrestamo } from './registro-prestamo';

describe('RegistroPrestamo', () => {
  let component: RegistroPrestamo;
  let fixture: ComponentFixture<RegistroPrestamo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPrestamo],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPrestamo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
