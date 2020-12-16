import {Component, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PerfectScrollbarComponent} from 'ngx-perfect-scrollbar';
import {DynamicFormComponent} from '../dynamic-form/containers/dynamic-form/dynamic-form.component';
import {WTStorageService} from '../service/wt-storage.service';
import {FileValidator} from '../directives/file-validator.directive';
import {AcceptedValidator} from '../directives/accepted-validator.directive';
import {DepositService} from './deposit.service';
import swal from "sweetalert2";
import {TranslatePipe} from '../translate/translate.pipe';
import {TranslateService} from '../translate/translate.service';
import {WTUtilService} from '../service/wt-util.service';
import cacheBusting from '../../../cache-busting/cache-busting.json';

const noop = () => {};
/**
 * This class represents the component.
 */
@Component({
  moduleId: module.id,
  selector: 'deposit',
  templateUrl: 'deposit.component.html',
  styleUrls: ['deposit.component.css'],
})

export class DepositComponent {

  componentFields: any;
  gatewaySelected: boolean = false;
  selectedGateway: any;
  config: any = [];
  previousValid: any;
  gateWayRedirect: any = {};
  showErrorMessage: boolean = false;
  errorMessages: any = [];
  depositFormSubmitting: boolean = false;
  fileExtensionError: boolean = false;
  fileSizeError: boolean = false;
  private validationMessages: any = {};
  private formValidStatus: boolean = false;
  @ViewChild(DynamicFormComponent, { static: false }) depositForm: DynamicFormComponent;
  @ViewChild('gatewayRedirect', { static: false }) gatewayRedirectForm: any;
  cacheBusting = cacheBusting;

  constructor(private depositService: DepositService,
              private wtStorageService: WTStorageService,
              private activeModal: NgbActiveModal,
              public translateService: TranslateService,
              private WTUtil: WTUtilService) {
    this.depositService.getDepositOptions().subscribe(
      (data: any) => {
        if (data && data.title) {
          this.componentFields = data;
        }
      }
    );
  }

  closeView() {
    if (!this.gatewaySelected)
      this.activeModal.close();
    else
      this.gatewaySelected = false;
    this.config = [];
    this.errorMessages = [];
    this.validationMessages = {};
  }

  selectGateway(index: number) {
    this.selectedGateway = this.componentFields.gateways[index];
    for (let i = 0; i < this.selectedGateway.form.element.length; i++) {
      let formField = this.selectedGateway.form.element[i];
      if (this.selectedGateway.form.element[i].ref) {
        formField = this.componentFields.common.element[this.getCommonIndex(this.selectedGateway.form.element[i].ref)];
      }
      switch (formField.type) {
        case 'select': {
          this.config.push({
            type: 'select',
            label: formField.label,
            name: formField.name,
            options: formField.option,
            placeholder: formField.label,
            validation: this.getValidators(formField.rules, formField.name)
          });
          break;
        }
        case 'number': {
          this.config.push({
            type: 'input',
            inputType: 'number',
            label: formField.label,
            name: formField.name,
            placeholder: formField.label,
            validation: this.getValidators(formField.rules, formField.name)
          });
          break;
        }
        case 'file': {
          this.config.push({
            type: 'input',
            inputType: 'file',
            label: formField.label,
            name: formField.name,
            validation: this.getValidators(formField.rules, formField.name)
          });
          break;
        }
        case 'text': {
          this.config.push({
            type: 'input',
            inputType: 'text',
            label: formField.label,
            name: formField.name,
            placeholder: formField.label,
            validation: this.getValidators(formField.rules, formField.name)
          });
          break;
        }
        case 'checkbox': {
          this.config.push({
            type: 'input',
            inputType: 'checkbox',
            label: formField.label,
            name: formField.name,
            //value: false,
            validation: this.getValidators(undefined, formField.name, true)
          });
          break;
        }
        case 'button': {
          this.config.push({
            type: 'button',
            label: formField.label,
            name: 'submit',
          });
          break;
        }
      }
    }
    this.gatewaySelected = true;
    setTimeout(
      () => {
        this.previousValid = this.depositForm.valid;
        this.depositForm.changes.subscribe(() => {
          if (this.depositForm.valid !== this.previousValid) {
            this.previousValid = this.depositForm.valid;
            // this.depositForm.setDisabled('submit', !this.previousValid);
          }
          this.showErrorMessage = false;
          this.errorMessages = [];
          this.showValidationMessage();
        });
        // this.depositForm.setDisabled('submit', true);
      });
  }

