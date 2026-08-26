import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroCard } from './hero-card';
import { HEROES_MOCK } from '../../testing/hero-list.mock';

describe('HeroCard', () => {
  let component: HeroCard;
  let fixture: ComponentFixture<HeroCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hero', HEROES_MOCK[0]);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
