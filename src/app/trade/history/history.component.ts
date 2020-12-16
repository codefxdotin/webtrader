
import {forkJoin as observableForkJoin, of as observableOf,  Observable } from 'rxjs';
import { Component, EventEmitter, Output } from '@angular/core';
import { TradeService } from '../shared/trade.service';
import { WTStorageService } from '../../shared/service/wt-storage.service';
import { TranslateService } from '../../shared/translate/translate.service';
import { TranslatePipe } from '../../shared/translate/translate.pipe';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import * as environment from '../../../environments/wt.environment';
import swal from 'sweetalert2';




@Component({
	moduleId: module.id,
	selector: 'trade-history',
	templateUrl: 'history.component.html',
	styleUrls: ['history.component.scss']
})
export class TradeHistoryComponent {
	showTradesHistory: boolean = false;
	page: number = 1;
	currentRecords: Array<Object> = [];
	totalPages = 0;
	totalRecordsCount = 0;
	pageList: Array<number> = []
	tradeViewLoaded: boolean = false;
	isHistoryEmpty: boolean = false;
	historyRecords: any = {};
	archieveRecords: any = {};
	private isRequestProcessing: boolean = true;
	private isDataInitialized = false;
	private disableClose: boolean = false;
	private currentPageNumber: number = 1;
	private offsetIndex: number = 0;
	private tradePages: number = 0;
	private archivePages: number = 0;
	private maxDataPerPage: number = 20;
	tradeRecordsCount: number = 0;
	archiveRecordsCount: number = 0;
	isDataOutdated: boolean = false;
	singlgeAPI = environment.WT_CONFIG.getFoxAPI;



	@Output() closeHistoryView: EventEmitter<any> = new EventEmitter<any>();

	constructor(public wtStorageService: WTStorageService, private tradeService: TradeService, private translateService: TranslateService) { }


	initTradeHistory() {

		this.currentPageNumber = 1;
		this.pageList = [];
		this.currentRecords = [];
		this.isRequestProcessing = true;
		this.scrollToTop();
		if (this.isDataOutdated) {
			this.historyRecords = {};
		} else if (this.historyRecords.hasOwnProperty(1)) {
			this.setPageList();
			this.updateView(1);
			this.isHistoryEmpty = (this.historyRecords[1].length === 0);
			this.isDataInitialized = true;
		}
		if (this.singlgeAPI) {
			this.getHistoryFox(1);
		} else {
			this.getHistory(1);
		}
	}

	private setPageList() {
		if (this.totalPages < 3) {
			this.pageList = [];
			for (let i = 1; i <= this.totalPages; i++) {
				this.pageList.push(i);
			}
		} else {
			this.pageList = [1, 2, 3];
		}
	}




	private getHistory(pageNumber: any) {

		// console.log(this.wtStorageService.selectedMt4Account)

		this.tradeService.getTradeHistory(pageNumber, this.maxDataPerPage).subscribe((result: any) => {
			if (result && result.data && result.success) {
				this.tradeRecordsCount = result.data.totalElements;
				this.archiveRecordsCount = 0;
				this.tradePages = result.data.totalPages;
				this.archivePages = 0;
				//this.maxDataPerPage = result.data.numberOfElements;
				this.offsetIndex = this.tradeRecordsCount % this.maxDataPerPage;
				this.totalRecordsCount = this.tradeRecordsCount + this.archiveRecordsCount;
				this.isHistoryEmpty = (this.totalRecordsCount === 0);
				if (this.maxDataPerPage === 0) {
					this.totalPages = 0;
				} else {
					this.totalPages = Math.ceil(this.totalRecordsCount / this.maxDataPerPage);
				}

				let data = result.data.content;

				this.setPageList();
				if (pageNumber == this.currentPageNumber) {
					if (this.isDataOutdated) {
						this.isRequestProcessing = true;
						this.historyRecords = {};
						this.isDataOutdated = false;
					}
					this.updateHistoryRecord(data, pageNumber);
					this.updateView(pageNumber);
				}
				this.isDataInitialized = true;
				this.isRequestProcessing = false;
			} else {
				this.totalPages = 0;
				this.isDataInitialized = true;
				this.isRequestProcessing = false;
			}

		}, (err: any) => {
			this.totalPages = 0;
			this.isDataInitialized = true;
			this.isRequestProcessing = false;
		});


	}

