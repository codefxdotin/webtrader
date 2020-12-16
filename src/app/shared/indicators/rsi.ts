import {EMA} from '../indicators/ema';
import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class RSI {
  /**

   Each indicator requires mothods:

   - getDefaultOptions()                       - returns object with default parameters, like period etc.
   - getValues(chart, series, options, points) - returns array of calculated values for indicator
   - getGraph(chart, series, options, values)  - returns path, or columns as SVG elements to add.
   Doesn't add to the chart via renderer!

   **/

  constructor(private indicatorStorage: IndicatorsStorageService) {
  }

  toFixed = function (a: any, n: any) {
    return parseFloat(a.toFixed(n));
  };

  //var UNDEFINED,
  each = Highcharts.each;
  merge = Highcharts.merge;
  isArray = Highcharts.isArray;
  addAxisPane = Highcharts.Axis.prototype.addAxisPane;


  getDefaultOptions = function () {
    return {
      period: 14,
      overbought: 70,
      oversold: 30,
      approximation: 'average',
      decimals: 4
    };
  };

  getValues(chart: any, series: any, params: any, points: any) {
    var utils = this.utils,
      //params = options.params,
      period = params.period,
      xVal = points[0].concat(series.processedXData || []), // #22
      yVal = points[1].concat(series.processedYData || []), // #22
      yValLen = yVal ? yVal.length : 0,
      decimals = params.decimals,
      // calEMALoss = 0,
      range = 1,

      xValue = xVal[0],
      yValue = yVal[0],
      slicedX,
      slicedY,
      index = 3,
      gain = [],
      loss = [],
      xLength,//pointsRSI: Array<any>,
      RSIPoint, EMAPoint, change, RS, avgGain, avgLoss, i, xIndex;

    if (this.indicatorStorage.rsi.period != period) {
      this.indicatorStorage.rsi.period = period;
      this.indicatorStorage.rsi.data = {values: [], xData: [], yData: []};
      this.indicatorStorage.rsi.avgGainLoss = [];
    }
    let RSI = this.indicatorStorage.rsi.data.values,
      xData = this.indicatorStorage.rsi.data.xData,
      yData = this.indicatorStorage.rsi.data.yData;

    // atr requires close value || ema === undefined
    if ((xVal.length <= period) || !this.isArray(yVal[0]) || yVal[0].length !== 4) {
      return {
        values: null,
        xData: null,
        yData: null
      };
    }

    // accumulate first N-points
    if (RSI.length <= 0) {
      while (range < period + 1) {
        change = this.toFixed(yVal[range][index] - yVal[range - 1][index], decimals);
        gain.push(change > 0 ? change : 0);
        loss.push(change < 0 ? Math.abs(change) : 0);
        range++;
      }
      avgGain = this.toFixed(this.utils.sumArray(gain) / period, decimals);
      avgLoss = this.toFixed(this.utils.sumArray(loss) / period, decimals);
      this.calculateRSI(RSI, RS, avgGain, avgLoss, range,
        change, index, decimals, period, yVal, RSIPoint, xData, yData, xVal, false);
    } else {
      //accumulate the average for pending points
      if (RSI[0][0] == xVal[period + 1]) {
        //get previous stored avg gain and loss
        if (RSI[RSI.length - 1][0] == xVal[xVal.length - 1]) { // for calculating last point
          avgGain = this.indicatorStorage.rsi.avgGainLoss[0].gain;
          avgLoss = this.indicatorStorage.rsi.avgGainLoss[0].loss;
          range = xVal.indexOf(RSI[RSI.length - 1][0]);
        } else { // for calculating new point
          avgGain = this.indicatorStorage.rsi.avgGainLoss[1].gain;
          avgLoss = this.indicatorStorage.rsi.avgGainLoss[1].loss;
          range = xVal.indexOf(RSI[RSI.length - 1][0]) + 1;
        }
        this.calculateRSI(RSI, RS, avgGain, avgLoss, range,
          change, index, decimals, period, yVal, RSIPoint, xData, yData, xVal, true);
      } else if (RSI[0][0] > xVal[period]) { // when past candles r added
        // accumulate first N-points
        let xNew = xVal.slice(0, xVal.indexOf(RSI[0][0]));
        let yNew = yVal.slice(0, xVal.indexOf(RSI[0][0]));
        while (range !== period + 1) {
          change = this.toFixed(yNew[range][index] - yNew[range - 1][index], decimals);
          gain.push(change > 0 ? change : 0);
          loss.push(change < 0 ? Math.abs(change) : 0);
          range++;
        }
        avgGain = this.toFixed(this.utils.sumArray(gain) / period, decimals);
        avgLoss = this.toFixed(this.utils.sumArray(loss) / period, decimals);
        let rsiNew: any = [], xDataNew: any = [], yDataNew: any = [];
        this.calculateRSI(rsiNew, RS, avgGain, avgLoss, range,
          change, index, decimals, period, yNew, RSIPoint, xDataNew, yDataNew, xNew, false);
        RSI = rsiNew.concat(RSI);
        xData = xDataNew.concat(xData);
        yData = yDataNew.concat(yData);
      }
    }

    /*options.yAxisMax = 100;
        options.yAxisMin = 0;
        options.names = options.names || ['RSI'];*/

    this.indicatorStorage.rsi.data = {values: RSI, xData: xData, yData: yData};

    return {
      values: RSI,
      xData: xData,
      yData: yData
    };

  };

  private calculateRSI(RSI: any, RS: any, avgGain: any, avgLoss: any, range: any,
                       change: any, index: any, decimals: any, period: any, yVal: any,
                       RSIPoint: any, xData: any, yData: any, xVal: any, checkChange: boolean) {
    let i;

    for (i = range; i < yVal.length; i++) {
      if (i == yVal.length - 1)
        this.indicatorStorage.rsi.avgGainLoss[0] = {gain: avgGain, loss: avgLoss, date: xVal[i - 1]};
      if (i > range || checkChange) {
        // calculate new change
        change = this.toFixed(yVal[i][index] - yVal[i - 1][index], decimals);
        // add to array
        avgGain = ((avgGain * (period - 1)) + (change > 0 ? change : 0)) / period;
        avgLoss = ((avgLoss * (period - 1)) + (change < 0 ? Math.abs(change) : 0)) / period;
      }
      if (i == yVal.length - 1)
        this.indicatorStorage.rsi.avgGainLoss[1] = {gain: avgGain, loss: avgLoss, date: xVal[i]};
      //save avggain and avgloss upto last 2 points for current point calculation

      // calculate averages, RS, RSI values:

      if (avgLoss === 0) {
        if (avgGain === 0) {
          RSIPoint = 50;
        } else {
          RSIPoint = 100;
        }
      } else {
        RS = this.toFixed(avgGain / avgLoss, decimals);
        RSIPoint = this.toFixed(100 - (100 / (1 + RS)), decimals);
      }
      if (RSI.length > 0 && RSI[RSI.length - 1][0] == xVal[xVal.length - 1]) { // update old point
        RSI[RSI.length - 1] = [xVal[i], RSIPoint];
        xData[xData.length - 1] = xVal[i];
        yData[yData.length - 1] = RSIPoint;
      } else { // add new point
        RSI.push([xVal[i], RSIPoint]);
        xData.push(xVal[i]);
        yData.push(RSIPoint);
      }
    }
  }

  getGraph = function (chart: any, series: any, options: any, values: any) {
    let path = [],
      attrs = {},
      xAxis = series.xAxis,
      atr = values,
      atrLen = atr.length,
      defaultOptions,
      userOptions: any,
      yAxis,
      index,
      atrX,
      atrY,
      i;

    defaultOptions = {
      min: 0,
      tickInterval: 25,
      plotLines: [{
        value: options.params.overbought,
        color: 'orange',
        width: 1
      }, {
        value: options.params.oversold,
        color: 'orange',
        width: 1
      }],
      // height: 100,
      max: 100,
      title: {
        text: 'RSI'
      }
    };

    if (options.visible === false) {
      return false;
    }

    userOptions = Highcharts.merge(defaultOptions, options.yAxis);

    if (options.Axis === undefined) {
      index = this.addAxisPane(chart, userOptions);
      options.Axis = chart.yAxis[index];
    } else {
      this.each(options.Axis.plotLinesAndBands, function (p: any, j: any) {
        p.options = Highcharts.merge(p.options, userOptions.plotLines[j]);
        p.render();
      });
    }

    yAxis = options.Axis;

    options.styles = attrs = Highcharts.merge({
      'stroke-width': 2,
      stroke: 'red',
      dashstyle: 'Dash'
    }, options.styles);

    path.push('M', xAxis.toPixels(atr[0][0]), yAxis.toPixels(atr[0][1]));
    for (i = 0; i < atrLen; i++) {
      atrX = atr[i][0];
      atrY = atr[i][1];
      path.push('L', xAxis.toPixels(atrX), yAxis.toPixels(atrY));
    }

    return [chart.renderer.path(path).attr(attrs)];
  };
  utils = {
    sumArray: function (array: any) {
      // reduce VS loop => reduce
      return array.reduce(function (prev: any, cur: any) {
        return prev + cur;
      });
    }
  };

}
