/**
 * Class with functions for generating transitions
 */
export class Transition {

  /**
   * Generate exponential values up
   * @param start Start of exponent function
   * @param current Current value
   * @param duration Duration for generation
   */
  public static generateExponentialIn(
    start: number,
    current: number,
    duration: number
  ): number[] {
    const N = 50;
    const step = duration / N;

    return Array.from(Array(N + 1).keys())
      .map((x) => x * step)
      .filter((x) => x + start >= current)
      .map((x) => {
        const t = ((x - duration / 2) * 4 * Math.PI) / duration;
        return 1 / (1 + Math.pow(Math.E, -t));
      });
  }

  /**
   * Generate exponential values down
   * @param start Start of exponent function
   * @param current Current value
   * @param duration Duration for generation
   */
  public static generateExponentialOut(
    start: number,
    current: number,
    duration: number
  ): number[] {
    const N = 50;
    const step = duration / N;

    return Array.from(Array(N + 1).keys())
      .map((x) => x * step)
      .filter((x) => x + start >= current)
      .map((x) => {
        const t = ((x - duration / 2) * 4 * Math.PI) / duration;
        return 1 - 1 / (1 + Math.pow(Math.E, -t));
      });
  }
}
