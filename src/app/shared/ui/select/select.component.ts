import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: SelectOption[] = [];
  @Input() id = `app-select-${uid++}`;

  value: string | number = '';
  disabled = false;
  private onChange: (v: string | number) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string | number): void {
    this.value = v ?? '';
  }
  registerOnChange(fn: (v: string | number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  onSelect(e: Event): void {
    this.value = (e.target as HTMLSelectElement).value;
    this.onChange(this.value);
  }
}
