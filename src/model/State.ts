import { InstrumentManager } from './managers/InstrumentManager';
import { TimeLineManager } from './managers/TimeLineManager';
import { ContextManager } from './managers/ContextManager';
import { SampleManager } from './managers/SampleManager';
import { SourceManager } from './managers/SourceManager';

/**
 * Class for storing all states
 */
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

  public get contextManager(): ContextManager {
    return this._contextManager;
  }

  public get sourceManager(): SourceManager {
    return this._sourceManager;
  }

  public get sampleManager(): SampleManager {
    return this._sampleManager;
  }

  public get instrumentManager(): InstrumentManager {
    return this._instrumentManager;
  }

  public get timelineManager(): TimeLineManager {
    return this._timeLineManager;
  }
}
/**
 * Singleton state for all application
 */
const state = new State();
export default state;