	private mergeData(tradeData: any, archiveData: any): Array<Object> {
		let data = tradeData;
		if (archiveData.length > this.maxDataPerPage - data.length) {
			data = [...data, ...archiveData.slice(0, this.maxDataPerPage - this.offsetIndex)];
		} else {
			data = [...data, ...archiveData]
		}
		return data;
	}

	private updateHistoryRecord(data: any, pageNumber: number) {
		for (let rec of data) {
			if (rec.result === 'Draw') {
				rec.profit = rec.profit.split('-').length > 1 ? rec.profit.split('-')[1] : rec.profit;
			}
		}
		this.historyRecords[pageNumber] = data;
		this.currentRecords = this.historyRecords[pageNumber];
	}

	private updateArchiveRecord(data: any, pageNumber: number) {
		this.archieveRecords[pageNumber] = data;
	}

	private updateView(pageNum: any) {
		if (this.historyRecords[pageNum]) {
			this.currentRecords = this.historyRecords[pageNum];
		}
		this.isRequestProcessing = false;
	}

	showNextPage() {
		if (this.currentPageNumber == this.totalPages) {
			return;
		} else if (this.pageList.indexOf(this.currentPageNumber) >= Math.floor(this.pageList.length / 2)
			&& this.pageList[this.pageList.length - 1] < this.totalPages) {
			this.currentPageNumber = this.pageList[this.pageList.indexOf(this.currentPageNumber)] + 1;
			this.pageList.shift();
			this.pageList.push(this.pageList[this.pageList.length - 1] + 1);
		} else {
			this.currentPageNumber += 1;
		}
		this.updatePage(this.currentPageNumber);
	}

	openTradeClosed(data: any) {
		let updatePages: boolean = false;
		let oldTotalPages = this.totalPages;
		if (this.totalPages < 3) {
			updatePages = true;
		}
		this.tradePages = Math.ceil(this.tradeRecordsCount / this.maxDataPerPage);
		this.totalPages = Math.ceil(this.totalRecordsCount / this.maxDataPerPage);
		this.offsetIndex = this.tradeRecordsCount % this.maxDataPerPage;
		this.historyRecords = {};
		this.scrollToTop();
		this.updatePage(this.currentPageNumber);
		if (oldTotalPages !== this.totalPages && updatePages) this.setPageList();
	}

