import {SMA} from './sma';
import {IndicatorsStorageService} from './indicators-storage.service';

declare var Highcharts: any;

export class BB {
  constructor(private indicatorStorage: IndicatorsStorageService) {
  }

  /***

   Each indicator requires mothods:

   - getDefaultOptions()                      - returns object with default parameters, like period etc.
   - getValues(chart, series, options, points) - returns array of calculated values for indicator
   - getGraph(chart, series, options, values)  - returns path, or columns as SVG elements to add.
   Doesn't add to the chart via renderer!

   ***/

  /***
   indicators: [{
            id: 'series-id',
            type: 'bb',
            params: {
                period: 'x',
                standardDeviation: 'x'
            },
            styles: {
                lineWidth: 'x',
                strokeColor: 'y'
            }
        }]

   ***/
  getDefaultOptions() {
    return {
      approximation: (top: any, middle: any, bot: any) => {
        var ret = [
          Highcharts.approximations.average(top),
          Highcharts.approximations.average(middle),
          Highcharts.approximations.average(bot),
        ];

        if (ret[0] !== undefined && ret[1] !== undefined && ret[2] !== undefined) {
          return ret;
        } else {
          return undefined;
        }
      },
      period: 20,
      standardDeviation: 2
    };
  }

  getValues(chart: any, series: any, params: any, points: any) {
    let utils = this.utils,
      // params = options.params,
      period = params.period,
      standardDeviation: any = params.standardDeviation,
      xVal = points[0].concat(series.processedXData || []),
      yVal = points[1].concat(series.processedYData || []),
      yValLen = yVal ? yVal.length : 0,
      sma: any = new SMA(this.indicatorStorage, 'bb'),
      range = 0,
      ML, TL, BL, // middle line, top line and bottom line
      date,
      slicedX,
      slicedY,
      stdDev,
      index = 3,
      smaPoint, xIndex;
    this.indicatorStorage.bb.sma.period = period;

    // bb requires close value
    if (xVal.length <= period || !Highcharts.isArray(yVal[0]) || yVal[0].length != 4 || sma === undefined) return {};

    if (this.indicatorStorage.bb.standardDeviation != standardDeviation) {
      this.indicatorStorage.bb.standardDeviation = standardDeviation;
      this.indicatorStorage.bb.data = {values: [], xData: [], yData: [], TL: [], ML: [], BL: []};
    }
    if (this.indicatorStorage.bb.period != period) {
      this.indicatorStorage.bb.period = period;
      this.indicatorStorage.bb.data = {values: [], xData: [], yData: [], TL: [], ML: [], BL: []};
    }
    let BB = this.indicatorStorage.bb.data.values,// 0- date, 1-middle line, 2-top line, 3-bottom line
      xData = this.indicatorStorage.bb.data.xData,
      yData = this.indicatorStorage.bb.data.yData,
      tlArr = this.indicatorStorage.bb.data.TL,
      mlArr = this.indicatorStorage.bb.data.ML,
      blArr = this.indicatorStorage.bb.data.BL;
    smaPoint = sma.getValues(chart, {processedXData: [], processedYData: []}, params, [xVal, yVal]);
    if (BB.length <= 0) {
      this.calculateBB(BB, xData, yData, smaPoint, xVal, yVal,
        period, standardDeviation, series, period + 1, tlArr, mlArr, blArr);
    } else {
      if (BB[0][0] == xVal[period]) {
        let calIndex;
        calIndex = xVal.indexOf(BB[BB.length - 1][0]) + 1;
        this.calculateBB(BB, xData, yData, smaPoint, xVal, yVal,
          period, standardDeviation, series, calIndex, tlArr, mlArr, blArr);
      } else if (BB[0][0] > xVal[period]) {
        let xNew = xVal.slice(0, xVal.indexOf(BB[0][0]));
        let yNew = yVal.slice(0, xVal.indexOf(BB[0][0]));
        let smaPointNew = {values: {}, xData: {}, yData: {}};
        smaPointNew.values = smaPoint.values.slice(0, smaPoint.xData.indexOf(BB[0][0]));
        smaPointNew.xData = smaPoint.xData.slice(0, smaPoint.xData.indexOf(BB[0][0]));
        smaPointNew.yData = smaPoint.yData.slice(0, smaPoint.xData.indexOf(BB[0][0]));
        let bbNew: any = [], xDataNew: any = [], yDataNew: any = [],
          tlArrNew: any = [], mlArrNew: any = [], blArrNew: any = [];
        this.calculateBB(bbNew, xDataNew, yDataNew, smaPointNew, xNew, yNew,
          period, standardDeviation, series, period + 1, tlArrNew, mlArrNew, blArrNew);
        BB = bbNew.concat(BB);
        xData = xDataNew.concat(xData);
        yData = yDataNew.concat(yData);
        tlArr = tlArrNew.concat(tlArr);
        mlArr = mlArrNew.concat(mlArr);
        blArr = blArrNew.concat(blArr);
      }
    }
    /*options.names = ['BB - Upper', 'BB - Middle', 'BB - Lower'];

    // registger extremes for axis;
    options.yAxisMax = Highcharts.Axis.prototype.maxInArray(BB);
    options.yAxisMin = Highcharts.Axis.prototype.minInArray(BB);*/

    this.indicatorStorage.bb.data = {values: BB, xData: xData, yData: yData, TL: tlArr, ML: mlArr, BL: blArr};
    return {
      values: BB,
      xData: xData,
      yData: yData
    };
  }

