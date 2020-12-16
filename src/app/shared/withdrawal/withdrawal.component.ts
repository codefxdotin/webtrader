import {Component, ViewChild} from '@angular/core';
import {Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PerfectScrollbarComponent} from 'ngx-perfect-scrollbar';
import {DynamicFormComponent} from '../dynamic-form/containers/dynamic-form/dynamic-form.component';
import {WTStorageService} from '../service/wt-storage.service';
import {AcceptedValidator} from '../directives/accepted-validator.directive';
import {WithdrawalService} from './withdrawal.service';
import {TranslatePipe} from '../translate/translate.pipe';
import {TranslateService} from '../translate/translate.service';
import {WTUtilService} from '../service/wt-util.service';
import cacheBusting from '../../../cache-busting/cache-busting.json';

/**
 * This class represents the component.
 */
@Component({
	moduleId: module.id,
	selector: 'withdrawal',
	templateUrl: 'withdrawal.component.html',
	styleUrls: ['withdrawal.component.css'],
})

export class WithdrawalComponent {
	withdrawalAllowed: boolean = true;
	withdrawalErrMessage: any;
	withdrawalComponentFields: any;
	getWithdrawalMethods: any;
	withdrawalGatewaySelected: boolean = false;
	selectedGateway: any;
	selectedGatewayCommon: any;
	config: any = [];
	empDivs: any = [];
	previousValid: any;
	gateWayRedirect: any = {};
	private validationMessages: any = {};
	private formValidStatus: boolean = false;
	@ViewChild(DynamicFormComponent, { static: false }) form: DynamicFormComponent;
	@ViewChild('gatewayRedirect', { static: false }) gatewayRedirectForm: any;
	cacheBusting = cacheBusting;

	constructor(private withdrawalService: WithdrawalService,
		private wtStorageService: WTStorageService,
		private activeModal: NgbActiveModal,
    private WTUtil: WTUtilService,
		public translateService: TranslateService, ) {
		this.withdrawalService.getWithdrawal().subscribe(
			(data: any) => {
				this.withdrawalAllowed = true;
				if (data && data.title) {
					this.withdrawalComponentFields = data;
					this.getWithdrawalMethods = data.withdrawal_methods;
					let rem = (this.getWithdrawalMethods.length % 4);
					this.empDivs = [];
					if(rem != 0 && this.getWithdrawalMethods.length > 4){
						for(let num = 0; num < 4 - rem; num++) this.empDivs.push(num);
					}
				}
			},
			(err: any) => {
				this.withdrawalAllowed = false;
				this.withdrawalErrMessage = err.msg;
			}
		);
	}
	selectWithdrawalGateway(index: number) {
		this.selectedGateway = this.withdrawalComponentFields.withdrawal_methods[index];
		for (let i = 0; i < this.selectedGateway.form.element.length; i++) {
			let formField = this.selectedGateway.form.element[i];
			// if(this.selectedGateway.form.element[i].ref){
			// 	formField = this.withdrawalComponentFields.common.element[this.commonIndex]
			// }
			switch (formField.type) {
				case 'select': {
					this.config.select.push({
						type: 'select',
						label: formField.label,
						name: formField.name,
						options: formField.options,
						placeholder: formField.label,
						// validation : [Validators.required]
						validation: this.getValidators(formField.rules, formField.name)

					})
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
						// validation: [Validators.required]
					})
					break;
				}
				case 'file': {
					this.config.push({
						type: 'input',
						inputType: 'file',
						label: formField.label,
						name: formField.name,
						validation: this.getValidators(formField.rules, formField.name)
						// validation: [Validators.required]
					})
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
						// validation: [Validators.required]
					})
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
						name: formField.name,
					})
					break;
				}
			}

		}

		// this.selectedGatewayCommon = this.withdrawalComponentFields.common;
		for (let i = 0; i < this.withdrawalComponentFields.common.element.length; i++) {
			if (this.withdrawalComponentFields.common.element[i].name == "withdrawal_note") {
				this.config.push({
					type: 'input',
					inputType: this.withdrawalComponentFields.common.element[i].type,
					placeholder: this.withdrawalComponentFields.common.element[i].label,
					name: this.withdrawalComponentFields.common.element[i].name,
				})
			}
			// let commonFields = this.selectedGatewayCommon.element[i];
			if (this.withdrawalComponentFields.common.element[i].name == "third_party_agree") {
				this.config.push({
					type: 'input',
					inputType: this.withdrawalComponentFields.common.element[i].type,
					label: this.withdrawalComponentFields.common.element[i].label,
					name: this.withdrawalComponentFields.common.element[i].name,
					validation: this.getValidators(undefined, this.withdrawalComponentFields.common.element[i].name, true)

				});
			}

		}
		this.config.push({
			type: 'button',
			label: 'Submit',
			name: 'submit',
		});
		this.withdrawalGatewaySelected = true;
		setTimeout(
			() => {
				this.previousValid = this.form.valid;
				this.form.changes.subscribe(() => {
					if (this.form.valid !== this.previousValid) {
						this.previousValid = this.form.valid;
						// this.form.setDisabled('submit', !this.previousValid);
					}
					this.showValidationMessage();
				});
				// this.form.setDisabled('submit', true);
			});
	}
	withdrawalFormSubmit(data: any) {
		this.showValidationMessage();
		if (this.formValidStatus) {
			this.withdrawalAllowed = false;
			let callBody = this.form.value;
			for (let i = 0; i < this.selectedGateway.form.info.length; i++) {
				callBody[this.selectedGateway.form.info[i].name] = this.selectedGateway.form.info[i].value;
				callBody.gateway_url = this.selectedGateway.form.url;
				this.withdrawalService.postGatewayForm(this.WTUtil.config.WT_SERVER_APP + this.WTUtil.config.WITHDRAWAL_WT_URI, this.selectedGateway.form.method,
					callBody).subscribe(
					(data: any) => {
						this.withdrawalErrMessage = data.msg;
					},
					(error: any) => {
						this.withdrawalErrMessage = error.msg;
					})
			}
		}
	}
	private showValidationMessage() {
		this.formValidStatus = true;
		if (!this.form) { return; }
		const form = this.form.form;
		for (let i = 0; i < this.config.length; i++) {
			const field = this.config[i].name;
			this.config[i].error = '';
			const control = form.get(field);
			if (control && !control.valid) {
				const messages = this.validationMessages[field];
				for (const key in control.errors) {
					this.config[i].error += messages[key] + ' ';
					this.formValidStatus = false;
				}
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
					this.validationMessages[fieldName].min = "Min allowed value " + strArr[0];
					this.validationMessages[fieldName].max = "Max allowed value " + strArr[1];
				} else if (rules[i].indexOf('regex') > -1) {
					let strArr = rules[i].split(':');
					validation.push(Validators.pattern(strArr[1].substring(strArr[1].indexOf('^') + 1, strArr[1].indexOf('$'))));
					this.validationMessages[fieldName].pattern = "allowed pattern " + strArr[1].substring(strArr[1].indexOf('^') + 1, strArr[1].indexOf('$'));
				}
			}
		}
		if (toAccept) {
			validation.push(AcceptedValidator.validate);
			this.validationMessages[fieldName].accepted = "Please select the term and condition checkbox";
		}
		return validation;
	}
	closeWithdrawal() {
		// this.activeModal.close();
		if (!this.withdrawalGatewaySelected || !this.withdrawalAllowed)
			this.activeModal.close();
		else
			this.withdrawalGatewaySelected = false;

		this.config = [];
		this.withdrawalErrMessage = [];
		this.validationMessages = {};
	}
}