	updateCurrentPage(pageNum: any) {
		if (this.isRequestProcessing) return;
		this.currentPageNumber = pageNum;
		if (this.pageList[0] > 1
			&& this.pageList.indexOf(this.currentPageNumber) < Math.floor(this.pageList.length / 2)) {
			this.pageList.unshift(this.pageList[0] - 1);
			this.pageList.pop();
		}
		if (this.pageList.indexOf(this.currentPageNumber) > Math.floor(this.pageList.length / 2)
			&& this.pageList[this.pageList.length - 1] < this.totalPages) {
			this.pageList.shift();
			this.pageList.push(this.pageList[this.pageList.length - 1] + 1);
		}

		this.getTradeHistory(pageNum);
		//this.updateHistoryRecord(this.data, pageNum);
		this.updateView(pageNum);
		// if(this.historyRecords.hasOwnProperty(pageNum.toString()) && !this.isDataOutdated){
		// 	this.currentRecords = this.historyRecords[pageNum];
		// 	this.updateView(pageNum);
		// } else if(this.currentPageNumber > this.tradePages){
		// 	this.getTradeHistory(pageNum);
		// 	let archPageNum = this.currentPageNumber - this.tradePages;
		// 	this.offsetIndex = (this.tradeRecordsCount % this.maxDataPerPage) ;
		// 	let data;
		// 	if(this.offsetIndex == 0){
		// 		if(this.archieveRecords.hasOwnProperty(archPageNum.toString())){
		// 			data = this.archieveRecords[archPageNum];
		// 		} else {
		// 			this.getTradeArchiveHistory(pageNum, this.maxDataPerPage);
		// 			return;
		// 		}
		// 	} else {
		// 		let next = archPageNum + 1;
		// 		if(this.archieveRecords.hasOwnProperty(archPageNum.toString())
		// 			&& this.archieveRecords.hasOwnProperty(next.toString())){
		// 			data =  [...this.archieveRecords[archPageNum].slice(this.maxDataPerPage - this.offsetIndex, this.maxDataPerPage), ...this.archieveRecords[next].slice(0, this.maxDataPerPage - this.offsetIndex)];
		// 		} else {
		// 			this.getMultiArchieveData(pageNum, archPageNum, this.offsetIndex);
		// 			return;
		// 		}
		// 	}
		// 	this.updateHistoryRecord(data, pageNum);
		// 	this.updateView(pageNum);
		// } else {
		// 	this.getTradeHistory(pageNum);
		// }
		//}
	}
	private updatePage(pageNum: any) {
		if (this.isRequestProcessing) return;
		this.currentPageNumber = pageNum;
		if (this.historyRecords.hasOwnProperty(pageNum.toString())) {
			this.currentRecords = this.historyRecords[pageNum];
			this.updateView(pageNum);
		} else {
			this.getTradeHistory(pageNum);
			// if(this.currentPageNumber > this.tradePages){
			// 	this.getTradeArchiveHistory(pageNum, this.maxDataPerPage);
			// } else {
			// 	this.getTradeHistory(pageNum);
			// }
		}
	}
	scrollToTop() {
		let tradeHistView = document.getElementById("tradeHistoryView");
		if (tradeHistView) tradeHistView.scrollTop = 0;
	}
	showPreviousPage() {
		if (this.currentPageNumber == 1) {
			return;
		} else if (this.pageList[0] > 1
			&& this.pageList.indexOf(this.currentPageNumber) <= Math.floor(this.pageList.length / 2)) {
			this.currentPageNumber = this.pageList[this.pageList.indexOf(this.currentPageNumber)] - 1;
			this.pageList.unshift(this.pageList[0] - 1);
			this.pageList.pop();
		} else {
			this.currentPageNumber -= 1;
		}
		this.updatePage(this.currentPageNumber);
	}

	private getTradeHistory(pageNumber: any) {
		this.isRequestProcessing = true;
		this.tradeService.getTradeHistory(pageNumber, this.maxDataPerPage).subscribe(
			(history: any) => {
				if (history && history.data) {
					//let data = (history.data.length < this.maxDataPerPage && this.archieveRecords.hasOwnProperty(1))? this.mergeData(history.data, this.archieveRecords[1]) : history.data;
					let data = history.data['content'];
					this.updateHistoryRecord(data, pageNumber);
					if (pageNumber == this.currentPageNumber) this.updateView(pageNumber);
					this.isDataOutdated = false;
				}
			});
	}

	private getMultiArchieveData(pageNumber: number, archPageNum: number, offSet: number) {
		this.isRequestProcessing = true;
		let firstParam = this.archieveRecords.hasOwnProperty(archPageNum.toString()) ? observableOf(null) : this.tradeService.getArchiveHistory(archPageNum, this.maxDataPerPage);
		let secondParam = (archPageNum + 1 > this.archivePages) ? observableOf(null) : this.tradeService.getArchiveHistory(archPageNum + 1, this.maxDataPerPage);
		observableForkJoin([firstParam, secondParam]).subscribe((results: any) => {
			let data;
			if (results[0] && results[0].data) this.updateArchiveRecord(results[0].data, archPageNum);
			if (results[1] && results[1].data) {
				this.updateArchiveRecord(results[1].data, (archPageNum + 1));
				data = [...this.archieveRecords[archPageNum].slice(this.maxDataPerPage - offSet, this.maxDataPerPage), ...results[1].data.slice(0, this.maxDataPerPage - offSet)];
			} else {
				data = [...this.archieveRecords[archPageNum].slice(this.maxDataPerPage - offSet, this.maxDataPerPage)];
			}
			this.updateHistoryRecord(data, pageNumber);
			if (pageNumber == this.currentPageNumber) this.updateView(pageNumber);
		})
	}

