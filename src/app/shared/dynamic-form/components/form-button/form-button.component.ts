import {Component} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Field} from '../../models/field.interface';
import {FieldConfig} from '../../models/field-config.interface';

@Component({
  moduleId: module.id,
  selector: 'form-button',
  styleUrls: ['form-button.component.css'],
  template: `
    <div
      class="dynamic-field dynamic-bt-block form-button"
      [formGroup]="group">
      <button class="btn bt-second-color"
              [disabled]="config.disabled"
              [name]="config.name"
              type="submit">
        {{ config.label }}
      </button>
    </div>
  `
})
export class FormButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
