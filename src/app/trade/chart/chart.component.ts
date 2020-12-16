import { Component, Input, ElementRef, HostListener, ViewChild, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';
import { WTStorageService } from '../../shared/service/wt-storage.service';
import { Constants } from '../../shared/config/constants';

declare var Highcharts: any;
declare var moment: any;


@Component({
  moduleId: module.id,
  selector: 'chart-container',
  templateUrl: 'chart.component.html',
  styleUrls: ['chart.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class ChartComponent implements AfterViewInit, OnChanges {
  windowHeight: any;
  windowWidth: any;
  headerWrapperHeight: any;
  onresize: any;
  chartStock: any;
  chartLoaded: boolean = false;
  zoomCount: any = 0;
  color: any = '#954553';
  lineColor: any = '#f25d65';
  upLineColor: any = '#1fd6a4'; // docs
  upColor: any = '#248575';
  isMobileDevice = false;
  @Input() chartData: any;
  @Input() height: any;
  @Input() width: any;
  @Input() utc: any;
  @Output() getMoreCandles = new EventEmitter<string>();
  @ViewChild('chartContainer', { static: true }) chartContainer: any;
  zoomMobile = false;
  headerWrapperWidth: any;
  thread;

  constructor(private elementRef: ElementRef, private deviceService: DeviceDetectorService,public wtStorageService: WTStorageService,) {

  }

  flipColors() {
    this.color = '#954553';
    this.lineColor = '#f25d65'; // docs
    this.upLineColor = '#1fd6a4';
    this.upColor = '#248575';
    this.chartStock.update({
      plotOptions: {
        candlestick: {
          color: this.color,
          lineColor: this.lineColor,
          upLineColor: this.upLineColor, // docs
          upColor: this.upColor,
          tooltip: {
            followTouchMove: false
          }
        },
        series: {
          dataGrouping: {
            enabled: false
          }
        }
      }
    });
  }

  onResize(event) {
    this.heightManage();
    this.candleZoom();

    if (window.innerHeight < window.innerWidth) {

      this.manageWidth();
    }
    else {
      this.headerWrapperWidth = window.innerWidth;
    }
  }

  chartResetZoom() {
    if (this.chartData.length > 0) {
      this.chartStock.xAxis[0].setExtremes(this.chartData[this.chartData.length > 25 ? this.chartData.length - 25 : 0][0],
        this.chartData[this.chartData.length - 1][0], true, true);
      this.chartStock.yAxis[0].setExtremes(this.chartStock.yAxis[0].getExtremes().dataMin,
        this.chartStock.yAxis[0].getExtremes().dataMax, true, true);
      this.zoomCount = 0;
    }
  }

  chartZoomIn() {

    if (this.chartData.length < 20 || this.chartStock.series[0].xData.indexOf(this.chartStock.xAxis[0].getExtremes().min) + 10 >= this.chartData.length - 10) return;
    let newMin = this.chartData[this.chartStock.series[0].xData.indexOf(this.chartStock.xAxis[0].getExtremes().min) + 10][0];
    let newMax = this.chartData[this.chartData.length - 1][0];
    if (newMin < newMax)
      this.chartStock.xAxis[0].setExtremes(newMin, newMax, true, true);
  }

  chartZoomOut() {
    let lastIndex: any = this.chartStock.series[0].xData.indexOf(this.chartStock.xAxis[0].getExtremes().min);
    if (lastIndex == -1)
      lastIndex = this.chartStock.series[0].xData.findIndex(
        (ele: any, index: any) =>
          ele < this.chartStock.xAxis[0].getExtremes().min && this.chartStock.xAxis[0].getExtremes().min <
          this.chartStock.series[0].xData[index + 1]
      );
    if (lastIndex < 10) {
      this.getMoreCandles.next();
      return;
    }
    let newMin = this.chartData[lastIndex - 10][0];
    let newMax = this.chartData[this.chartData.length - 1][0];
    this.chartStock.xAxis[0].setExtremes(newMin, newMax, true, true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.utc) {
      this.customizeHighcharts();
    }
    if (changes.height) {
      this.height = changes.height.currentValue;
      if (this.isMobileDevice && window.innerHeight > window.innerWidth) {
        this.chartStock.setSize(window.innerWidth, this.height);
      }      
    }
    if (changes.width) {
      this.width = changes.width.currentValue;
      if (this.isMobileDevice && window.innerHeight < window.innerWidth) {
        this.chartStock.setSize(this.width, window.innerHeight);
      }
    }
  }

  ngAfterViewInit() {

      var chartInterval;
    chartInterval = setInterval(() => {
      if(this.wtStorageService.utc){
        clearInterval(chartInterval);
        this.customizeHighcharts();
      }
    }, 100);

    this.candleZoom();

    this.chartStock = Highcharts.stockChart('chartContainer', {
      rangeSelector: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      chart: {
        animation: false,
        alignAxes: false,
        renderTo: 'chartContainer',
        backgroundColor: null,
        pinchType: 'none',
        panning: true,
        resetZoomButton: {
          theme: {
            display: 'none'
          }
        }
      },
      // mapNavigation: {
      // 	enabled: false,
      // 	enableButtons: false,
      // 	enableTouchZoom: false,
      // 	enableMouseWheelZoom: false,
      // 	enableDoubleClickZoom: false,
      // 	enableDoubleClickZoomTo: false,
      // 	buttonOptions: {
      // 		verticalAlign: 'bottom',
      // 		theme: {
      // 			stroke: '#fff',
      // 		},
      // 		height: 16,
      // 		width: 16,
      // 	},
      // 	buttons: {
      // 		zoomIn: {

      // 			onclick: () => {
      // 				if (this.zoomCount < 2) {
      // 					this.chartStock.mapZoom(0.5);
      // 					this.zoomCount += 1;
      // 				}
      // 			}
      // 		},
      // 		zoomOut: {
      // 			onclick: () => {
      // 				if (this.zoomCount > -3) {
      // 					this.chartStock.mapZoom(2);
      // 					this.zoomCount -= 1;
      // 				}

      // 			}
      // 		}
      // 	}
      // },
      navigator: {
        enabled: false
      },
      lang: {
        resetZoom: 'Reset zoom',
      },
      exporting: {
        enabled: false
        /* buttons: {
                    customButton: {
                        onclick: () => {
                            this.resetView();
                        },
                        x: 30,
                        y: -60,
                        _titleKey: 'resetZoom',
                        symbol: 'url(/assets/images/reset-zoom.png)',
                        symbolX: 17,
                        symbolY: 17,
                        align: 'left',
                        verticalAlign: "bottom",
                        symbolFill: "#ffffff",
                        symbolSize: 10,
                        symbolStroke: "#000000",
                        symbolStrokeWidth: 1,
                    },
                    contextButton: {
                        enabled: false
                    }
                } */
      },
      plotOptions: {
        candlestick: {
          color: this.color,
          lineColor: this.lineColor,
          upLineColor: this.upLineColor, // docs
          upColor: this.upColor,
          tooltip: {
            followTouchMove: false
          }
        },
        series: {
          dataGrouping: {
            enabled: false
          }
        }
      },
      responsive: {
        rules: []
      },
      series: [{
        allowPointSelect: true,
        animation: true,
        type: 'candlestick',
        name: 'Trade',
        data: [],
        id: 'BoData'
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'SMA',
        data: [],
        id: 'sma',
        strokeWidth: 2,
        color: 'blue',
        dashstyle: 'Solid',
        visible: false,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'EMA',
        data: [],
        id: 'ema',
        strokeWidth: 2,
        color: 'green',
        dashstyle: 'Solid',
        visible: false,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'RSI',
        data: [],
        id: 'rsi',
        strokeWidth: 2,
        color: 'yellow',
        dashstyle: 'Solid',
        visible: false,
        yAxis: 1,
        tooltip: {
          valueDecimals: 6
        }
      },
      {
        allowPointSelect: true,
        animation: true,
        type: 'column',
        name: 'MACD',
        data: [],
        id: 'macd',
        strokeWidth: 2,
        color: 'white',
        dashstyle: 'Solid',
        visible: false,
        yAxis: 2,
        pointWidth: 2,
        tooltip: {
          valueDecimals: 7
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'MACD-Signal',
        data: [],
        id: 'macd-Signal',
        strokeWidth: 2,
        color: 'orange',
        dashstyle: 'Solid',
        visible: false,
        yAxis: 2,
        tooltip: {
          valueDecimals: 7
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'BB - Upper',
        data: [],
        id: 'BB - Upper',
        color: 'red',
        dashstyle: 'Solid',
        visible: false,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'BB - Middle',
        data: [],
        id: 'BB - Middle',
        color: 'red',
        dashstyle: 'Solid',
        visible: false,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'BB - Lower',
        data: [],
        id: 'BB - Lower',
        color: 'red',
        dashstyle: 'Solid',
        visible: false,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'STOCHASTIC %K',
        data: [],
        id: 'stochasticK',
        color: 'blue',
        dashstyle: 'Solid',
        visible: false,
        yAxis: 1,
        tooltip: {
          valueDecimals: 6
        }
      }, {
        allowPointSelect: true,
        animation: true,
        type: 'line',
        name: 'STOCHASTIC %D',
        data: [],
        id: 'stochasticD',
        color: 'red',
        dashstyle: 'Solid',
        visible: false,
        yAxis: 1,
        tooltip: {
          valueDecimals: 6
        }
      }],
      title: {
        text: ''
      },
      xAxis: {
        crosshair: false,
        gridLineColor: '#788d9e',
        gridLineWidth: 0.1,
        labels: {
          style: {
            'color': '#788d9e'
          }
        },
        lineColor: null,
        tickWidth: 0
      },

      yAxis: [{
        crosshair: false,
        gridLineColor: '#788d9e',
        gridLineWidth: 0.1,
        labels: {
          align: 'right',
          format: '{value:.5f}',
          x: -5,
          style: {
            'color': '#788d9e'
          }
        },
        lineColor: null,
        offset: 70,
        opposite: true,
        zIndex: 5,
      }, {
        crosshair: false,
        gridLineColor: '#788d9e',
        gridLineWidth: 0.1,
        labels: {
          align: 'right',
          //format: '{value:.5f}',
          x: -5,
          style: {
            'color': '#788d9e'
          }
        },
        lineColor: null,
        offset: 70,
        opposite: true,
        zIndex: 5,
        max: 100,
        //min: 0,
      }, {
        crosshair: false,
        gridLineColor: '#788d9e',
        gridLineWidth: 0.1,
        labels: {
          align: 'right',
          //format: '{value:.5f}',
          x: -5,
          style: {
            'color': '#788d9e'
          }
        },
        lineColor: null,
        offset: 70,
        opposite: true,
        zIndex: 5,
      }]
    });
  }

  ngOnInit() {
    this.isMobile();
    this.heightManage();

    this.candleZoom();

    if (window.innerHeight < window.innerWidth) {

      this.manageWidth();
    }
    else {
      this.headerWrapperWidth = window.innerWidth;
    }
  }

  resetOriginal() {
    this.chartStock.xAxis[0].setExtremes(1595587320000, 1595588160000, true, true);
  }

  getChart() {
    this.chartLoaded == true;
    return this.chartStock;
  }

  isMobile() {
    var deviceDetect = this.deviceService.getDeviceInfo().device;
    if (deviceDetect == 'Android' || deviceDetect == 'iPhone' || deviceDetect == 'BlackBerry' || deviceDetect == 'webOS' || deviceDetect == 'Firefox-OS' || (window.innerHeight > window.innerWidth && window.innerWidth < 767)) {
      this.isMobileDevice = true;
    }
    // alert(deviceDetect);

  }

  getTimeZone() {
    var timeZone = 'Europe/Athens';
    var utc = this.wtStorageService.utc;
    if (utc=='-12:00') {
      timeZone = 'Pacific/Wallis';
    }
    if (utc=='-11:00') {
      timeZone = 'Pacific/Pago_Pago';
    }
    if (utc=='-10:00') {
      timeZone = 'US/Hawaii';
    }
    if (utc=='-09:30') {
      timeZone = 'Pacific/Marquesas';
    }
    if (utc=='-09:00') {
      timeZone = 'America/Adak';
    }
    if (utc=='-08:00') {
      timeZone = 'America/Anchorage';
    }
    if (utc=='-07:00') {
      timeZone = 'America/Mountain';
    }
    if (utc=='-06:00') {
      timeZone = 'America/Managua';
    }
    if (utc=='-05:00') {
      timeZone = 'America/Lima';
    }
    if (utc=='-04:30') {
      timeZone = 'America/Caracas';
    }
    if (utc=='-04:00') {
      timeZone = 'America/La_Paz';
    }
    if (utc=='-03:00') {
      timeZone = 'America/Cayenne';
    }
    if (utc=='-02:00') {
      timeZone = 'America/Godthab';
    }
    if (utc=='-01:00') {
      timeZone = 'Atlantic/Cape_Verde';
    }
    if (utc=='-00:00') {
      timeZone = 'Africa/Monrovia';
    }
    if (utc=='+00:00') {
      timeZone = 'Africa/Monrovia';
    }
    if (utc=='+01:00') {
      timeZone = 'Africa/Lagos';
    }
    if (utc=='+02:00') {
      timeZone = 'Africa/Harare';
    }
    if (utc=='+03:00') {
      timeZone = 'Asia/Kuwait';
    }
    if (utc=='+03:30') {
      timeZone = 'Asia/Tehran';
    }
    if (utc=='+04:00') {
      timeZone = 'Asia/Muscat';
    }
    if (utc=='+04:30') {
      timeZone = 'Asia/Kabul';
    }
    if (utc=='+05:00') {
      timeZone = 'Asia/Karachi';
    }
    if (utc=='+05:30') {
      timeZone = 'Asia/Kolkata';
    }
    if (utc=='+05:45') {
      timeZone = 'Asia/Kathmandu';
    }
    if (utc=='+06:00') {
      timeZone = 'Asia/Dhaka';
    }
    if (utc=='+06:30') {
      timeZone = 'Asia/Rangoon';
    }
    if (utc=='+07:00') {
      timeZone = 'Asia/Bangkok';
    }
    if (utc=='+08:00') {
      timeZone = 'Asia/Hong_Kong';
    }
    if (utc=='+08:45') {
      timeZone = 'Australia/Eucla';
    }
    if (utc=='+09:00') {
      timeZone = 'Asia/Tokyo';
    }
    if (utc=='+09:30') {
      timeZone = 'Australia/Darwin';
    }
    if (utc=='+10:00') {
      timeZone = 'Australia/Brisbane';
    }
    if (utc=='+10:30') {
      timeZone = 'Australia/Adelaide';
    }
    if (utc=='+11:00') {
      timeZone = 'Pacific/Guadalcanal';
    }
    if (utc=='+12:00') {
      timeZone = 'Pacific/Kwajalein';
    }
    if (utc=='+12:45') {
      timeZone = 'Pacific/Chatham';
    }
    if (utc=='+13:00') {
      timeZone = 'Pacific/Tongatapu';
    }
    if (utc=='+14:00') {
      timeZone = 'Pacific/Apia';
    }
    return timeZone;
  }

  private customizeHighcharts() {
    Highcharts.setOptions({
      global: {
        // timezone: Constants.DefaultTimeZone,
        timezone: this.getTimeZone(),
      }
    });
    Highcharts.wrap(Highcharts.PlotLineOrBand.prototype, 'render', function (proceed: any) {
      var plotLine = this,
        axis = plotLine.axis,
        horiz = axis.horiz,
        options = plotLine.options,
        optionsLabel = options.label,
        label = plotLine.label,
        to = options.to,
        from = options.from,
        value = options.value,
        isBand = Highcharts.defined(from) && Highcharts.defined(to),
        isLine = Highcharts.defined(value),
        svgElem = plotLine.svgElem,
        isNew = !svgElem,
        path = [],
        addEvent,
        eventType,
        color = options.color,
        zIndex = Highcharts.pick(options.zIndex, 0),
        events = options.events,
        attribs = {
          'class': 'highcharts-plot-' + (isBand ? 'band ' : 'line ') + (options.className || ''),
          stroke: '',
          'stroke-width': '',
          dashstyle: '',
          fill: ''
        },
        groupAttribs = { zIndex: '' },
        renderer = axis.chart.renderer,
        groupName = isBand ? 'bands' : 'lines',
        group,
        log2lin = axis.log2lin;

      // logarithmic conversion
      if (axis.isLog) {
        from = log2lin(from);
        to = log2lin(to);
        value = log2lin(value);
      }
      // Set the presentational attributes
      if (isLine) {
        attribs.stroke = color;
        attribs['stroke-width'] = options.width;
        if (options.dashStyle) {
          attribs.dashstyle = options.dashStyle;
        }
      } else if (isBand) { // plot band
        if (color) {
          attribs.fill = color;
        }
        if (options.borderWidth) {
          attribs.stroke = options.borderColor;
          attribs['stroke-width'] = options.borderWidth;
        }
      }


      // Grouping and zIndex
      groupAttribs.zIndex = zIndex;
      groupName += '-' + zIndex;

      group = axis.plotLinesAndBandsGroups[groupName];
      if (!group) {
        axis.plotLinesAndBandsGroups[groupName] = group = renderer.g('plot-' + groupName)
          .attr(groupAttribs).add();
      }

      // Create the path
      if (isNew) {
        plotLine.svgElem = svgElem =
          renderer
            .path()
            .attr(attribs).add(group);
      }


      // Set the path or return
      if (isLine) {
        if (options.arrow) {
          path = axis.getPlotLinePath(value, svgElem.strokeWidth());
          if (path != null) {
            let xPar = path[4];
            let yPar = path[5];
            path.push(xPar, yPar, xPar + 5, yPar, xPar + 20, yPar - 10, xPar + 80, yPar - 10, xPar + 80, yPar + 10, xPar + 20, yPar +
              10, xPar + 5, yPar);
          }
        } else {
          path = axis.getPlotLinePath(value, svgElem.strokeWidth());
        }
      } else if (isBand) { // plot band
        path = axis.getPlotBandPath(from, to, options);
      } else {
        return;
      }


      // common for lines and bands
      if (isNew && path && path.length) {
        svgElem.attr({
          d: path,
          fill: options.color
        });

        // events
        if (events) {
          addEvent = function (eventType: any) {
            svgElem.on(eventType, function (e: any) {
              events[eventType].apply(plotLine, [e]);
            });
          };
          for (eventType in events) {
            addEvent(eventType);
          }
        }
      } else if (svgElem) {
        if (path) {
          svgElem.show();
          svgElem.animate({
            d: path
          });
        } else {
          svgElem.hide();
          if (label) {
            plotLine.label = label = label.destroy();
          }
        }
      }

      // the plot band/line label
      if (optionsLabel && Highcharts.defined(optionsLabel.text) && path && path.length &&
        axis.width > 0 && axis.height > 0 /*&& !path.flat*/) {
        // apply defaults
        optionsLabel = Highcharts.merge({
          align: horiz && isBand && 'center',
          x: horiz ? !isBand && 4 : 10,
          verticalAlign: !horiz && isBand && 'middle',
          y: horiz ? isBand ? 16 : 10 : isBand ? 6 : -4,
          rotation: horiz && !isBand && 90
        }, optionsLabel);

        this.renderLabel(optionsLabel, path, isBand, zIndex);

      } else if (label) { // move out of sight
        label.hide();
      }

      // chainable
      return plotLine;
    });
    /* setTimeout(() => {
           this.elementRef.nativeElement.querySelector('chartContainer').addEventListener(
               document.onmousewheel === undefined ? 'DOMMouseScroll' : 'mousewheel',
               (e: any) => {
                   let chart = Highcharts.charts[this.elementRef.nativeElement.querySelector('chartContainer').getAttribute('data-highcharts-chart')],
                       xAxis = chart.xAxis[0],
                       delta;

                   e = chart.pointer.normalize(e);

                   // Firefox uses e.detail, WebKit and IE uses wheelDelta
                   delta = e.detail || -(e.wheelDelta / 120);
                   if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
                       var range = xAxis.max - xAxis.min,
                           addRange = range * delta * 0.2,
                           newMin = xAxis.min - addRange / 2,
                           newMax;

                       if (newMin < xAxis.dataMin) {
                           newMin = xAxis.dataMin;
                       }
                       newMax = newMin + range + addRange;
                       if (newMax > xAxis.dataMax) {
                           newMax = xAxis.dataMax;
                           newMin = Math.max(newMax - range - addRange, xAxis.dataMin)
                       }


                       chart.xAxis[0].setExtremes(newMin, newMax);
                   }
               }
           )
       });  */

  }


  candleZoom(){
    var zoomInterval;
    if (this.isMobileDevice) {
      zoomInterval = setInterval(() => {
        if(this.chartData){
          this.chartZoomIn();
          this.chartZoomIn();
          this.chartZoomIn();
          this.chartZoomIn();
          this.chartZoomIn();
          this.chartZoomIn();
          clearInterval(zoomInterval);
        }
      }, 2000);
    }
  }
  

  heightManage() {
    if (this.isMobileDevice && window.innerHeight > window.innerWidth) {
      this.windowHeight = window.innerHeight;
      this.headerWrapperHeight = this.windowHeight - ((document.getElementsByClassName('header-wrapper')[0].clientHeight) + (document.getElementsByClassName('right-wrapper')[0].clientHeight) + (document.getElementsByClassName('quick-wrappper')[0].clientHeight));
      setTimeout(() => {
        this.headerWrapperHeight = this.windowHeight - ((document.getElementsByClassName('header-wrapper')[0].clientHeight) + (document.getElementsByClassName('right-wrapper')[0].clientHeight) + (document.getElementsByClassName('quick-wrappper')[0].clientHeight));
      }, 0);
    }

    else {
      this.windowHeight = window.innerHeight;
      this.headerWrapperHeight = this.windowHeight - (document.getElementsByClassName('header-wrapper')[0].clientHeight);
    }
  }
  manageWidth() {
    this.headerWrapperWidth = window.innerWidth - (document.getElementsByClassName('right-wrapper')[0].clientWidth);
  }
  // mobileHeightManage(){
  //   this.windowHeight = window.innerHeight;
  //   this.headerWrapperHeight = this.windowWidth - (document.getElementsByClassName('header-wrapper' + 'right-wrapper')[0].clientHeight);
  // }

}


