import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Field} from '../../models/field.interface';
import {FieldConfig} from '../../models/field-config.interface';

@Component({
  moduleId: module.id,
  selector: 'form-select',
  styleUrls: ['form-select.component.css'],
  template: `
    <div
      class="dynamic-field dynamic-field-layout form-select"
      [formGroup]="group">
      <select [formControlName]="config.name" [(ngModel)]="defaultValue">
        <option hidden disabled *ngIf="config.options.length > 1" value="">{{ config.placeholder }}</option>
        <option *ngFor="let option of config.options" [value]="option.id">
          {{ option.name ? option.name : option.id }}
        </option>
      </select>
      <div *ngIf="config.error" class="alert alert-danger">
        {{ config.error }}
      </div>
    </div>
  `
})
export class FormSelectComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;
  defaultValue: any;

  ngOnInit() {
    if (this.config.options) {
      if (this.config.options.length == 1) {
        this.defaultValue = this.config.options[0].id;
      } else if (this.config.options.length > 1) {
        this.defaultValue = '';
      }
    }
  }
}
