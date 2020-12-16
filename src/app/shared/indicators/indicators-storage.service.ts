import {Injectable} from '@angular/core';

@Injectable()
export class IndicatorsStorageService {
  sma: any = {
    data: {
      values: [],
      xData: [],
      yData: []
    },
    period: 14
  };
  ema: any = {
    data: {
      values: [],
      xData: [],
      yData: []
    },
    period: 14
  };
  bb: any = {
    sma: {
      data: {
        values: [],
        xData: [],
        yData: [],
      },
      period: 14,
    },
    data: {
      values: [],
      xData: [],
      yData: [],
      TL: [],
      ML: [],
      BL: []
    },
    period: 20
  };
  rsi: any = {
    data: {
      values: [],
      xData: [],
      yData: []
    },
    period: 14,
    avgGainLoss: []
  };
  stochastic: any = {
    sma: {
      data: {
        values: [],
        xData: [],
        yData: []
      },
      period: 14
    },
    data: {
      values: [],
      xData: [],
      yData: [],
      kData: [],
      dData: []
    },
    period: [14, 3]
  };
  macd: any = {
    sma: {
      data: {
        values: [],
        xData: [],
        yData: []
      },
      period: 5,
    },
    data: {
      values: [],
      xData: [],
      yData: [],
      macd: [],
      macdSignal: []
    },
    period: 14
  };
  macdFastEma: any = {
    ema: {
      data: {
        values: [],
        xData: [],
        yData: []
      },
      period: 5,
    }
  };
  macdSlowEma: any = {
    ema: {

      data: {
        values: [],
        xData: [],
        yData: []
      },
      period: 5,
    }
  };

  resetIndicatorStorage() {
    this.sma.data = {values: [], xData: [], yData: []};
    this.ema.data = {values: [], xData: [], yData: []};
    this.bb.data = {values: [], xData: [], yData: [], TL: [], ML: [], BL: []};
    this.bb.sma.data = {values: [], xData: [], yData: []};
    this.rsi.data = {values: [], xData: [], yData: []};
    this.rsi.avgGainLoss = [];
    this.stochastic.data = {values: [], xData: [], yData: [], kData: [], dData: []};
    this.stochastic.sma.data = {values: [], xData: [], yData: []};
    this.macd.data = {values: [], xData: [], yData: [], macd: [], macdSignal: []};
    this.macd.sma.data = {values: [], xData: [], yData: []};
    this.macdSlowEma.ema.data = {values: [], xData: [], yData: []};
    this.macdFastEma.ema.data = {values: [], xData: [], yData: []};

  }
}
