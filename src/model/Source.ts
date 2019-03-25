import { Beats } from './Beats';

export class Source {
  public name: string;
  public data: AudioBuffer;

  public beats?: Beats;

  constructor(name: string, data: AudioBuffer) {
    this.name = name;
    this.data = data;
  }
}
