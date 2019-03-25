import axios from 'axios';

import { InstrumentType } from './Instrument';
import { SampleMerger } from './SampleMerger';
import { Rectangle } from './Rectangle';
import { Sample } from './Sample';
import { Beats } from './Beats';

import bus from './Bus';

export class State {
  private _isPlaying: boolean = false;

  private _pps: number = 50;
  private _volume: number = 1;

  private _time: number = 0;
  private _lastTimestamp: number = -1;

  private _instrument: InstrumentType | null = null;


  public get windowSlice() {
    return this._windowSlice;
  }

  public set isPlaying(playing: boolean) {
    this._isPlaying = playing;
    bus.fire('playPause');

    this._lastTimestamp = -1;
    const callback = (timestamp: number) => {
      if (this._lastTimestamp < 0) {
        this._lastTimestamp = timestamp;
      }
      this._time += timestamp - this._lastTimestamp;

      bus.fire('playing');

      this._lastTimestamp = timestamp;

      if (state.isPlaying) {
        if (state._time >= this._maxTime) {
          this._time = this._maxTime;
          state.isPlaying = false;
          return;
        }

        window.requestAnimationFrame(callback);
      }
    };

    if (this.isPlaying) {
      window.requestAnimationFrame(callback);
    }
  }

  public get isPlaying() {
    return this._isPlaying;
  }

  public set pps(pps: number) {
    this._pps = pps;
    bus.fire('ppsChanged');
  }

  public get pps() {
    return this._pps;
  }

  public set volume(volume: number) {
    this._volume = volume;
    bus.fire('volumeChanged');
  }

  public get volume() {
    return this._volume;
  }

  public set time(time: number) {
    this._time = time;
    bus.fire('seeked');
  }

  public get time() {
    return this._time;
  }

  public scrollToCursor() {
    bus.fire('scrollToCursor');
  }

  public set instrument(instrument: InstrumentType | null) {
    this._instrument = instrument;
    bus.fire('instrumentChanged');
  }

  public get instrument() {
    return this._instrument;
  }
}

const state = new State();
export default state;
