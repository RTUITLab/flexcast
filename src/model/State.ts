import { InstrumentManager } from './managers/InstrumentManager';
import { TimeLineManager } from './managers/TimeLineManager';
import { ContextManager } from './managers/ContextManager';
import { SampleManager } from './managers/SampleManager';
import { SourceManager } from './managers/SourceManager';

export class State {
  private _contextManager: ContextManager;
  private _sourceManager: SourceManager;
  private _sampleManager: SampleManager;
  private _instrumentManager: InstrumentManager;

  private _timeLineManager: TimeLineManager;

  constructor() {
    this._contextManager = new ContextManager();
    this._sourceManager = new SourceManager(this._contextManager);
    this._sampleManager = new SampleManager();
    this._instrumentManager = new InstrumentManager();

    this._timeLineManager = new TimeLineManager(this._sampleManager);
  }

  public get contextManager() {
    return this._contextManager;
  }

  public get sourceManager() {
    return this._sourceManager;
  }

  public get sampleManager() {
    return this._sampleManager;
  }

  public get instrumentManager() {
    return this._instrumentManager;
  }

  public get timelineManager() {
    return this._timeLineManager;
  }
}

const state = new State();
export default state;
