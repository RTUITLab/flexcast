import { Beats } from '@/model/stuff/Beats';
import { Sample } from '@/model/stuff/Sample';

/**
 * Class for merging samples
 */
export class SampleMerger {
  /**
   * Method for merging samples, calculate best merge offset, using beats information
   * @param samples Samples for merge
   * @param matchLevel Level of matching, how much beats will be used
   */
  public static mergeSamples(samples: Sample[], matchLevel: number = 5): void {
    // If want to merge less then 2 samples
    if (samples.length < 2) {
      return;
    }

    // Iterate on all samples from second to last
    for (let index = 1; index < samples.length; index++) {
      // Previous sample (first item on first iteration)
      const prev = samples[index - 1];
      // Current sample (second item on first iteration)
      const element = samples[index];
      // If one of the samples doesn't have beats
      if (!prev.source.beats || !element.source.beats) {
        continue;
      }

      // Find best match for current pair of samples
      const bestMatch = SampleMerger.findSimilar(
        matchLevel,
        prev.source.beats,
        element.source.beats
      );

      // Find middle point in best beats in tail of previous sample
      const firstMiddle =
        (prev.source.beats.tail[bestMatch.tail] +
          prev.source.beats.tail[bestMatch.tail + matchLevel - 1]) /
        2;
      // Find middle point in best beats in head of current sample
      const secondMiddle =
        (element.source.beats.head[bestMatch.head] +
          element.source.beats.head[bestMatch.head + matchLevel - 1]) /
        2;
      // Move current sample to target position after previous sample
      element.offset = prev.offset + firstMiddle - secondMiddle;

      // Calc fade out duration for previous sample
      prev.fadeOutDuration =
        prev.source.beats.tail[bestMatch.tail + matchLevel - 1] -
        prev.source.beats.tail[bestMatch.tail];

      // Calc fade out offset for previous sample
      prev.fadeOutOffset =
        prev.duration - prev.source.beats.tail[bestMatch.tail + matchLevel - 1];

      // Calc fade in duration for previous sample
      element.fadeInDuration =
        element.source.beats.head[bestMatch.head + matchLevel - 1] -
        element.source.beats.head[bestMatch.head];

      // Calc fade in offset for previous sample
      element.fadeInOffset = element.source.beats.head[bestMatch.head];
    }
  }

  /**
   * Find most similar beats sequence
   * @param count Level of matching, how much beats will be used to calculate BPM
   * @param beats1 Beats of first sample
   * @param beats2 Beats of second sample
   */
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

    // i - index of start sequence in first samples
    for (let i = beats1.tail.length - count; i >= 0; --i) {
      // Current beats range in first sample
      const fromTail = beats1.tail.slice(i, i + count);
      // Time offset of first beat in that sequence
      const tailBegin = fromTail[0];
      // Time offset of last beat in sequence
      const tailEnd = fromTail[fromTail.length - 1];
      // Calculate beats per second of range
      const tailBPS = fromTail.length / (tailEnd - tailBegin);

      // j - index of start sequence in second samples
      for (let j = beats2.head.length - count; j >= 0; --j) {
        // Beats range in second sample
        const fromHead = beats2.head.slice(j, j + count);
        // Time offset of first beat in that sequence
        const headBegin = fromHead[0];
        // Time offset of last beat in sequence
        const headEnd = fromHead[fromHead.length - 1];
        // Calculate beats per second of that range
        const headBPS = fromHead.length / (headEnd - headBegin);

        // Calculate delta between BPS
        const delta = Math.abs(headBPS - tailBPS);

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
  constructor(public tail: number, public head: number) { }
}
