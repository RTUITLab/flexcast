import { SampleManager } from './SampleManager';

import bus from '@/model/Bus';

/**
 * Class for manipulating timeline
 */
export class TimeLineManager {
  private _sampleManager: SampleManager;

  private _isPlaying: boolean = false;

  private _time: number = 0;
  private _lastTimestamp: number = -1;

  private _pps: number = 50;
  private _volume: number = 0.2;

  constructor(sampleManager: SampleManager) {
    this._sampleManager = sampleManager;
  }

  /**
   * Property for playing/pausing
   */
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

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Property for changing zoom (pixels per second) of timeline
   */
  public set pps(pps: number) {
    this._pps = pps;
    bus.fire('ppsChanged');
  }

  /**
   * Get current timeline zoom (pixels per second)
   */
  public get pps(): number {
    return this._pps;
  }

  /**
   * Set total volume of timeline in range from 0 to 1
   */
  public set volume(volume: number) {
    this._volume = volume;
    bus.fire('volumeChanged');
  }

  /**
   * Get total volume of timeline in range from 0 to 1
   */
  public get volume(): number {
    return this._volume;
  }

  /**
   * Set current time in seconds
   */
  public set time(time: number) {
    this._time = Math.min(time * 1000, this._sampleManager.maxTime * 1000);
    bus.fire('seeked');
  }

  /**
   * Get current time in seconds
   */
  public get time(): number {
    return this._time / 1000;
  }

  /**
   * Fire scrollToCursor event
   */
  public scrollToCursor(): void {
    bus.fire('scrollToCursor');
  }
}
