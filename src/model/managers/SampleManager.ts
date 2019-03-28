import { Sample } from '@/model/stuff/Sample';
import bus from '@/model/Bus';

import { SampleMerger } from '@/model/algorithms/SampleMerger';

/**
 * Class for managing samples(songs) on timeline
 */
export class SampleManager {
  private _samples: Sample[] = [];

  private _maxTime: number = 0;

  /**
   * Merge samples, added to TimeLine
   */
  public mergeSamples(): void {
    SampleMerger.mergeSamples(this._samples);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  /**
   * Add sample to TimeLine
   * @param sample sample for saving
   */
  public addSample(sample: Sample): void {
    this._samples.push(sample);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  /**
   * Update and correct sample
   * @param sample sample for updating
   */
  public updateSample(sample: Sample): void {
    const index = this._samples.findIndex((value) => value.id === sample.id);

    if (index < 0) {
      return;
    }

    sample.offset = Math.max(sample.offset, 0);

    this._samples[index] = sample;

    this.updateTime();
    bus.fire('samplesChanged');
  }

  /**
   * Remove sample
   * @param sample sample to remove
   */
  public removeSample(sample: Sample): void {
    const index = this._samples.findIndex((value) => value.id === sample.id);

    if (index < 0) {
      return;
    }

    this._samples.splice(index, 1);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  /**
   * Return all samples
   */
  public get samples(): Sample[] {
    return this._samples;
  }

  /**
   * Update general time on TimeLine
   */
  private updateTime(): void {
    this._maxTime = this._samples.reduce((max, c) => {
      const end = c.offset + c.duration;
      return end > max ? end : max;
    }, 0);
  }

  /**
   * Get max time of TimeLine
   */
  public get maxTime(): number {
    return this._maxTime;
  }
}
