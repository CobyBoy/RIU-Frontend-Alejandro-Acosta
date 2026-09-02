import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateHero } from '../../models/hero.model';
import { HeroFormFacade } from '../../services/hero-form.facade';
import { HeroUppercaseDirective } from '../../../../shared/directives/hero-uppercase.directive';

@Component({
  selector: 'app-hero-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    HeroUppercaseDirective,
  ],
  templateUrl: './hero-form.html',
  styleUrl: './hero-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HeroFormFacade],
})
export class HeroForm {
  private readonly _formBuilder = inject(FormBuilder);
  readonly facade = inject(HeroFormFacade);
  readonly id = input<string>();

  readonly form = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    realName: ['', [Validators.required, Validators.minLength(3)]],
    imageUrl: ['', [Validators.required]],
    link: ['']
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      this.facade.load(id);
    });

    effect(() => {
      const hero = this.facade.hero();
      if (!hero) return;
      this.form.setValue({
        name: hero.name,
        realName: hero.realName,
        imageUrl: hero.imageUrl,
        link: hero.link ?? '',
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.id();
    if (id) {
      this.facade.update(id, this.createNewHero());
      return;
    }

    this.facade.create(this.createNewHero());
  }

  private createNewHero(): CreateHero {
    const formValue = this.form.getRawValue();
    return {
      name: formValue.name.trim(),
      realName: formValue.realName.trim(),
      link: formValue.link.trim(),
      imageUrl: formValue.imageUrl.trim(),
    };
  }

  onCancel(): void {
    this.facade.cancel();
  }
}