  private calculateBB(BB: any, xData: any, yData: any, smaPoint: any, xVal: any, yVal: any,
                      period: any, standardDeviation: any, series: any, calIndex: any, tlArr: any, mlArr: any, blArr: any) {
    let i, slicedX, slicedY, date, ML, stdDev, TL, BL;
    for (i = calIndex; i <= yVal.length; i++) {
      slicedX = xVal.slice(i - period - 1, i);
      slicedY = yVal.slice(i - period - 1, i);

      //point = sma.getValues(chart, { processedXData: [], processedYData: [] }, options, [slicedX, slicedY]);

      date = smaPoint.xData[i - period];
      ML = smaPoint.yData[i - period];
      stdDev = this.utils.stdDev(slicedY, ML);
      TL = ML + standardDeviation * stdDev;
      BL = ML - standardDeviation * stdDev;

      if (xData.indexOf(date) == -1 || xData.indexOf(date) == xData.length - 1) {
        //if updating the last point in BB
        if (i == xVal.length) {
          BB[BB.length - 1] = [date, TL, ML, BL];
          xData[xData.length - 1] = date;
          yData[yData.length - 1] = [TL, ML, BL];
          tlArr[tlArr.length - 1] = [date, TL];
          blArr[blArr.length - 1] = [date, BL];
          mlArr[mlArr.length - 1] = [date, ML];
        } else {
          // if pushing new point
          BB.push([date, TL, ML, BL]);
          xData.push(date);
          yData.push([TL, ML, BL]);
          tlArr.push([date, TL]);
          blArr.push([date, BL]);
          mlArr.push([date, ML]);
        }
      }

      if (i > period && series.points[i - period - 1] !== undefined) {
        series.points[i - period - 1].indicators.bb = {
          top: TL,
          middle: ML,
          bottom: BL
        };
      }
    }
  }

  getGraph = function (chart: any, series: any, options: any, values: any) {
    var path = [],
      attrs = [],
      topLine = options.topLine ? options.topLine.styles : {},
      mainLine = options.mainLine ? options.mainLine.styles : {},
      bottomLine = options.bottomLine ? options.bottomLine.styles : {},
      xAxis = series.xAxis,
      yAxis = options.Axis = series.yAxis,
      outputPath = [],
      bb = values,
      bbLen = bb.length,
      bbX,
      bbY,
      line,
      i, j;

    attrs[0] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'red',
      dashstyle: 'Solid'
    }, topLine);

    attrs[1] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'red',
      dashstyle: 'Solid'
    }, mainLine);

    attrs[2] = Highcharts.merge({
      'stroke-width': 1,
      stroke: 'red',
      dashstyle: 'Solid'
    }, bottomLine);


    options.styles = Highcharts.merge({
      'stroke-width': 2,
      stroke: 'red',
      dashstyle: 'ShortDash'
    }, options.styles || attrs[0]);


    for (j = 0; j < 3; j++) {

      line = j + 1;

      path = [];

      path.push('M', xAxis.toPixels(bb[0][0]), yAxis.toPixels(bb[0][line]));

      for (i = 0; i < bbLen; i++) {
        bbX = bb[i][0];
        bbY = bb[i][line];

        path.push('L', xAxis.toPixels(bbX), yAxis.toPixels(bbY));
      }

      outputPath.push(chart.renderer.path(path).attr(attrs[j]));

    }

    return outputPath;
  };
  utils = {
    stdDev: function (arr: any, mean: any) {
      var variance = 0,
        arrLen = arr.length,
        std = 0,
        i = 0;
      for (; i < arrLen; i++) {
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
    }
  };

  toFixed(a: any, n: any) {
    return parseFloat(a.toFixed(n));
  }
}

