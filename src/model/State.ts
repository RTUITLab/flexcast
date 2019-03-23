import { Sample } from '@/model/Sample';
import { IWindowSlice } from '@/model/WindowSlice';

type StateEvent =
  | 'sourcesChanged'
  | 'ready'
  | 'samplesChanged'
  | 'ppsChanged'
  | 'volumeChanged'
  | 'windowSliceChanged'
  | 'playPause'
  | 'playing'
  | 'seeked'
  | 'handleStartedFinished'
  | 'handleMoved';

type StateEventHandler = () => void;

export interface ISourceHandle {
  data: string;
  pageX: number;
  pageY: number;
}

export class State {
  public _sources: string[] = [];

  public _windowSlice: IWindowSlice = {
    offsetLeft: 0,
    offsetTop: 0,
    width: 0,
    height: 0
  };

  public _isPlaying: boolean = false;

  private _pps: number = 50;
  private _volume: number = 1;

  private _time: number = 0;
  private _lastTimestamp: number = -1;

  private _listeners: Map<StateEvent, StateEventHandler[]> = new Map();

  private _samples: Sample[] = [];

  private _sourceHandle: ISourceHandle | null = null;

  public updateSample(sample: Sample) {
    const index = this.samples.findIndex((value) => value.id === sample.id);

    if (index < 0) {
      return;
    }

    this.samples[index] = sample;
    this.fire('samplesChanged');
    this.checkComplete();
  }

  public on(event: StateEvent, handler: StateEventHandler) {
    const listeners = this._listeners.get(event);
    this._listeners.set(event, (listeners || []).concat(handler));
  }

  public off(event: StateEvent, handler: StateEventHandler) {
    const listeners = this._listeners.get(event);

    if (listeners == null) {
      return;
    }

    const handlerIndex = listeners.findIndex((v) => v === handler);
    if (handlerIndex < 0) {
      return;
    }

    this._listeners.set(event, listeners.splice(handlerIndex, 1));
  }

  public addSource(url: string) {
    this._sources.push(url);
    this.fire('sourcesChanged');
  }

  public get sources() {
    return this._sources;
  }

  public set windowSlice(windowSlice: IWindowSlice) {
    this._windowSlice = windowSlice;
    this.fire('windowSliceChanged');
  }

  public get windowSlice() {
    return this._windowSlice;
  }

  public set isPlaying(playing: boolean) {
    this._isPlaying = playing;
    this.fire('playPause');

    this._lastTimestamp = -1;
    const callback = (timestamp: number) => {
      if (this._lastTimestamp < 0) {
        this._lastTimestamp = timestamp;
      }
      this._time += timestamp - this._lastTimestamp;

      this.fire('playing');

      this._lastTimestamp = timestamp;

      if (state.isPlaying) {
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
    this.fire('ppsChanged');
  }

  public get pps() {
    return this._pps;
  }

  public set volume(volume: number) {
    this._volume = volume;
    this.fire('volumeChanged');
  }

  public get volume() {
    return this._volume;
  }

  public set time(time: number) {
    this._time = time;
    this.fire('seeked');
  }

  public get time() {
    return this._time;
  }

  public set samples(samples: Sample[]) {
    this._samples = samples;
    this.fire('samplesChanged');
    this.checkComplete();
  }

  public get samples() {
    return this._samples;
  }

  public setHandle(handle: ISourceHandle | null) {
    this._sourceHandle = handle;
    this.fire('handleStartedFinished');
  }

  public updateHandle(handle: ISourceHandle) {
    this._sourceHandle = handle;
    this.fire('handleMoved');
  }

  public get sourceHandle() {
    return this._sourceHandle;
  }

  private checkComplete() {
    if (this.samples.every((value) => value.isComplete)) {
      this.fire('ready');
    }
  }

  private fire(event: StateEvent) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.forEach((v) => v());
    }
  }
}

const state = new State();
export default state;
