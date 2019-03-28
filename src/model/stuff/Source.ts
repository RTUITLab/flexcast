import { Beats } from './Beats';
/**
 * Wrapper for song
 */
export class Source {
  /**
   * @property name of song file
   */
  public name: string;
  /**
   * dedoded data of song
   */
  public data: AudioBuffer;

  public beats?: Beats;

  constructor(name: string, data: AudioBuffer) {
    this.name = name;
    this.data = data;
  }
}
