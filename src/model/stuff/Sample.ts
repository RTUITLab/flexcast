import { Source } from './Source';

let CURRENT_ID = 0;

/**
 * Data class for storing Sample information
 */
export class Sample {
  /**
   * Unique id
   */
  public id: number;

  /**
   * Source of song
   */
  public source: Source;

  /**
   * Offset of sample in seconds
   */
  public offset: number = 0;

  /**
   * Duration of sample in seconds
   */
  public duration: number = 0;

  /**
   * Offset of fadein in seconds
   */
  public fadeInOffset: number = 0;
  /**
   * Duration of fadein in seconds
   */
  public fadeInDuration: number = 0;

  /**
   * Duration of fadeout in seconds
   */
  public fadeOutDuration: number = 0;

  /**
   * Offset of fadeout to end of sample in seconds
   */
  public fadeOutOffset: number = 0;

  /**
   * Is sample configured
   */
  get isComplete(): boolean {
    return this.duration > 0;
  }

  /**
   * Create sample with 0 offset with source
   * @param source Source of new sample
   */
  constructor(source: Source) {
    this.id = CURRENT_ID++;
    this.source = source;
  }
}