  gatewayFormSubmit(value: any) {
    this.showValidationMessage();
    if (this.formValidStatus) {
      if (this.selectedGateway.name.indexOf('BankWire') > -1) { // bank wire
        let postBody = new FormData();
        postBody.append(Object.keys(this.depositForm.value)[0], this.depositForm.value[Object.keys(this.depositForm.value)[0]]);
        postBody.append('mt4_account', this.wtStorageService.selectedMt4Account.accountId);
        postBody.append('gateway_url', this.selectedGateway.form.url);
        this.depositFormSubmitting = true;
        this.depositService.postGatewayForm(this.WTUtil.config.WT_SERVER_APP + this.WTUtil.config.DEPOSIT_UPLOAD_URI,
          this.selectedGateway.form.method, postBody).subscribe((data: any) => {
            if (data && data.msg[0] && data.msg[0].type === 'success') {
              swal({
                html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
                  .transform("Bankwire_Deposit_Success")}<span>`,
                timer: 2000,
                width: 300,
                padding: 20,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
                showConfirmButton: false,
                target: '#body_full_screen'
              });
              this.closeView();
            }
            if (data && data.msg[0] && data.msg[0].type === 'danger') {
              swal({
                html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
                  .transform(data.msg[0].body[0])}<span>`,
                timer: 2000,
                width: 300,
                padding: 20,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
                showConfirmButton: false,
                target: '#body_full_screen'
              });
            }
            this.depositFormSubmitting = false;
          },
          (error: any) => {
            this.depositFormSubmitting = false;
            this.showErrorMessage = true;
            this.errorMessages = error.msg[0].body;
          });
      } else {
        if (this.selectedGateway.name.indexOf('Masterpay') > -1) {
          this.depositForm.value.returnUrl = window.location.origin;
        }
        this.depositFormSubmitting = true;
        this.depositForm.value.gateway_url = this.selectedGateway.form.url;
        this.depositService.postGatewayForm(this.WTUtil.config.WT_SERVER_APP + this.WTUtil.config.DEPOSIT_CARD_URI,
          this.selectedGateway.form.method, this.depositForm.value).subscribe((data: any) => {
            if (data.url) {
              this.gateWayRedirect = data;
              this.gateWayRedirect.returnUrl = window.location.href + '?fromGateWay=true';
              setTimeout(
                () => {
                  this.gatewayRedirectForm.nativeElement.submit();
                }
              );
            }
            if (data && data.msg[0] && data.msg[0].type === 'danger') {
              swal({
                html: `<span style="color:#ffffff">${(new TranslatePipe(this.translateService))
                  .transform(data.msg[0].body[0])}<span>`,
                timer: 2000,
                width: 300,
                padding: 20,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
                showConfirmButton: false,
                target: '#body_full_screen'
              });
            }
            this.depositFormSubmitting = false;
          },
          (error: any) => {
            this.depositFormSubmitting = false;
            this.showErrorMessage = true;
            this.errorMessages = error.msg[0].body;
          });
      }
    }
  }

  getCommonIndex(element: string) {
    if (element && element.indexOf('common.element') > -1) {
      return this.componentFields.common.element.findIndex(
        (ele: any) => ele.name == element.substring(element.indexOf('element') + 8, element.length));
    }
  }

  private showValidationMessage() {
    this.formValidStatus = true;
    if (!this.depositForm) {
      return;
    }
    const form = this.depositForm.form;
    for (let i = 0; i < this.config.length; i++) {
      const field = this.config[i].name;
      this.config[i].error = '';
      const control = form.get(field);
      if (control && !control.valid) {
        const messages = this.validationMessages[field] || {};
        for (const key in control.errors) {
          this.config[i].error += messages[key] + ' ';
          this.formValidStatus = false;
        }
      }
    }
    if (this.selectedGateway.name.indexOf('BankWire') > -1) { // bank wire
      const fileName = form.value.document.name;
      const rulesString = this.selectedGateway.form.elements.document.rules;
      const allowedExtensionsText = rulesString.substring(rulesString.lastIndexOf('mimes:') + 6, rulesString.length);
      const allowedExtensions = allowedExtensionsText.split(',');
      const fileExtension = fileName.split('.').pop();
      if ((allowedExtensions.indexOf(fileExtension) === -1)) {
        this.fileExtensionError = true;
        this.showErrorMessage = true;
        this.formValidStatus = false;
        const extensionErrorMessage = 'Upload only ' + allowedExtensionsText;
        this.errorMessages.indexOf(extensionErrorMessage) === -1 ? this.errorMessages.push(extensionErrorMessage) : noop();
      }
      const allowedSizeString = rulesString.substring(rulesString.lastIndexOf('max:') + 4, rulesString.lastIndexOf('|'));
      if ((form.value.document.size > Number(allowedSizeString))) {
        this.fileSizeError = true;
        this.showErrorMessage = true;
        this.formValidStatus = false;
        const fileSizeErrorMessage = 'Max allowed size ' + Number(allowedSizeString) + ' bytes';
        this.errorMessages.indexOf(fileSizeErrorMessage) === -1 ? this.errorMessages.push(fileSizeErrorMessage) : noop();
      }
    }
  }

  private getValidators(fieldRules: any, fieldName: string, toAccept?: boolean) {
    let validation: any = [];
    this.validationMessages[fieldName] = {};
    if (fieldRules) {
      let rules = fieldRules.split('|');
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].indexOf('required') > -1) {
          validation.push(Validators.required);
          this.validationMessages[fieldName].required = 'Required';
        } else if (rules[i].indexOf('max') > -1) {
          let strArr = rules[i].split(':');
          validation.push(Validators.maxLength(strArr[1]));
          this.validationMessages[fieldName].maxlength = 'Max char length ' + strArr[1];
        } else if (rules[i].indexOf('min') > -1) {
          let strArr = rules[i].split(':');
          validation.push(Validators.minLength(strArr[1]));
          this.validationMessages[fieldName].minlength = 'Min char length ' + strArr[1];
        } else if (rules[i].indexOf('between') > -1) {
          let strArr = rules[i].split(':')[1].split(',');
          validation.push(Validators.min(strArr[0]));
          validation.push(Validators.max(strArr[1]));
          this.validationMessages[fieldName].min = 'Min allowed value ' + strArr[0];
          this.validationMessages[fieldName].max = 'Max allowed value ' + strArr[1];
        } else if (rules[i].indexOf('regex') > -1) {
          let strArr = rules[i].split(':');
          validation.push(Validators.pattern(strArr[1].substring(strArr[1].indexOf('^') + 1, strArr[1].indexOf('$'))));
          this.validationMessages[fieldName].pattern = 'Allowed pattern ' + strArr[1].substring(strArr[1].indexOf('^') +
            1, strArr[1].indexOf('$'));
        }
      }
    }
    if (toAccept) {
      validation.push(AcceptedValidator.validate);
      this.validationMessages[fieldName].accepted = 'Please select the term and condition checkbox';
    }
    return validation;
  }
}
