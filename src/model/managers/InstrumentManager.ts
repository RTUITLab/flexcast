import bus from '@/model/Bus';

export type InstrumentType = 'mouse' | 'move' | 'remove';

export class InstrumentManager {
  private _instrument: InstrumentType = 'mouse';

  public set instrument(type: InstrumentType) {
    this._instrument = type;
    bus.fire('instrumentChanged');
  }

  public get instrument() {
    return this._instrument;
  }
}
