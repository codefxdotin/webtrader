import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class EMA {
  /**

   Each indicator requires mothods:

   - getDefaultOptions()                  - returns object with default parameters, like period etc.
   - getValues(chart, series, options, points) - returns array of calculated values for indicator
   - getGraph(chart, series, options, values)  - returns path, or columns as SVG elements to add.
   Doesn't add to the chart via renderer!

   **/

  merge = Highcharts.merge;
  minInArray = Highcharts.Axis.prototype.minInArray;
  maxInArray = Highcharts.Axis.prototype.maxInArray;
  isArray = Highcharts.isArray;

  constructor(private indicatorStorage: IndicatorsStorageService, private flow?: string) {

  }

  getDefaultOptions = function () {
    return {
      period: 14,
      index: 0,
      approximation: 'average'
    };
  };
  getValues = function (chart: any, series: any, params: any, extraPoints: any) {
    var utils = this.utils,
      //params = options.params,
      period = params.period,
      xVal = extraPoints[0].concat(series.processedXData || []), // #22
      yVal = extraPoints[1].concat(series.processedYData || []), // #22
      yValLen = yVal ? yVal.length : 0,
      EMApercent = (2 / (period + 1)),
      calEMA = 0,
      range = 1,
      xValue = xVal[0],
      yValue = yVal[0],
      index = -1,
      xLength,
      EMAPoint;

    // check period, if bigger than points length, skip
    if (xVal.length <= period) {
      if (this.flow)
        this.indicatorStorage[this.flow].ema.data = {values: [], xData: [], yData: []};
      else
        this.indicatorStorage.ema.data = {values: [], xData: [], yData: []};
      return {
        values: null,
        xData: null,
        yData: null
      };
    }
    //clear the existing EMA stored if period changed
    if (this.flow) {
      if (period != this.indicatorStorage[this.flow].ema.period) {
        this.indicatorStorage[this.flow].ema.period = period;
        this.indicatorStorage[this.flow].ema.data = {values: [], xData: [], yData: []};
      }
    } else {
      if (period != this.indicatorStorage.ema.period) {
        this.indicatorStorage.ema.period = period;
        this.indicatorStorage.ema.data = {values: [], xData: [], yData: []};
      }
    }
    let EMA = this.flow ? this.indicatorStorage[this.flow].ema.data.values : this.indicatorStorage.ema.data.values,
      xData = this.flow ? this.indicatorStorage[this.flow].ema.data.xData : this.indicatorStorage.ema.data.xData,
      yData = this.flow ? this.indicatorStorage[this.flow].ema.data.yData : this.indicatorStorage.ema.data.yData;
    // switch index for OHLC / Candlestick / Area range
    if (this.isArray(yVal[0])) {
      index = params.index ? params.index : 0;
      yValue = yVal[0][index];
    }

    //do not calaculate from start if EMA length >0
    if (EMA.length <= 0) {
      range = period;
      this.calculateEMA(xVal, yVal, range, EMAPoint, xData,
        yData, EMA, index, period, xLength, EMApercent, calEMA);
    } else {
      //accumulate the average for pending points
      if (EMA[0][0] == xVal[period - 1]) {
        xLength = xVal.indexOf(EMA[EMA.length - 1][0]);
        range = xLength + 1;
        calEMA = EMA[EMA.length - 2][1];
        this.calculateEMA(xVal, yVal, range, EMAPoint, xData,
          yData, EMA, index, period, xLength, EMApercent, calEMA);
      } else if (EMA[0][0] > xVal[period]) { // when past candles r added
        let xNew = xVal.slice(0, xVal.indexOf(EMA[0][0]));
        let yNew = yVal.slice(0, xVal.indexOf(EMA[0][0]));
        // starting point
        // points = [[xNew[0], yNew[0][index]]];

        // accumulate first N-points

        range = period;
        let emaNew: any = [], xDataNew: any = [], yDataNew: any = [];
        this.calculateEMA(xNew, yNew, range, EMAPoint, xDataNew,
          yDataNew, emaNew, index, period, xLength, EMApercent, calEMA);
        EMA = emaNew.concat(EMA);
        xData = xDataNew.concat(xData);
        yData = yDataNew.concat(yData);
      }
    }
    if (this.flow)
      this.indicatorStorage[this.flow].ema.data = {values: EMA, xData: xData, yData: yData};
    else
      this.indicatorStorage.ema.data = {values: EMA, xData: xData, yData: yData};

    return {
      values: EMA,
      xData: xData,
      yData: yData
    };
  };

  private calculateEMA(xVal: any, yVal: any, range: any, EMAPoint: any, xData: any,
                       yData: any, EMA: any, index: any, period: any, xLength: any, EMApercent: any, calEMA: any) {
    let i;
    // calculate value one-by-one for each perdio in visible data

    for (i = range; i < yVal.length; i++) {
      EMAPoint = this.utils.populateAverage(xVal, yVal, i, EMApercent, calEMA, index);
      EMA.push(EMAPoint);
      xData.push(EMAPoint[0]);
      yData.push(EMAPoint[1]);
      calEMA = EMAPoint[1];
    }
    EMAPoint = this.utils.populateAverage(xVal, yVal, i, EMApercent, calEMA, index);


    //if updating the last point in EMA
    if (xLength && xLength == xVal.length - 1) {
      EMA[EMA.length - 1] = EMAPoint;
      xData[xData.length - 1] = EMAPoint[0];
      yData[yData.length - 1] = EMAPoint[1];

    } else {
      // if pushing new point
      EMA.push(EMAPoint);
      xData.push(EMAPoint[0]);
      yData.push(EMAPoint[1]);
    }
  };

  getGraph = function (chart: any, series: any, options: any, values: any) {
    var path = [],
      attrs = {},
      xAxis = series.xAxis,
      yAxis = options.Axis = series.yAxis,
      ema = values,
      emaLen = ema.length,
      emaX,
      emaY,
      i;

    if (options.visible === false) {
      return false;
    }

    options.styles = attrs = this.merge({
      'stroke-width': 2,
      stroke: 'red',
      dashstyle: 'Dash'
    }, options.styles);

    path.push('M', xAxis.toPixels(ema[0][0]), yAxis.toPixels(ema[0][1]));

    for (i = 0; i < emaLen; i++) {
      emaX = ema[i][0];
      emaY = ema[i][1];

      path.push('L', xAxis.toPixels(emaX), yAxis.toPixels(emaY));
    }

    return [chart.renderer.path(path).attr(attrs)];
  };
  utils = {
    populateAverage: function (xVal: any, yVal: any, i: any, EMApercent: any, calEMA: any, index: any) {
      var x = xVal[i - 1],
        yValuePrev = i - 2 >= 0 ? (index < 0 ? yVal[i - 2] : yVal[i - 2][index]) : 0,
        yValue = index < 0 ? yVal[i - 1] : yVal[i - 1][index],
        prevPoint, y;

      prevPoint = calEMA === 0 ? yValuePrev : calEMA;
      y = ((yValue * EMApercent) + (prevPoint * (1 - EMApercent)));

      return [x, y];
    }
  };


}
