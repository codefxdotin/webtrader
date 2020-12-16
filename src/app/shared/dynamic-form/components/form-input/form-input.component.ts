import {Component, ViewContainerRef, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Field} from '../../models/field.interface';
import {FieldConfig} from '../../models/field-config.interface';

@Component({
  moduleId: module.id,
  selector: 'form-input',
  styleUrls: ['form-input.component.css'],
  template: `
    <div
      class="dynamic-field dynamic-field-layout form-input"
      [formGroup]="group">
      <input *ngIf="config.inputType != 'checkbox' && config.inputType != 'file'"
             [type]="config.inputType"
             [attr.placeholder]="config.placeholder"
             [formControlName]="config.name">
      <input id="file-upload" #fileInput *ngIf="config.inputType == 'file'" name="file" type="file" (change)="fileUpload($event)">
      <input type="hidden" *ngIf="config.inputType == 'file'" [formControlName]="config.name"/>
      <div *ngIf="config.inputType == 'checkbox'" class="terms-checkbox">
        <input *ngIf="config.inputType == 'checkbox'" id="checkbox_{{config.name}}" type="checkbox"
               [formControlName]="config.name" [(ngModel)]="config.value" (change)="config.value = $event.target.checked">
        <label *ngIf="config.inputType == 'checkbox'" for="checkbox_{{config.name}}" class="rem-input terms-condition">{{config.label}}</label>
      </div>

      <div *ngIf="config.error" class="alert alert-danger">
        {{ config.error }}
      </div>
    </div>
  `
})
export class FormInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  @ViewChild('fileInput', { static: false }) fileInput: any;

  fileUpload(event: any) {
    let fi = this.fileInput.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.group.patchValue({
        [this.config.name]: fileToUpload
      });
    }
  }
}