	private getTradeArchiveHistory(pageNumber: number, length: any) {
		this.isRequestProcessing = true;
		let archivePageNum = pageNumber - this.tradePages;
		let data;
		if (this.offsetIndex == 0 && this.archieveRecords.hasOwnProperty(archivePageNum.toString())) {
			data = this.archieveRecords[archivePageNum];
		} else if (this.offsetIndex > 0
			&& this.archieveRecords.hasOwnProperty(archivePageNum.toString())
			&& this.archieveRecords.hasOwnProperty((archivePageNum + 1).toString())) {
			let next = archivePageNum + 1;
			data = [...this.archieveRecords[archivePageNum].slice(this.maxDataPerPage - this.offsetIndex, this.maxDataPerPage), ...this.archieveRecords[next].slice(0, this.maxDataPerPage - this.offsetIndex)];
		} else {
			if (this.offsetIndex == 0) {
				this.tradeService.getArchiveHistory(archivePageNum, length).subscribe(
					(archiveHistory: any) => {
						this.updateArchiveRecord(archiveHistory.data, archivePageNum);
						this.updateHistoryRecord(archiveHistory.data, pageNumber);
						if (pageNumber == this.currentPageNumber) this.updateView(pageNumber);
						this.isDataOutdated = false;
					}
				);
			} else {
				this.getMultiArchieveData(pageNumber, archivePageNum, this.offsetIndex);
			}
			return;
		}
		this.updateHistoryRecord(data, pageNumber);
		this.updateView(pageNumber);
		this.isDataOutdated = false;
	}
	close() {
		this.disableClose = true;
		this.closeHistoryView.emit();
	}

	private getHistoryFox(pageNumber: any) {
		let trade = this.tradeService.getTradeHistoryFox(pageNumber, this.maxDataPerPage);
		let archiveTrade = this.tradeService.getArchiveHistoryFox(pageNumber, this.maxDataPerPage);
		observableForkJoin([trade, archiveTrade]).subscribe((results: any) => {
			let tradeData = results[0];
			let archive = results[1];
			if (tradeData.success == false && tradeData['message'] == 'Invalid User') {
				this.showReloginMessage();
			}
			if (typeof (tradeData.data) === 'undefined') {
				tradeData.data = [];
				tradeData.total = 0;
				tradeData.last_page = 0;
			}
			if (typeof (archive.data) === 'undefined') {
				archive.data = [];
				archive.total = 0;
				archive.last_page = 0;
			}
			if (this.tradeRecordsCount != tradeData.total || this.archiveRecordsCount != archive.total) {
				this.isDataOutdated = true;
				this.isRequestProcessing = true;
			}
			if (this.isRequestProcessing || this.isDataOutdated) {
				if (this.archiveRecordsCount != archive.total) this.archieveRecords = {};
				this.tradeRecordsCount = tradeData.total;
				this.archiveRecordsCount = archive.total;
				this.tradePages = tradeData.last_page;
				this.archivePages = archive.last_page;
				this.offsetIndex = this.tradeRecordsCount % this.maxDataPerPage;
				this.totalRecordsCount = this.tradeRecordsCount + this.archiveRecordsCount;
				this.isHistoryEmpty = (this.totalRecordsCount === 0);
				this.totalPages = Math.ceil(this.totalRecordsCount / this.maxDataPerPage);

				let data = tradeData.data.length < this.maxDataPerPage ? [...tradeData.data, ...archive.data.slice(0, this.maxDataPerPage - this.offsetIndex)] : tradeData.data;
				if (archive.data.length > 0) this.updateArchiveRecord(archive.data, pageNumber);
				this.setPageList();
				if (pageNumber == this.currentPageNumber) {
					if (this.isDataOutdated) {
						this.isRequestProcessing = true;
						this.historyRecords = {};
						this.isDataOutdated = false;
					}
					this.updateHistoryRecord(data, pageNumber);
					this.updateView(pageNumber);
				}
				this.isDataInitialized = true;
			}
		});
	}

	private showReloginMessage() {
		let msg = (new TranslatePipe(this.translateService)).transform("Trade_History_Relogin_Message");
		swal({
			html: `<i style="color:#ffffff;">${msg}</i>`,
			timer: 3000,
			width: 300,
			padding: 20,
			allowOutsideClick: false,
			allowEscapeKey: false,
			background: '#030608 url(/assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
			showConfirmButton: false,
			target: '#body_full_screen'
		});
	}

}
