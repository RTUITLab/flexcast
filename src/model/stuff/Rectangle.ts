/**
 * Interface for presenting one rectangle of song(TimeLine)
 */
export interface IRectangle {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
}

/**
 * Class Rectangle, presents 2D rectangle
 */
export class Rectangle implements IRectangle {

  public get offsetRight(): number {
    return this.offsetLeft + this.width;
  }

  public get offsetBottom(): number {
    return this.offsetTop + this.height;
  }
  public offsetTop: number = 0;
  public offsetLeft: number = 0;
  public width: number = 0;
  public height: number = 0;

  constructor(data?: IRectangle) {
    if (data == null) {
      return;
    }

    this.offsetTop = data.offsetTop;
    this.offsetLeft = data.offsetLeft;
    this.width = data.width;
    this.height = data.height;
  }


  /**
   * Find intersection between that rectangle and another
   * @param other other Rectangle for finding intersection
   * @returns Rectangle of intersection or null, if intersection was not found
   */
  public findIntersection(other: Rectangle): Rectangle | null {
    if (
      other.offsetLeft >= this.offsetRight ||
      other.offsetRight <= this.offsetLeft ||
      other.offsetBottom >= this.offsetTop ||
      other.offsetTop <= this.offsetLeft
    ) {
      return null;
    }

    const left = Math.max(this.offsetLeft, other.offsetLeft);
    const right = Math.min(this.offsetRight, other.offsetRight);
    const top = Math.max(this.offsetTop, other.offsetTop);
    const bottom = Math.min(this.offsetBottom, other.offsetBottom);

    return new Rectangle({
      offsetLeft: left,
      offsetTop: top,
      width: right - left,
      height: top - bottom
    });
  }

  /**
   * Find intersection between that rectangle and another in horizontal projection
   * @param other other Rectangle for finding intersection
   * @returns Rectangle of intersection or null, if intersection was not found
   */
  public findHorizontalIntersection(other: Rectangle): Rectangle | undefined {
    if (
      other.offsetLeft >= this.offsetRight ||
      other.offsetRight <= this.offsetLeft
    ) {
      return;
    }

    const left = Math.max(this.offsetLeft, other.offsetLeft);
    const right = Math.min(this.offsetRight, other.offsetRight);

    return new Rectangle({
      offsetLeft: left,
      offsetTop: other.offsetTop,
      width: right - left,
      height: other.height
    });
  }
  /**
   * Find intersection between that rectangle and another in horizontal projection
   * @param other other Rectangle for finding intersection
   * @returns Rectangle of intersection or null, if intersection was not found
   */
  public findVerticalIntersection(other: Rectangle): Rectangle | undefined {
    if (
      other.offsetBottom >= this.offsetTop ||
      other.offsetTop <= this.offsetLeft
    ) {
      return;
    }

    const top = Math.max(this.offsetTop, other.offsetTop);
    const bottom = Math.min(this.offsetBottom, other.offsetBottom);

    return new Rectangle({
      offsetLeft: other.offsetLeft,
      offsetTop: top,
      width: other.width,
      height: top - bottom
    });
  }
}
