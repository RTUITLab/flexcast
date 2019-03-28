import { Beats } from './Beats';

/**
 * Wrapper for song
 */
export class Source {
  /**
   * @property name of song file
   */
  public name: string
;
  /**
   * Decoded data of song
   */
  public data: AudioBuffer;

  /**
   * Beats of source, can be null while calculating
   */
  public beats?: Beats;

  constructor(name: string, data: AudioBuffer) {
    this.name = name;
    this.data = data;
  }
}
