import bus from '@/model/Bus';

export type InstrumentType = 'mouse' | 'move' | 'remove';

/**
 * Class for choosing and managing work instruments
 */
export class InstrumentManager {
  private _instrument: InstrumentType = 'mouse';

  /**
   * Set current instrument
   * @param type wanted instrument
   */
  public set instrument(type: InstrumentType) {
    this._instrument = type;
    bus.fire('instrumentChanged');
  }

  /**
   * return current instrument
   */
  public get instrument(): InstrumentType {
    return this._instrument;
  }
}
