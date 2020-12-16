import {SMA} from './sma';
import {EMA} from './ema';
import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class MACD {

  constructor(private indicatorStorage: IndicatorsStorageService) {
  }

  toFixed(a: any, n: any) {
    return parseFloat(a.toFixed(n));
  }

  getDefaultOptions() {
    return {
      approximation: function (top: any, bot: any) {
        var ret = [
          Highcharts.approximations.average(top),
          Highcharts.approximations.average(bot),
        ];
        if (ret[0] !== undefined && ret[1] !== undefined) {
          return ret;
        } else {
          return undefined;
        }
      },
      period: 7,
      standardDeviation: 2,
      slowPeriod: 7,
      fastPeriod: 4,
      signalPeriod: 2
    };
  }

  getValues(chart: any, series: any, params: any, points: any) {
    var utils = this.utils,
      //params = options.params,
      slowPeriod = params.slowPeriod,
      fastPeriod = params.fastPeriod,
      signalPeriod = params.signalPeriod,
      standardDeviation = params.standardDeviation,
      xVal = points[0].concat(series.processedXData || []),
      yVal = points[1].concat(series.processedYData || []),
      fastEMA = new EMA(this.indicatorStorage, 'macdFastEma'),
      slowEMA = new EMA(this.indicatorStorage, 'macdSlowEma'),
      sma = new SMA(this.indicatorStorage, 'macd'),
      range = 0,
      j = 0,
      pointSignal: any = [],
      MACDPoints: any = [],
      date,
      pointSlow, pointFast,
      xIndex;


    this.indicatorStorage.macd.sma.period = slowPeriod;
    //macd requires close value
    if (xVal.length <= slowPeriod || !Highcharts.isArray(yVal[0]) || yVal[0].length != 4 || EMA === undefined) {
      return {};
    }
    if (this.indicatorStorage.macd.sma.period != signalPeriod || this.indicatorStorage.macdSlowEma.period != slowPeriod
      || this.indicatorStorage.macdFastEma.period != fastPeriod) {
      this.indicatorStorage.macd.data = {values: [], xData: [], yData: [], macd: [], macdSignal: [], macdHist: []};
      this.indicatorStorage.macd.sma.data = {values: [], xData: [], yData: []};
      this.indicatorStorage.macdSlowEma.ema.data = {values: [], xData: [], yData: []};
      this.indicatorStorage.macdFastEma.ema.data = {values: [], xData: [], yData: []};
    }
    let MACD: any = this.indicatorStorage.macd.data.values,
      xData = this.indicatorStorage.macd.data.xData,
      yData = this.indicatorStorage.macd.data.yData,
      macdArr = this.indicatorStorage.macd.data.macd,
      macdSignalArr = this.indicatorStorage.macd.data.macdSignal;
    pointSlow = slowEMA.getValues(chart, {processedXData: [], processedYData: []}, {period: slowPeriod, index: params.index}, [xVal, yVal]);
    pointFast = fastEMA.getValues(chart, {processedXData: [], processedYData: []}, {period: fastPeriod, index: params.index}, [xVal, yVal]);

    if (MACD.length <= 0) {
      this.calculateMACD(pointFast, pointSlow, chart, MACDPoints, sma,
        MACD, xData, yData, signalPeriod, xIndex, xVal, 0, macdArr, macdSignalArr);
    } else if (MACD[0][0] == xVal[slowPeriod - 1]) {
      xIndex = pointSlow.xData.indexOf(MACD[MACD.length - 1][0]);
      MACDPoints = this.utils.getArrPoints(MACD, 1);
      this.calculateMACD(pointFast, pointSlow, chart, MACDPoints, sma,
        MACD, xData, yData, signalPeriod, xIndex, xVal, xIndex, macdArr, macdSignalArr);
    } else if (MACD[0][0] > xVal[slowPeriod - 1]) {
      let xNew = xVal.slice(0, xVal.indexOf(MACD[0][0])),
        yNew = yVal.slice(0, xVal.indexOf(MACD[0][0])),
        pointFastNew: any = {values: [], xData: [], yData: []},
        pointSlowNew: any = {values: [], xData: [], yData: []},
        macdPointsNew: any = [];
      pointFastNew.values = pointFast.values.slice(0, pointFast.xData.indexOf(MACD[0][0]));
      pointSlowNew.values = pointSlow.values.slice(0, pointSlow.xData.indexOf(MACD[0][0]));
      pointSlowNew.xData = pointSlow.xData.slice(0, pointSlow.xData.indexOf(MACD[0][0]));
      let macdNew: any = [], xDataNew: any = [], yDataNew: any = [],
        macdArrNew: any = [], macdSignalArrNew: any = [];
      this.calculateMACD(pointFastNew, pointSlowNew, chart, macdPointsNew, sma,
        macdNew, xDataNew, yDataNew, signalPeriod, xIndex, xVal, 0, macdArrNew, macdSignalArrNew);
      MACD = macdNew.concat(MACD);
      xData = xDataNew.concat(xData);
      yData = yDataNew.concat(yData);
      macdArr = macdArrNew.concat(macdArr);
      macdSignalArr = macdSignalArrNew.concat(macdSignalArr);
    }


    // register extremes for axis;
    /* options.yAxisMax = Highcharts.Axis.prototype.maxInArray(MACD);
     options.yAxisMin = Highcharts.Axis.prototype.minInArray(MACD);
     options.names = options.names || ['MACD', 'MACD-Signal', 'MACD-Histogram'];*/
    this.indicatorStorage.macd.data = {
      values: MACD, xData: xData, yData: yData,
      macd: macdArr, macdSignal: macdSignalArr
    };
    return {
      values: MACD,
      xData: xData,
      yData: yData
    };
  }

  private calculateMACD(pointFast: any, pointSlow: any, chart: any, MACDPoints: any, sma: any,
                        MACD: any, xData: any, yData: any, signalPeriod: any, xIndex: any, xVal: any, calIndex: any,
                        macdArr: any, macdSignalArr: any) {
    let pointSignal: any = [], pointSignalTmp: any = [];
    for (let i = calIndex + 0, j = calIndex + pointFast.values.length - pointSlow.values.length; i < pointSlow.values.length && j < pointFast.values.length; i++ , j++) {
      MACDPoints.push([pointFast.values[j][1] - pointSlow.values[i][1]]);
    }
    pointSignalTmp = sma.getValues(chart, {processedXData: [], processedYData: []}, {period: signalPeriod}, [pointSlow.xData, MACDPoints]);
    if (calIndex == 0) {
      for (let i = 0; i < pointSlow.values.length - pointSignalTmp.values.length; i++) {
        pointSignal[i] = null;
      }
      pointSignal = pointSignal.concat(pointSignalTmp.yData);
    }

    for (let i = calIndex; i < pointSlow.xData.length; i++) {
      if (xIndex && xIndex == xVal.length - 1) {
        MACD[MACD.length - 1] = [pointSlow.xData[i], MACDPoints[i][0], pointSignal[i]];
        xData[xData.length - 1] = pointSlow.xData[i];
        yData[yData.length - 1] = [MACDPoints[i][0], pointSignal[i]];
        macdArr[macdArr.length - 1] = [pointSlow.xData[i], MACDPoints[i][0]];
        macdSignalArr[macdSignalArr.length - 1] = [pointSlow.xData[i], pointSignal[i]];
      }
      else {
        MACD.push([pointSlow.xData[i], MACDPoints[i][0], pointSignal[i]]);
        yData.push([MACDPoints[i][0], pointSignal[i]]);
        xData.push(pointSlow.xData[i]);
        macdArr.push([pointSlow.xData[i], MACDPoints[i][0]]);
        macdSignalArr.push([pointSlow.xData[i], pointSignal[i]]);
      }
    }
  }

  getGraph(chart: any, series: any, options: any, values: any) {
    var path = [],
      outputPath = [],
      attrs = [],
      macdLine = options.macdLine ? options.macdLine.styles : {},
      signalLine = options.signalLine ? options.signalLine.styles : {},
      xAxis = series.xAxis,
      yAxis = series.yAxis,
      yAxis = options.Axis,
      min = Highcharts.Axis.prototype.minInArray(values),
      max = Highcharts.Axis.prototype.maxInArray(values),
      MACD = values,
      MACDLen = MACD.length,
      MACDX,
      MACDY,
      defaultOptions,
      line,
      userOptions,
      index,
      i, j;

    attrs[0] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'darkblue',
      dashstyle: 'Solid'
    }, macdLine);

    attrs[1] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'lime',
      dashstyle: 'Solid'
    }, signalLine);
    attrs[2] = {
      'stroke-width': 1,
      stroke: 'white',
      fill: 'white',
    };
    options.styles = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'blue',
      dashstyle: 'Solid'
    }, options.styles || attrs[0]);
    defaultOptions = {
      min: Highcharts.Axis.prototype.minInArray(values),
      max: Highcharts.Axis.prototype.maxInArray(values),
      plotLines: [{
        value: 0,
        color: 'white',
        width: 0.5
      }],
      title: {
        text: 'MACD'
      }
    };
    userOptions = Highcharts.merge(defaultOptions, options.yAxis);
    if (options.visible === false) {
      return {};
    }
    if (options.Axis === undefined) {
      index = Highcharts.Axis.prototype.addAxisPane(chart, userOptions);
      options.Axis = chart.yAxis[index];
    } else {
      //options.Axis.render();
    }
    yAxis = options.Axis;

    for (let j = 0; j < 2; j++) {
      line = j + 1;
      path = [];
      path.push('M', xAxis.toPixels(MACD[0][0]), yAxis.toPixels(MACD[0][line]));
      for (let i = 0; i < MACDLen; i++) {
        MACDX = MACD[i][0];
        MACDY = MACD[i][line];
        path.push('L', xAxis.toPixels(MACDX), yAxis.toPixels(MACDY));
      }
      outputPath.push(chart.renderer.path(path).attr(attrs[j]));
    }
    path = [];
    for (let k = 0; k < MACDLen; k++) {
      MACDX = MACD[k][0];
      MACDY = MACD[k][3];
      if (MACDY > 0)
        outputPath.push(chart.renderer.rect(xAxis.toPixels(MACDX), yAxis.toPixels(MACDY), 2,
          Math.abs(yAxis.toPixels(0) - yAxis.toPixels(MACDY))).attr(attrs[2]));
      if (MACDY < 0)
        outputPath.push(chart.renderer.rect(xAxis.toPixels(MACDX), yAxis.toPixels(0), 2,
          Math.abs(yAxis.toPixels(0) - yAxis.toPixels(MACDY))).attr(attrs[2]));
    }
    return outputPath;
  }

  utils = {
    stdDev: function (arr: any, mean: any) {
      var variance = 0,
        arrLen = arr.length,
        std = 0;

      for (let i = 0; i < arrLen; i++) {
        variance += (arr[i][3] - mean) * (arr[i][3] - mean);
      }
      variance = variance / (arrLen - 1);

      std = Math.sqrt(variance);
      return std;
    },
    sumArray: function (array: any) {
      // reduce VS loop => reduce
      return array.reduce(function (prev: any, cur: any) {
        return prev + cur;
      });
    },
    getArrPoints: function (arr: any, index: any) {
      let points = [];
      for (let i = 0; i < arr.length; i++) {
        points.push(arr[i][index]);
      }
      return points;
    }
  };
}
