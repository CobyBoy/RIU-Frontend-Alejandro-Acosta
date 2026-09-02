import { Component, input, output } from '@angular/core';
import { Hero } from '../models/hero.model';

@Component({
  selector: 'app-hero-card',
  template: `
    @if (hero(); as hero) {
      <div>{{ hero.name }}</div>
    }
  `,
})
export class HeroCardStub {
  readonly hero = input<Hero>();

  readonly editRequested = output<string>();
  readonly deleteRequested = output<Hero>();
  readonly priority = input(false);
}
