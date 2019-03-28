import { Source } from './Source';

let CURRENT_ID = 0;
/**
 * Data class for store information about Sample
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
   * Offset of sample
   */
  public offset: number = 0;
  /**
   * Duration of sample
   */
  public duration: number = 0;

  /**
   * Offset of fade in
   */
  public fadeInOffset: number = 0;
  /**
   * Duration of fade in
   */
  public fadeInDuration: number = 0;
  /**
   * Offset of fade out
   */
  public fadeOutDuration: number = 0;
  /**
   * Duration of fade in
   */
  public fadeOutOffset: number = 0;
  /**
   * Is sample played completed
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
