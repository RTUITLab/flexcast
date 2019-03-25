import { SampleMerger } from './SampleMerger';
import { Sample } from './Sample';

import bus from './Bus';

export class SampleManager {
  private _samples: Sample[] = [];

  private _maxTime: number = 0;

  public mergeSamples() {
    SampleMerger.mergeSamples(this._samples);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  public addSample(sample: Sample) {
    this._samples.push(sample);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  public updateSample(sample: Sample) {
    const index = this._samples.findIndex((value) => value.id === sample.id);

    if (index < 0) {
      return;
    }

    this._samples[index] = sample;

    this.updateTime();
    bus.fire('samplesChanged');
  }

  public removeSample(sample: Sample) {
    const index = this._samples.findIndex((value) => value.id === sample.id);

    if (index < 0) {
      return;
    }

    this._samples.splice(index, 1);

    this.updateTime();
    bus.fire('samplesChanged');
  }

  public get samples() {
    return this._samples;
  }

  private updateTime() {
    this._maxTime =
      this._samples.reduce((max, c) => {
        const end = c.offset + c.duration;
        return end > max ? end : max;
      }, 0) * 1000;
  }

  public get maxTime() {
    return this._maxTime;
  }
}
