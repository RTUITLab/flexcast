import { Sample } from './Sample';

export class SampleMerger {
  public static MergeSamples(samples: Sample[]) {
    if (samples.length < 2) {
      return;
    }

    for (let index = 1; index < samples.length; index++) {
      const prev = samples[index - 1];
      const element = samples[index];
      if (!prev.source.beats || !element.source.beats) {
        continue;
      }
      element.offset =
        prev.offset + prev.source.beats.tail[0] - element.source.beats.head[0];
    }
  }
}
