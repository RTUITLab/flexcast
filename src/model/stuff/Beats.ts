/**
 * Data class for storing song beats
 */
export class Beats {
  constructor(
    /**
     * Head beats, from song beginning to some number of seconds
     */
    public head: number[],

    /**
     * Tail beats, from some seconds before and to end
     */
    public tail: number[]) {}
}
