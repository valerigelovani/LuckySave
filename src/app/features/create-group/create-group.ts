import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Group } from '../../core/models';
import { formatCurrency } from '../../core/utils/currency.util';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-create-group-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    SectionHeader,
  ],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGroupPage {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private router = inject(Router);

  private durationTouchedByUser = false;

  createdGroup = signal<Group | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    description: ['', [Validators.maxLength(240)]],
    monthlyContribution: [200, [Validators.required, Validators.min(10), Validators.max(5000)]],
    totalMembers: [6, [Validators.required, Validators.min(2), Validators.max(20)]],
    durationMonths: [6, [Validators.required, Validators.min(2), Validators.max(24)]],
    isPrivate: [true],
    autoRandomDraw: [true],
  });

  get pot(): number {
    const c = this.form.controls.monthlyContribution.value || 0;
    const m = this.form.controls.totalMembers.value || 0;
    return c * m;
  }

  formatCurrency = formatCurrency;

  constructor() {
    this.form.controls.totalMembers.valueChanges.subscribe((value) => {
      if (!this.durationTouchedByUser) {
        this.form.controls.durationMonths.setValue(value, { emitEvent: false });
      }
    });
    this.form.controls.durationMonths.valueChanges.subscribe(() => {
      this.durationTouchedByUser = true;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const group = this.groupService.createGroup({
      name: value.name.trim(),
      description: value.description?.trim() || undefined,
      monthlyContribution: value.monthlyContribution,
      totalMembers: value.totalMembers,
      durationMonths: value.durationMonths,
      isPrivate: value.isPrivate,
      autoRandomDraw: value.autoRandomDraw,
    });

    this.createdGroup.set(group);
  }

  goToGroup(): void {
    this.router.navigate(['/dashboard']);
  }

  createAnother(): void {
    this.createdGroup.set(null);
    this.durationTouchedByUser = false;
    this.form.reset({
      name: '',
      description: '',
      monthlyContribution: 200,
      totalMembers: 6,
      durationMonths: 6,
      isPrivate: true,
      autoRandomDraw: true,
    });
  }
}
