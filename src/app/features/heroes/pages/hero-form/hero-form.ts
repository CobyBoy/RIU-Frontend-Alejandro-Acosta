import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateHero } from '../../models/hero.model';
import { HeroFormFacade } from '../../services/hero-form.facade';
import { HeroUppercaseDirective } from '../../../../shared/directives/hero-uppercase.directive';
import { map } from 'rxjs';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HeroFormFacade]
})
export class HeroForm {
  private readonly _formBuilder = inject(FormBuilder);
  readonly facade = inject(HeroFormFacade);
  readonly id = input<string>();

  private readonly _uniqueNameValidator: AsyncValidatorFn = (control) => {
    const heroName = (control.value as string).trim();

    return this.facade
      .isNameTaken(heroName, this.id())
      .pipe(map((isTaken) => (isTaken ? { nameDuplicated: true } : null)));
  };

  readonly form = this._formBuilder.nonNullable.group({
    name: [
      '',
      {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [this._uniqueNameValidator],
        updateOn: 'blur',
      },
    ],
    realName: ['', [Validators.required, Validators.minLength(3)]],
    imageUrl: ['', [Validators.required]],
    link: [''],
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
    if (this.form.invalid || this.form.pending) {
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
