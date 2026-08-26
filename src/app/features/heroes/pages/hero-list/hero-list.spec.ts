import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroList } from './hero-list';
import { Subject } from 'rxjs';
import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { HEROES_MOCK } from '../../testing/hero-list.mock';
import { HeroCardStub } from '../../testing/hero-card.stub';
import { HeroCard } from '../../ui/hero-card/hero-card';

describe('HeroList', () => {
  let component: HeroList;
  let fixture: ComponentFixture<HeroList>;
  let heroesSubject: Subject<Hero[]>;

  beforeEach(async () => {
    heroesSubject = new Subject<Hero[]>();

    await TestBed.configureTestingModule({
      imports: [HeroList],
      providers: [
        {
          provide: HeroService,
          useValue: {
            getAllHeroes: () => heroesSubject.asObservable(),
          },
        },
      ],
    })
      .overrideComponent(HeroList, {
        remove: {
          imports: [HeroCard],
        },
        add: {
          imports: [HeroCardStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeroList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading while heroes are being loaded', () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando heroes...');
  });

  it('should render the returned heroes', () => {
    heroesSubject.next(HEROES_MOCK);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('2 heroes encontrados.');
    expect(text).toContain('Spider-Man');
    expect(text).toContain('Captain Marvel');
  });

  it('should show an empty state when no heroes are returned', () => {
    heroesSubject.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se encontraron heroes.');
  });

  it('should show an error when loading heroes fails', () => {
    heroesSubject.error(new Error('API error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los heroes.');
  });
});
