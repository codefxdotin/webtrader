import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {SMA} from '../../shared/indicators/sma';
import {EMA} from '../../shared/indicators/ema';
import {RSI} from '../../shared/indicators/rsi';
import {MACD} from '../../shared/indicators/macd';
import {IndicatorsStorageService} from '../../shared/indicators/indicators-storage.service';
import {BB} from '../../shared/indicators/bb';
import {Stochastic} from '../../shared/indicators/stochastic';

@Injectable()
export class IndicatorService {
    sma: SMA;
    ema: EMA;
    rsi: RSI;
    macd: MACD;
    bb: BB;
    stochastic: Stochastic;


    constructor(private indicatorStorage: IndicatorsStorageService) {
        this.sma = new SMA(this.indicatorStorage);
        this.ema = new EMA(this.indicatorStorage);
        this.rsi = new RSI(this.indicatorStorage);
        this.macd = new MACD(this.indicatorStorage);
        this.bb = new BB(this.indicatorStorage);
        this.stochastic = new Stochastic(this.indicatorStorage);
    }
    updateNewPoint(chart: any, data: any, indicatorsComponent: any, updateType: string) {
        if (indicatorsComponent.indicatorStatus.SMA) {
            this.sma.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('sma'), data);
            if (updateType.indexOf('update') > -1)
                chart.series[1].data[chart.series[1].data.length - 1].update(
                    this.indicatorStorage.sma.data.values[this.indicatorStorage.sma.data.values.length - 1], false);
            else {
                if (chart.series[1].xData.indexOf(this.indicatorStorage.sma.data.values[
                    this.indicatorStorage.sma.data.values.length - 1][0]) <= -1)
                    chart.series[1].addPoint(this.indicatorStorage.sma.data.values[
                        this.indicatorStorage.sma.data.values.length - 1], false, false, );
            }
        }
        if (indicatorsComponent.indicatorStatus.EMA) {
            this.ema.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('ema'), data);
            if (updateType.indexOf('update') > -1)
                chart.series[2].data[chart.series[2].data.length - 1].update(
                    this.indicatorStorage.ema.data.values[this.indicatorStorage.ema.data.values.length - 1], false);
            else {
                if (chart.series[2].xData.indexOf(this.indicatorStorage.ema.data.values[
                    this.indicatorStorage.ema.data.values.length - 1][0]) <= -1)
                    chart.series[2].addPoint(this.indicatorStorage.ema.data.values[
                        this.indicatorStorage.ema.data.values.length - 1], false, false, false);
            }
        }
        if (indicatorsComponent.indicatorStatus.RSI) {
            this.rsi.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('rsi'), data);
            if (updateType.indexOf('update') > -1)
                chart.series[3].data[chart.series[3].data.length - 1].update(
                    this.indicatorStorage.rsi.data.values[this.indicatorStorage.rsi.data.values.length - 1], false);
            else {
                if (chart.series[3].xData.indexOf(this.indicatorStorage.rsi.data.values[
                    this.indicatorStorage.rsi.data.values.length - 1][0]) <= -1)
                    chart.series[3].addPoint(this.indicatorStorage.rsi.data.values[
                        this.indicatorStorage.rsi.data.values.length - 1], false, false, false);
            }
        }
        if (indicatorsComponent.indicatorStatus.MACD) {
            this.macd.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('macd'), data);
            if (updateType.indexOf('update') > -1) {
                chart.series[4].data[chart.series[4].data.length - 1].update(
                    this.indicatorStorage.macd.data.macd[this.indicatorStorage.macd.data.macd.length - 1], false);
                chart.series[5].data[chart.series[5].data.length - 1].update(
                    this.indicatorStorage.macd.data.macdSignal[this.indicatorStorage.macd.data.macdSignal.length - 1], false);
            } else {
                if (chart.series[4].xData.indexOf(this.indicatorStorage.macd.data.macd[
                    this.indicatorStorage.macd.data.macd.length - 1][0]) <= -1) {
                    chart.series[4].addPoint(this.indicatorStorage.macd.data.macd[
                        this.indicatorStorage.macd.data.macd.length - 1], false, false, false);
                    chart.series[5].addPoint(this.indicatorStorage.macd.data.macdSignal[
                        this.indicatorStorage.macd.data.macdSignal.length - 1], false, false, false);
                }
            }
        }
        if (indicatorsComponent.indicatorStatus.BB) {
            this.bb.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('bb'), data);
            if (updateType.indexOf('update') > -1) {
                chart.series[6].data[chart.series[6].data.length - 1].update(
                    this.indicatorStorage.bb.data.TL[this.indicatorStorage.bb.data.TL.length - 1], false);
                chart.series[7].data[chart.series[7].data.length - 1].update(
                    this.indicatorStorage.bb.data.ML[this.indicatorStorage.bb.data.ML.length - 1], false);
                chart.series[8].data[chart.series[8].data.length - 1].update(
                    this.indicatorStorage.bb.data.BL[this.indicatorStorage.bb.data.BL.length - 1], false);
            } else {
                if (chart.series[6].xData.indexOf(this.indicatorStorage.bb.data.TL[
                    this.indicatorStorage.bb.data.TL.length - 1][0]) <= -1) {
                    chart.series[6].addPoint(this.indicatorStorage.bb.data.TL[
                        this.indicatorStorage.bb.data.TL.length - 1], false, false, false);
                    chart.series[7].addPoint(this.indicatorStorage.bb.data.ML[
                        this.indicatorStorage.bb.data.ML.length - 1], false, false, false);
                    chart.series[8].addPoint(this.indicatorStorage.bb.data.BL[
                        this.indicatorStorage.bb.data.BL.length - 1], false, false, false);
                }
            }
        }
        if (indicatorsComponent.indicatorStatus.Stochastic) {
            this.stochastic.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('stochastic'), data);
            if (updateType.indexOf('update') > -1) {
                chart.series[9].data[chart.series[9].data.length - 1].update(
                    this.indicatorStorage.stochastic.data.kData[this.indicatorStorage.stochastic.data.kData.length - 1], false);
                chart.series[10].data[chart.series[10].data.length - 1].update(
                    this.indicatorStorage.stochastic.data.dData[this.indicatorStorage.stochastic.data.dData.length - 1], false);
            } else {
                if (chart.series[9].xData.indexOf(this.indicatorStorage.stochastic.data.dData[
                    this.indicatorStorage.stochastic.data.dData.length - 1][0]) <= -1) {
                    chart.series[9].addPoint(this.indicatorStorage.stochastic.data.kData[
                        this.indicatorStorage.stochastic.data.kData.length - 1], false, false, false);
                    chart.series[10].addPoint(this.indicatorStorage.stochastic.data.dData[
                        this.indicatorStorage.stochastic.data.dData.length - 1], false, false, false);
                }
            }
        }
        chart.redraw();
    }
    updatePreviousPoints(chart: any, data: any, indicatorsComponent: any) {
        if (indicatorsComponent.indicatorStatus.SMA) {
            this.sma.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('sma'), data);
            chart.series[1].setData(this.indicatorStorage.sma.data.values, false, false, false);
        }
        if (indicatorsComponent.indicatorStatus.EMA) {
            this.ema.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('ema'), data);
            chart.series[2].setData(this.indicatorStorage.ema.data.values, false, false, false);
        }
        if (indicatorsComponent.indicatorStatus.RSI) {
            this.rsi.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('rsi'), data);
            chart.series[3].setData(this.indicatorStorage.rsi.data.values, false, false, false);
        }
        if (indicatorsComponent.indicatorStatus.MACD) {
            this.macd.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('macd'), data);
            chart.series[4].setData(this.indicatorStorage.macd.data.macd, false, false, false);
            chart.series[5].setData(this.indicatorStorage.macd.data.macdSignal, false, false, false);
        }
        if (indicatorsComponent.indicatorStatus.BB) {
            this.bb.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('bb'), data);
            chart.series[6].setData(this.indicatorStorage.bb.data.TL, false, false, false);
            chart.series[7].setData(this.indicatorStorage.bb.data.ML, false, false, false);
            chart.series[8].setData(this.indicatorStorage.bb.data.BL, false, false, false);
        }
        if (indicatorsComponent.indicatorStatus.Stochastic) {
            this.stochastic.getValues(chart, { points: [] }, indicatorsComponent.getIndicOptions('stochastic'), data);
            chart.series[9].setData(this.indicatorStorage.stochastic.data.kData, false, false, false);
            chart.series[10].setData(this.indicatorStorage.stochastic.data.dData, false, false, false);
        }
        chart.redraw();
    }
}
