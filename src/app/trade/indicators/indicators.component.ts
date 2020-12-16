import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorService } from './indicator.service';
import swal from 'sweetalert2';
import { TranslateService } from '../../shared/translate/translate.service';
import { TranslatePipe } from '../../shared/translate/translate.pipe';
import { IndicatorsStorageService } from '../../shared/indicators/indicators-storage.service';


@Component({
  moduleId: module.id,
  selector: 'indicators',
  templateUrl: 'indicators.component.html',
  styleUrls: ['indicators.component.scss']
})

export class IndicatorsComponent {
  @Input() chart: any;
  @Input() chartData: any;
  @Input() dropDowns: any;
  @Output() toggleIndicDpEvent: EventEmitter<any> = new EventEmitter<any>();

  selIndicatorSetting: any;
  oldSelIndicatorSetting: any;
  isIndicSettingsOpen: boolean = false;
  closeSetting: boolean = false;
  indicatorStatus: any = {
    'BB': false,
    'MACD': false,
    'Stochastic': false,
    'SMA': false,
    'RSI': false,
    'EMA': false
  };
  indicatorSettings: any = {
    BB: {
      title: 'BB',
      name: 'bb',
      options: [
        {
          label: 'Period',
          max: 50,
          min: 2,
          model: 20,
          name: 'period',
          value: 20,
        },
        {
          label: 'STANDARD DEVIATION',
          max: 10,
          min: 0,
          model: 2,
          name: 'standardDeviation',
          value: 2,
        }]
    },
    MACD: {
      title: 'MACD',
      name: 'macd',
      options: [{
        label: 'FAST PERIOD',
        max: 100,
        min: 1,
        model: 12,
        name: 'fastPeriod',
        value: 12
      }, {
        label: 'SLOW PERIOD',
        max: 100,
        min: 1,
        model: 26,
        name: 'slowPeriod',
        value: 26
      }, {
        label: 'SIGNAL PERIOD',
        max: 100,
        min: 1,
        model: 9,
        name: 'signalPeriod',
        value: 9
      }]
    },
    STOCHASTIC: {
      title: 'STOCHASTIC',
      name: 'stochastic',
      options: [{
        label: 'K PERIOD',
        max: 50,
        min: 0,
        model: 14,
        name: 'kPeriod',
        value: 14
      }, {
        label: 'D PERIOD',
        max: 50,
        min: 1,
        model: 3,
        name: 'dPeriod',
        value: 3
      }]
    },
    SMA: {
      title: 'SMA',
      name: 'sma',
      options: [{
        label: 'PERIOD',
        max: 100,
        min: 1,
        model: 14,
        name: 'period',
        value: 14
      }]
    },
    RSI: {
      title: 'RSI',
      name: 'rsi',
      options: [{
        label: 'PERIOD',
        max: 100,
        min: 1,
        model: 14,
        name: 'period',
        value: 14
      }]
    },
    EMA: {
      title: 'EMA',
      name: 'ema',
      options: [{
        label: 'PERIOD',
        max: 100,
        min: 1,
        model: 14,
        name: 'period',
        value: 14
      }]
    }
  };
  private indicatorWithY: number = 0;
  private settingModalRef: any;
  private indicatorList: any = {
    selected: [],
    settings: {}
  };

  private selNumIndicators: number = this.indicatorList.selected.length; //Only Three indicators can be selected at a time

