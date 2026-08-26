import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeroUppercaseDirective } from '../directives/hero-uppercase.directive';

@Component({
  imports: [ReactiveFormsModule, HeroUppercaseDirective],
  template: ` <input heroUppercase [formControl]="control" /> `,
})
export class TestHost {
  readonly control = new FormControl('', {
    nonNullable: true,
  });
}
