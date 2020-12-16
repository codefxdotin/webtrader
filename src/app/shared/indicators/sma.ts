import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class SMA {
  /**

   Each indicator requires mothods:

   - getDefaultOptions()            - returns object with default parameters, like period etc.
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
    let utils = this.utils,
      //params = options.params,
      period = params.period,
      xVal = extraPoints[0].concat(series.processedXData || []), // #22
      yVal = extraPoints[1].concat(series.processedYData || []), // #22
      yValLen = yVal ? yVal.length : 0,
      range = 1,
      xValue = xVal[0],
      yValue = yVal[0],
      index = -1,
      points: Array<any>, xLength,
      SMAPoint;

    if (xVal.length <= period) {
      if (this.flow)
        this.indicatorStorage[this.flow].sma.data = {values: [], xData: [], yData: []};
      else
        this.indicatorStorage.sma.data = {values: [], xData: [], yData: []};
      return {
        values: null,
        xData: null,
        yData: null
      };
    }

    //clear the existing sma stored if period changed
    if (this.flow) {
      if (period != this.indicatorStorage[this.flow].sma.period) {
        this.indicatorStorage[this.flow].sma.period = period;
        this.indicatorStorage[this.flow].sma.data = {values: [], xData: [], yData: []};
      }
    } else {
      if (period != this.indicatorStorage.sma.period) {
        this.indicatorStorage.sma.period = period;
        this.indicatorStorage.sma.data = {values: [], xData: [], yData: []};
      }
    }
    let SMA = this.flow ? this.indicatorStorage[this.flow].sma.data.values : this.indicatorStorage.sma.data.values,
      xData = this.flow ? this.indicatorStorage[this.flow].sma.data.xData : this.indicatorStorage.sma.data.xData,
      yData = this.flow ? this.indicatorStorage[this.flow].sma.data.yData : this.indicatorStorage.sma.data.yData;
    // switch index for OHLC / Candlestick / Arearange
    if (this.isArray(yVal[0])) {
      index = params.index ? params.index : 0;
      yValue = yVal[0][index];
    }

    //do not calaculte from start if SMA length >0
    if (SMA.length <= 0) {
      // starting point
      points = [[xValue, yValue]];

      // accumulate first N-points
      while (range !== period) {
        utils.accumulateAverage(points, xVal, yVal, range, index);
        range++;
      }
      this.calculateSMA(xVal, yVal, points, range, SMAPoint, xData,
        yData, SMA, index, period, xLength);
    } else {
      //accumulate the average for pending points
      if (SMA[0][0] == xVal[period - 1]) {
        xLength = xVal.indexOf(SMA[SMA.length - 1][0]);
        let j;
        points = [];
        if (xLength == xVal.length - 1) { // updating the last point
          j = xVal.length - period;
          while (j < xVal.length) {
            utils.accumulateAverage(points, xVal, yVal, j, index);
            j++;
          }
        } else if (xLength < xVal.length - 1) { // adding new point to SMA series.
          j = xLength - period + 1;
          while (j < xVal.length) {
            utils.accumulateAverage(points, xVal, yVal, j, index);
            j++;
          }
        }
        range = j;
        this.calculateSMA(xVal, yVal, points, range, SMAPoint, xData,
          yData, SMA, index, period, xLength);
      } else if (SMA[0][0] > xVal[period]) { // when past candles r added
        let xNew = xVal.slice(0, xVal.indexOf(SMA[0][0]));
        let yNew = yVal.slice(0, xVal.indexOf(SMA[0][0]));
        // starting point
        if (this.isArray(yVal[0]))
          points = [[xNew[0], yNew[0][index]]];
        else
          points = [[xNew[0], yNew[0]]];

        // accumulate first N-points
        while (range !== period) {
          utils.accumulateAverage(points, xNew, yNew, range, index);
          range++;
        }
        let smaNew: any = [], xDataNew: any = [], yDataNew: any = [];
        this.calculateSMA(xNew, yNew, points, range, SMAPoint, xDataNew,
          yDataNew, smaNew, index, period, xLength);
        SMA = smaNew.concat(SMA);
        xData = xDataNew.concat(xData);
        yData = yDataNew.concat(yData);
      }
    }

    if (this.flow)
      this.indicatorStorage[this.flow].sma.data = {values: SMA, xData: xData, yData: yData};
    else
      this.indicatorStorage.sma.data = {values: SMA, xData: xData, yData: yData};

    return {
      values: SMA,
      xData: xData,
      yData: yData
    };
  };

  private calculateSMA(xVal: any, yVal: any, points: any, range: any, SMAPoint: any, xData: any,
                       yData: any, SMA: any, index: any, period: any, xLength: any) {
    let i;
    // calculate value one-by-one for each perdio in visible data

    for (i = range; i < yVal.length; i++) {
      SMAPoint = this.utils.populateAverage(points, xVal, yVal, i);
      SMA.push(SMAPoint);
      xData.push(SMAPoint[0]);
      yData.push(SMAPoint[1]);

      this.utils.accumulateAverage(points, xVal, yVal, i, index);
    }


    SMAPoint = this.utils.populateAverage(points, xVal, yVal, i);
    //if updating the last point in SMA
    if (xLength && xLength == xVal.length - 1) {
      SMA[SMA.length - 1] = SMAPoint;
      xData[xData.length - 1] = SMAPoint[0];
      yData[yData.length - 1] = SMAPoint[1];
    } else {
      // if pushing new point
      SMA.push(SMAPoint);
      xData.push(SMAPoint[0]);
      yData.push(SMAPoint[1]);
    }
  }

  getGraph = function (chart: any, series: any, options: any, values: any) {
    var path = [],
      attrs = {},
      xAxis = series.xAxis,
      yAxis = options.Axis = series.yAxis,
      sma = values,
      smaLen = sma.length,
      smaX,
      smaY,
      i;

    if (options.visible === false) {
      return false;
    }

    options.styles = attrs = this.merge({
      'stroke-width': 2,
      stroke: 'red',
      dashstyle: 'ShortDash'
    }, options.styles);

    path.push('M', xAxis.toPixels(sma[0][0]), yAxis.toPixels(sma[0][1]));

    for (i = 0; i < smaLen; i++) {
      smaX = sma[i][0];
      smaY = sma[i][1];

      path.push('L', xAxis.toPixels(smaX), yAxis.toPixels(smaY));
    }

    return [chart.renderer.path(path).attr(attrs)];
  };
  utils = {
    accumulateAverage: function (points: any, xVal: any, yVal: any, i: any, index: any) {
      var xValue = xVal[i],
        yValue = index < 0 ? yVal[i] : yVal[i][index];

      points.push([xValue, yValue]);
    },
    populateAverage: function (points: any, xVal: any, yVal: any, i: any) {
      var pLen = points.length,
        smaY = this.sumArray(points) / pLen,
        smaX = xVal[i - 1];

      points.shift(); // remove point until range < period

      return [smaX, smaY];
    },
    sumArray: function (array: any) {
      // reduce VS loop => reduce
      return array.reduce(function (prev: any, cur: any) {
        return [null, prev[1] + cur[1]];
      })[1];
    },

  };

}
