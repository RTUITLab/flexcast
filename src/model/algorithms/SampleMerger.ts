import { Beats } from '@/model/stuff/Beats';
import { Sample } from '@/model/stuff/Sample';

/**
 * Class for merging samples
 */
export class SampleMerger {
  /**
   * Method for merging samples. Calculate best merge offset using beats information
   */
  public static mergeSamples(samples: Sample[], matchLevel: number = 5): void {
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
    for (let i = beats1.tail.length - count; i >= 0; --i) {
      const fromTail = beats1.tail.slice(i, i + count);
      const tailBegin = fromTail[0];
      const tailEnd = fromTail[fromTail.length - 1];
      const tailBPM = fromTail.length / (tailEnd - tailBegin);

      for (let j = beats2.head.length - count; j >= 0; --j) {
        const fromHead = beats2.head.slice(j, j + count);
        const headBegin = fromHead[0];
        const headEnd = fromHead[fromHead.length - 1];
        const headBPM = fromHead.length / (headEnd - headBegin);

        const delta = Math.abs(headBPM - tailBPM);

        if (bestDelta === Number.MAX_VALUE || delta < bestDelta) {
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