  constructor(private modalService: NgbModal,
    public translateService: TranslateService,
    private indicatorsStorage: IndicatorsStorageService,
    private indicatorService: IndicatorService) { }
  ngAfterViewInit() {

  }
  toggleDpDown(data: any) {
    this.toggleIndicDpEvent.emit(data);
  }
  closeIndicDpDown(indDropDn: any) {
    if (!this.isIndicSettingsOpen) indDropDn.close();
    if (this.closeSetting) {
      this.isIndicSettingsOpen = false;
      this.closeSetting = false;
    }
  }
  closeSettings() {
    this.closeSetting = true;
    this.indicatorSettings[this.selIndicatorSetting.title] = this.oldSelIndicatorSetting;
  }
  checkIndicators() {
    this.indicatorList = JSON.parse(sessionStorage.getItem('indicatorList')) || { selected: [], settings: {} };
    for (let indicator in this.indicatorList.settings) {
      this.indicatorSettings[indicator].options = this.indicatorList.settings[indicator];
    }
    for (let indicator in this.indicatorList.selected) {
      this.isShowIndicator(this.indicatorList.selected[indicator]);
    }
  }
  isShowIndicator(indicatorName: string) {
    if (this.selNumIndicators > 2 && !this.indicatorStatus[indicatorName]) {
      swal({
        html: `<i style="color:#ffffff;">${(new TranslatePipe(this.translateService))
          .transform("Max_Indicators")}</i>`,
        timer: 1400,
        width: 390,
        padding: 20,
        background: '#030608 url(./assets/images/trade-dropdown-bg.jpg) 100% 100% no-repeat',
        showConfirmButton: false,
        target: '#body_full_screen'
      })
      return;
    }
    this.indicatorStatus[indicatorName] = this.indicatorStatus[indicatorName] ? false : true;

    if (this.indicatorStatus[indicatorName] && this.selNumIndicators < 3) {
      this.selNumIndicators += 1;
      this.addIndicator(indicatorName);
    } else {
      switch (indicatorName.toLowerCase()) {
        case 'sma': {
          if (this.chart.chartStock.series[1].visible) {
            this.chart.chartStock.series[1].hide();
            this.chart.chartStock.series[1].setData([], false, false, false);
            this.indicatorsStorage.sma.data = { values: [], xData: [], yData: [] };
            this.selNumIndicators -= 1;
          }
          break;
        }
        case 'ema': {
          if (this.chart.chartStock.series[2].visible) {
            this.chart.chartStock.series[2].hide();
            this.chart.chartStock.series[2].setData([], false, false, false);
            this.indicatorsStorage.ema.data = { values: [], xData: [], yData: [] };
            this.selNumIndicators -= 1;
          }
          break;
        }
        case 'rsi': {
          if (this.chart.chartStock.series[3].visible) {
            this.chart.chartStock.series[3].hide();
            this.chart.chartStock.series[3].setData([], false, false, false);
            this.indicatorsStorage.rsi.data = { values: [], xData: [], yData: [] };
            if (!this.indicatorStatus.Stochastic) {
              this.chart.chartStock.yAxis[1].removePlotLine('ovrBought');
              this.chart.chartStock.yAxis[1].removePlotLine('ovrSold');
              this.chart.chartStock.yAxis[1].update({
                height: '0%',
              });
              if (this.indicatorStatus.MACD) {
                this.chart.chartStock.yAxis[0].update({
                  height: '70%'
                });
              } else {
                this.chart.chartStock.yAxis[0].update({
                  height: '100%'
                });
              }
            }
            this.selNumIndicators -= 1;
          }
          break;
        }
        case 'macd': {
          if (this.chart.chartStock.series[4].visible) {
            this.chart.chartStock.series[4].hide();
            this.chart.chartStock.series[5].hide();
            this.chart.chartStock.series[4].setData([], false, false, false);
            this.chart.chartStock.series[5].setData([], false, false, false);
            this.indicatorsStorage.macd.data = { values: [], xData: [], yData: [], macd: [], macdSignal: [] };
            this.indicatorsStorage.macd.sma.data = { values: [], xData: [], yData: [] };
            this.indicatorsStorage.macdSlowEma.ema.data = { values: [], xData: [], yData: [] };
            this.indicatorsStorage.macdFastEma.ema.data = { values: [], xData: [], yData: [] };
            this.chart.chartStock.yAxis[2].update({
              height: '0%',
            });
            if (this.indicatorStatus.Stochastic || this.indicatorStatus.RSI) {
              this.chart.chartStock.yAxis[0].update({
                height: '70%'
              });
              this.chart.chartStock.yAxis[1].update({
                height: '25%',
                top: '75%'
              });
            } else {
              this.chart.chartStock.yAxis[0].update({
                height: '100%'
              });
            }
            this.selNumIndicators -= 1;
          }
          break;
        }
        case 'bb': {
          if (this.chart.chartStock.series[6].visible) {
            this.chart.chartStock.series[6].hide();
            this.chart.chartStock.series[7].hide();
            this.chart.chartStock.series[8].hide();
            this.chart.chartStock.series[6].setData([], false, false, false);
            this.chart.chartStock.series[7].setData([], false, false, false);
            this.chart.chartStock.series[8].setData([], false, false, false);
            this.indicatorsStorage.bb.data = { values: [], xData: [], yData: [], TL: [], ML: [], BL: [] };
            this.indicatorsStorage.bb.sma.data = { values: [], xData: [], yData: [] };
            this.selNumIndicators -= 1;
          }
          break;
        }
        case 'stochastic': {
          if (this.chart.chartStock.series[9].visible) {
            this.chart.chartStock.series[9].hide();
            this.chart.chartStock.series[10].hide();
            this.chart.chartStock.series[9].setData([], false, false, false);
            this.chart.chartStock.series[10].setData([], false, false, false);
            this.indicatorsStorage.stochastic.data = { values: [], xData: [], yData: [], kData: [], dData: [] };
            this.indicatorsStorage.stochastic.sma.data = { values: [], xData: [], yData: [] };
            if (!this.indicatorStatus.RSI) {
              this.chart.chartStock.yAxis[1].removePlotLine('ovrBought');
              this.chart.chartStock.yAxis[1].removePlotLine('ovrSold');
              this.chart.chartStock.yAxis[1].update({
                height: '0%',
              });
              if (this.indicatorStatus.MACD) {
                this.chart.chartStock.yAxis[0].update({
                  height: '70%'
                });
              } else {
                this.chart.chartStock.yAxis[0].update({
                  height: '100%'
                });
              }
            }
            this.selNumIndicators -= 1;
          }
        }
      }
      if (this.indicatorList.selected.indexOf(indicatorName) > -1) {
        this.indicatorList.selected.splice(this.indicatorList.selected.indexOf(indicatorName), 1);
      }
    }
    sessionStorage.setItem('indicatorList', JSON.stringify(this.indicatorList));
  }
  showIndicatorSetting(settingIndicator: any, indicatorName: string) {
    this.isIndicSettingsOpen = true;
    this.selIndicatorSetting = this.indicatorSettings[indicatorName];
    this.oldSelIndicatorSetting = this.clone(this.selIndicatorSetting);
    if (indicatorName.toLowerCase() === 'macd') {
      this.selIndicatorSetting.dispError = false;
      this.selIndicatorSetting.dispErrorMsg = 'MACD_Fast_Period_Greater_Than_Slow_Period';
    }
    this.settingModalRef = this.modalService.open(settingIndicator, { backdrop: 'static', windowClass: 'oneClick indiSetting fadeInDown animated md', keyboard: false, container: '#body_full_screen' });
  }
  saveSettings(indicator: any) {
    if (indicator.name === 'macd') {
      let params: any = {};
      indicator.options.forEach((option: any) => {
        params[option.name] = parseInt(option.value);
      });
      if (params.fastPeriod >= params.slowPeriod) {
        indicator.dispError = true;
        return;
      } else {
        indicator.dispError = false;
      }
    }
    indicator.options.forEach((option: any) => {
      option.model = parseInt(option.value);
    });
    this.updateIndicator(indicator.name);
    this.settingModalRef.close();
    this.indicatorList.settings[indicator.name.toUpperCase()] = this.indicatorSettings[indicator.name.toUpperCase()].options;
    sessionStorage.setItem('indicatorList', JSON.stringify(this.indicatorList));
    this.toggleDpDown(true);
    this.isIndicSettingsOpen = false;
  }
  private addIndicator(name: string) {
    switch (name) {
      case 'SMA': {
        this.updateIndicator('sma');
        this.chart.chartStock.series[1].show();
        if (this.indicatorList.selected.indexOf('SMA') < 0)
          this.indicatorList.selected.push('SMA');
        break;
      }
      case 'EMA': {
        this.updateIndicator('ema');
        this.chart.chartStock.series[2].show();
        if (this.indicatorList.selected.indexOf('EMA') < 0)
          this.indicatorList.selected.push('EMA');
        break;
      }
      case 'RSI': {
        this.updateIndicator('rsi');
        this.chart.chartStock.series[3].show();
        if (!this.indicatorStatus.Stochastic) {
          this.chart.chartStock.yAxis[1].addPlotLine({
            color: 'white',
            width: 1,
            value: 70,
            dashStyle: 'longdashdot',
            id: 'ovrBought'
          });
          this.chart.chartStock.yAxis[1].addPlotLine({
            color: 'white',
            width: 1,
            value: 30,
            dashStyle: 'longdashdot',
            id: 'ovrSold'
          });
        }
        if (this.indicatorStatus.MACD) {
          this.chart.chartStock.yAxis[1].update({
            height: '25%',
            top: '45%'
          });
          this.chart.chartStock.yAxis[0].update({
            height: '40%'
          });
        } else {
          this.chart.chartStock.yAxis[1].update({
            height: '25%',
            top: '75%'
          });
          this.chart.chartStock.yAxis[0].update({
            height: '70%'
          });
        }
        if (this.indicatorList.selected.indexOf('RSI') < 0)
          this.indicatorList.selected.push('RSI');
        break;
      }
      case 'MACD': {
        this.updateIndicator('macd');
        this.chart.chartStock.series[4].show();
        this.chart.chartStock.series[5].show();
        this.chart.chartStock.yAxis[2].update({
          top: '75%',
          height: '25%',
        });
        if (this.indicatorStatus.Stochastic || this.indicatorStatus.RSI) {
          this.chart.chartStock.yAxis[0].update({
            height: '40%'
          });
          this.chart.chartStock.yAxis[1].update({
            height: '25%',
            top: '45%'
          });
        } else {
          this.chart.chartStock.yAxis[0].update({
            height: '70%'
          });
        }
        if (this.indicatorList.selected.indexOf('MACD') < 0)
          this.indicatorList.selected.push('MACD');
        break;
      }
      case 'BB': {
        this.updateIndicator('bb');
        this.chart.chartStock.series[6].show();
        this.chart.chartStock.series[7].show();
        this.chart.chartStock.series[8].show();
        if (this.indicatorList.selected.indexOf('BB') < 0)
          this.indicatorList.selected.push('BB');
        break;
      }
      case 'Stochastic': {
        this.updateIndicator('stochastic');
        this.chart.chartStock.series[9].show();
        this.chart.chartStock.series[10].show();
        if (!this.indicatorStatus.RSI) {
          this.chart.chartStock.yAxis[1].addPlotLine({
            color: 'white',
            width: 1,
            value: 70,
            dashStyle: 'longdashdot',
            id: 'ovrBought'
          });
          this.chart.chartStock.yAxis[1].addPlotLine({
            color: 'white',
            width: 1,
            value: 30,
            dashStyle: 'longdashdot',
            id: 'ovrSold'
          });
        }
        if (this.indicatorStatus.MACD) {
          this.chart.chartStock.yAxis[1].update({
            height: '25%',
            top: '45%'
          });
          this.chart.chartStock.yAxis[0].update({
            height: '40%'
          });
        } else {
          this.chart.chartStock.yAxis[1].update({
            height: '25%',
            top: '75%'
          });
          this.chart.chartStock.yAxis[0].update({
            height: '70%'
          });
        }
        if (this.indicatorList.selected.indexOf('Stochastic') < 0)
          this.indicatorList.selected.push('Stochastic');
        break;
      }
      default: {
      }
    }
  }
  private updateIndicator(techIndicator: any) {
    switch (techIndicator) {
      case 'sma': {
        this.indicatorsStorage.sma.data = { values: [], xData: [], yData: [] };
        this.indicatorService.sma.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[1].setData(this.indicatorsStorage.sma.data.values, true, true, true);
        break;
      }
      case 'ema': {
        this.indicatorsStorage.ema.data = { values: [], xData: [], yData: [] };
        this.indicatorService.ema.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[2].setData(this.indicatorsStorage.ema.data.values, true, true, true);
        break;
      }
      case 'rsi': {
        this.indicatorsStorage.rsi.data = { values: [], xData: [], yData: [] };
        this.indicatorService.rsi.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[3].setData(this.indicatorsStorage.rsi.data.values, true, true, true);
        break;
      }
      case 'macd': {
        this.indicatorsStorage.macd.data = { values: [], xData: [], yData: [], macd: [], macdSignal: [] };
        this.indicatorsStorage.macd.sma.data = { values: [], xData: [], yData: [] };
        this.indicatorsStorage.macdSlowEma.ema.data = { values: [], xData: [], yData: [] };
        this.indicatorsStorage.macdFastEma.ema.data = { values: [], xData: [], yData: [] };
        this.indicatorService.macd.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[4].setData(this.indicatorsStorage.macd.data.macd, true, true, true);
        this.chart.chartStock.series[5].setData(this.indicatorsStorage.macd.data.macdSignal, true, true, true);
        break;
      }
      case 'bb': {
        this.indicatorsStorage.bb.data = { values: [], xData: [], yData: [], TL: [], ML: [], BL: [] };
        this.indicatorsStorage.bb.sma.data = { values: [], xData: [], yData: [] };
        this.indicatorService.bb.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[6].setData(this.indicatorsStorage.bb.data.TL, true, true, true);
        this.chart.chartStock.series[7].setData(this.indicatorsStorage.bb.data.ML, true, true, true);
        this.chart.chartStock.series[8].setData(this.indicatorsStorage.bb.data.BL, true, true, true);
        break;
      }
      case 'stochastic': {
        this.indicatorsStorage.stochastic.data = { values: [], xData: [], yData: [], kData: [], dData: [] };
        this.indicatorsStorage.stochastic.sma.data = { values: [], xData: [], yData: [] };
        this.indicatorService.stochastic.getValues(this.chart.chartStock, { points: [] }, this.getIndicOptions(techIndicator),
          [this.chart.chartStock.series[0].xData, this.chart.chartStock.series[0].yData]);
        this.chart.chartStock.series[9].setData(this.indicatorsStorage.stochastic.data.kData, true, true, true);
        this.chart.chartStock.series[10].setData(this.indicatorsStorage.stochastic.data.dData, true, true, true);
      }
    }
  }
  private getIndicOptions(indicatorName: any) {
    var option;
    switch (indicatorName) {
      case 'bb': {
        option = {
          period: this.indicatorSettings.BB.options[0].model,
          standardDeviation: this.indicatorSettings.BB.options[1].model,
          index: 3
        };
        break;
      }
      case 'sma': {
        option = {
          period: this.indicatorSettings.SMA.options[0].model,
          index: 3
        };
        break;
      }
      case 'ema': {
        option = {
          period: this.indicatorSettings.EMA.options[0].model,
          index: 3
        };
        break;
      }
      case 'macd': {
        option = {
          fastPeriod: this.indicatorSettings.MACD.options[0].model,
          slowPeriod: this.indicatorSettings.MACD.options[1].model,
          signalPeriod: this.indicatorSettings.MACD.options[2].model,
          index: 3,
          valueDecimals: 5
        };
        break;
      }
      case 'rsi': {
        option = {
          decimals: 9,
          overbought: 70,
          oversold: 30,
          period: this.indicatorSettings.RSI.options[0].model,
        };
        break;
      }
      case 'stochastic': {
        option = {
          oversold: 30,
          overbought: 70,
          period: [this.indicatorSettings.STOCHASTIC.options[0].model, this.indicatorSettings.STOCHASTIC.options[1].model]
        };
        break;
      }
      default: {
      }
    }
    return option;
  }
  private clone(obj: any) {
    let copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
}
