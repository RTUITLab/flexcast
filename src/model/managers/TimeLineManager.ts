import { SampleManager } from './SampleManager';

import bus from '@/model/Bus';

export class TimeLineManager {
  private _sampleManager: SampleManager;

  private _isPlaying: boolean = false;

  private _time: number = 0;
  private _lastTimestamp: number = -1;

  private _pps: number = 50;
  private _volume: number = 1;

  constructor(sampleManager: SampleManager) {
    this._sampleManager = sampleManager;
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

      if (this._isPlaying) {
        const maxTime = this._sampleManager.maxTime * 1000;

        if (this._time >= maxTime) {
          this._time = maxTime;
          this.isPlaying = false;
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
    this._time = Math.min(time * 1000, this._sampleManager.maxTime * 1000);
    bus.fire('seeked');
  }

  public get time() {
    return this._time / 1000;
  }

  public scrollToCursor() {
    bus.fire('scrollToCursor');
  }
}
