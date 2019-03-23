import { Beats } from './Analyzer';

let CURRENT_ID: number = 0;

export type SourceState = 'analyzing' | 'complete';

export interface ISource {
  url: string;
  data: AudioBuffer;
  state: SourceState;
  beats?: Beats;
}

export interface ISourceHandle {
  source: ISource;
  pageX: number;
  pageY: number;
}

export interface ISample {
  id: number;
  source: ISource;
  offset: number;
  duration: number;
}

export class Sample implements ISample {
  public id: number;
  public source: ISource;
  public offset: number;
  public duration: number = 0;

  constructor(source: ISource, offset: number) {
    this.id = CURRENT_ID++;
    this.source = source;
    this.offset = offset;
  }

  get isComplete() {
    return this.duration > 0;
  }
}
