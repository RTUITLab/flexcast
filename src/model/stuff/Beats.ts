/**
 * Data class for stora beats for song
 */
export class Beats {
  constructor(
    /**
     * Head beats, from song begin to some number of seconds
     */
    public head: number[],
    /**
     * Tail beats, from some seconds before and to end
     */
    public tail: number[]) {}
}
