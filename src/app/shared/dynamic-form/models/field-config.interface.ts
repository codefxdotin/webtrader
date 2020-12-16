import {ValidatorFn} from '@angular/forms';

export interface FieldConfig {
  disabled?: boolean,
  error?: any,
  inputType?: string,
  label?: string,
  name: string,
  options?: any[],
  placeholder?: string,
  type: string,
  validation?: ValidatorFn[],
  value?: any
}
