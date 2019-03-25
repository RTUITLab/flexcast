import { Beats } from './Beats';
import { Sample } from './Sample';

export class SampleMerger {
  public static mergeSamples(samples: Sample[], matchLevel: number = 5) {
    if (samples.length < 2) {
      return;
    }

    for (let index = 1; index < samples.length; index++) {
      const prev = samples[index - 1];
      const element = samples[index];
      if (!prev.source.beats || !element.source.beats) {
        continue;
      }

      const bestMatch = SampleMerger.findSimilar(
        matchLevel,
        prev.source.beats,
        element.source.beats
      );

      const firstMiddle =
        (prev.source.beats.tail[bestMatch.tail] +
          prev.source.beats.tail[bestMatch.tail + matchLevel - 1]) /
        2;
      const secondMiddle =
        (element.source.beats.head[bestMatch.head] +
          element.source.beats.head[bestMatch.head + matchLevel - 1]) /
        2;
      element.offset = prev.offset + firstMiddle - secondMiddle;

      prev.fadeOutDuration =
        prev.source.beats.tail[bestMatch.tail + matchLevel - 1] -
        prev.source.beats.tail[bestMatch.tail];

      prev.fadeOutOffset =
        prev.duration - prev.source.beats.tail[bestMatch.tail + matchLevel - 1];

      element.fadeInDuration =
        element.source.beats.head[bestMatch.head + matchLevel - 1] -
        element.source.beats.head[bestMatch.head];

      element.fadeInOffset = element.source.beats.head[bestMatch.head];
    }
  }

  private static findSimilar(
    count: number,
    beats1: Beats,
    beats2: Beats
  ): BestBeats {
    if (count > beats1.tail.length || count > beats2.head.length) {
      return new BestBeats(0, 0);
    }

    let bestTail = 0;
    let bestHead = 0;
    let bestDelta = Number.MAX_VALUE;
    for (let i = 0; i < beats1.tail.length - count + 1; i++) {
      const fromTail = beats1.tail.slice(i, i + count);

      for (let j = 0; j < beats2.head.length - count + 1; j++) {
        const fromHead = beats2.head.slice(j, j + count);
        let delta = 0;

        for (let index = 0; index < count; index++) {
          delta += Math.abs(fromTail[index] - fromHead[index]);
        }

        if (delta < bestDelta) {
          bestDelta = delta;
          bestTail = i;
          bestHead = j;
        }
      }
    }
    return new BestBeats(bestTail, bestHead);
  }
}

class BestBeats {
  constructor(public tail: number, public head: number) {}
}
