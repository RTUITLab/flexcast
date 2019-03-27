export class Transition {
  public static generateExponentialIn(
    start: number,
    current: number,
    duration: number
  ) {
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

  public static generateExponentialOut(
    start: number,
    current: number,
    duration: number
  ) {
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
