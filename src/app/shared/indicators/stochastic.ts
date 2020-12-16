import {SMA} from './sma';
import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class Stochastic {

  constructor(private indicatorStorage: IndicatorsStorageService) {
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
      period: [14, 3], //14 for %K, 3 for %D
      overbought: 70,
      oversold: 30
    };
  }

  getValues(chart: any, series: any, params: any, extraPoints: any) {
    var utils = this.utils,
      //params = options.params,
      periodK = params.period[0],
      periodD = params.period[1],
      xVal = extraPoints[0].concat(series.processedXData || []), // #22
      yVal = extraPoints[1].concat(series.processedYData || []), // #22
      minInArray = utils.minInArray,
      maxInArray = utils.maxInArray,
      sma = new SMA(this.indicatorStorage, 'stochastic');
    // so requires close value
    if (xVal.length <= periodK || !Highcharts.isArray(yVal[0]) || yVal[0].length != 4 || SMA === undefined) {
      this.indicatorStorage.stochastic.data = {values: [], xData: [], yData: [], kData: [], dData: []};
      return {};
    }
    if (this.indicatorStorage.stochastic.period[0] != periodK) {
      this.indicatorStorage.stochastic.period[0] = periodK;
      this.indicatorStorage.stochastic.data = {values: [], xData: [], yData: [], kData: [], dData: []};
    }
    if (this.indicatorStorage.stochastic.period[1] != periodD) {
      this.indicatorStorage.stochastic.period[1] = periodD;
      this.indicatorStorage.stochastic.data = {values: [], xData: [], yData: [], kData: [], dData: []};
    }
    let SO: any = this.indicatorStorage.stochastic.data.values, // 0- date, 1-%K, 2-%D
      xData: any = this.indicatorStorage.stochastic.data.xData,
      yData: any = this.indicatorStorage.stochastic.data.yData,
      kDataArr: any = this.indicatorStorage.stochastic.data.kData,
      dDataArr: any = this.indicatorStorage.stochastic.data.dData;
    if (SO.length <= 0) {
      this.calculateStochastic(SO, xData, yData, periodK, periodD, xVal, yVal,
        sma, chart, series, periodK, [], [], false, [], [], kDataArr, dDataArr);
    } else {
      if (SO[0][0] == xVal[periodK]) {
        let calIndex = xVal.indexOf(SO[SO.length - 1][0]);
        this.calculateStochastic(SO, xData, yData, periodK, periodD, xVal, yVal,
          sma, chart, series, calIndex, utils.getArrPoints(SO, 1).slice(0, SO.length - 1),
          utils.getArrPoints(SO, 0).slice(0, SO.length - 1), false, [], [], kDataArr, dDataArr);
      } else if (SO[0][0] > xVal[periodK]) {
        let soNew: any = [], xDataNew: any = [], yDataNew: any = [], kDataArrNew: any = [], dDataArrNew: any = [],
          xNew = xVal.slice(0, xVal.indexOf(SO[0][0])),
          yNew = yVal.slice(0, xVal.indexOf(SO[0][0]));
        this.calculateStochastic(soNew, xDataNew, yDataNew, periodK, periodD, xNew, yNew, sma,
          chart, series, periodK, [], [], true, utils.getArrPoints(SO, 1), utils.getArrPoints(SO, 0), kDataArrNew, dDataArrNew);
        SO = soNew.concat(SO);
        xData = xDataNew.concat(xData);
        yData = yDataNew.concat(yData);
        kDataArr = kDataArrNew.concat(kDataArr);
        dDataArr = dDataArrNew.concat(dDataArr);
      }
    }

    // register extremes for axis;
    /*options.yAxisMax = maxInArray(SO, 1);
        options.yAxisMin = minInArray(SO, 1);

        options.names = options.names || ['STOCHASTIC %K', 'STOCHASTIC %D'];*/
    this.indicatorStorage.stochastic.data = {values: SO, xData: xData, yData: yData, kData: kDataArr, dData: dDataArr};
    return {
      values: SO,
      xData: xData,
      yData: yData
    };
  }

  private calculateStochastic(SO: any, xData: any, yData: any, periodK: any, periodD: any,
                              xVal: any, yVal: any, sma: any, chart: any, series: any, calIndex: any, kPoints: any,
                              dates: any, isPastCandles: any, calKPoints: any, calDatePoints: any, kDataArr: any, dDataArr: any) {
    let i, slicedY,
      CL, HL, LL, K,
      D = null,
      dPoints = [], dPointsTemp,
      date,
      close = 3,
      low = 2,
      high = 1,
      open = 0;
    for (i = calIndex; i < yVal.length; i++) {
      slicedY = yVal.slice(i - periodK, i + 1); // i+1 - previous preiods + today
      date = xVal[i];

      // clacualte %K
      LL = this.utils.minInArray(slicedY, low); //lowest low in %K periods
      CL = yVal[i][close] - LL;
      HL = this.utils.maxInArray(slicedY, high) - LL;
      K = CL / HL * 100;
      kPoints.push(K);
      dates.push(xVal[i]);
    }
    if (isPastCandles) {
      dPointsTemp = sma.getValues(chart, {processedXData: [], processedYData: []}, {period: periodD},
        [dates.concat(calDatePoints), kPoints.concat(calKPoints)]);
    } else {
      dPointsTemp = sma.getValues(chart, {processedXData: [], processedYData: []}, {period: periodD},
        [dates, kPoints]);
    }
    for (let i = 0; i < dates.concat(calDatePoints).length - dPointsTemp.xData.length; i++) {
      dPoints[i] = null;
    }
    dPoints = dPoints.concat(dPointsTemp.yData);

    // add points
    for (let i = 0; i < dates.length; i++) {
      if (xData.indexOf(dates[i]) > -1) {
        SO[xData.indexOf(dates[i])] = [dates[i], kPoints[i], dPoints[i]];
        xData[xData.indexOf(dates[i])] = dates[i];
        yData[xData.indexOf(dates[i])] = [kPoints[i], dPoints[i]];
        kDataArr[xData.indexOf(dates[i])] = [dates[i], kPoints[i]];
        dDataArr[xData.indexOf(dates[i])] = [dates[i], dPoints[i]];
      } else {
        SO.push([dates[i], kPoints[i], dPoints[i]]);
        xData.push(dates[i]);
        yData.push([kPoints[i], dPoints[i]]);
        kDataArr.push([dates[i], kPoints[i]]);
        dDataArr.push([dates[i], dPoints[i]]);
      }

      if (series.points[i - periodK] !== undefined) {
        series.points[i - periodK].indicators.stochastic = {
          K: kPoints[i],
          D: dPoints[i]
        };
      }
    }
  }

  getGraph(chart: any, series: any, options: any, values: any) {
    var path = [],
      outputPath = [],
      attrs = [],
      topLine = options.topLine ? options.topLine.styles : {},
      mainLine = options.mainLine ? options.mainLine.styles : {},
      xAxis = series.xAxis,
      yAxis = series.yAxis,
      so = values,
      soLen = so.length,
      soX,
      soY,
      line,
      defaultOptions,
      userOptions,
      index,
      i, j;

    attrs[0] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'blue',
      dashstyle: 'Solid'
    }, topLine);

    attrs[1] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'red',
      dashstyle: 'Solid'
    }, mainLine);


    options.styles = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'blue',
      dashstyle: 'Solid'
    }, options.styles || attrs[0]);

    defaultOptions = {
      min: 0,
      //tickInterval: 25,
      plotLines: [{
        value: options.params.overbought,
        color: 'orange',
        width: 1
      }, {
        value: options.params.oversold,
        color: 'orange',
        width: 1
      }],
      //height: 100,
      max: 100,
      title: {
        text: 'STOCHASTIC'
      }
    };

    userOptions = Highcharts.merge(defaultOptions, options.yAxis);

    if (options.visible === false) {
      return {};
    }

    userOptions = Highcharts.merge(defaultOptions, options.yAxis);

    if (options.Axis === undefined) {
      index = Highcharts.Axis.prototype.addAxisPane(chart, userOptions);
      options.Axis = chart.yAxis[index];
    } else {
      //options.Axis.render();
    }

    yAxis = options.Axis;

    // we have two paths
    for (j = 0; j < 2; j++) {
      line = j + 1;

      path = [];

      path.push('M', xAxis.toPixels(so[0][0]), yAxis.toPixels(so[0][line]));


      for (i = 0; i < soLen; i++) {
        soX = so[i][0];
        soY = so[i][line];

        path.push('L', xAxis.toPixels(soX), yAxis.toPixels(soY));
      }

      outputPath.push(chart.renderer.path(path).attr(attrs[j]));
    }
    return outputPath;
  }

  utils = {
    minInArray: function (arr: any, index: any) {
      return arr.reduce(function (min: any, arr: any) {
        return Math.min(min, arr[index]);
      }, Infinity);
    },
    maxInArray: function (arr: any, index: any) {
      return arr.reduce(function (min: any, arr: any) {
        return Math.max(min, arr[index]);
      }, 0);
    },
    getArrPoints: function (arr: any, index: any) {
      let kPoints = [];
      for (let i = 0; i < arr.length; i++) {
        kPoints.push(arr[i][index]);
      }
      return kPoints;
    }
  };
}
