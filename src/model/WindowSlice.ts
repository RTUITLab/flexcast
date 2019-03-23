export interface IWindowSlice {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
}

export function contains(
  data: IWindowSlice,
  offsetLeft: number,
  width: number
): { left: number; width: number } | undefined {
  if (
    offsetLeft >= data.offsetLeft + data.width ||
    offsetLeft + width <= data.offsetLeft
  ) {
    return;
  }

  const left = Math.max(data.offsetLeft, offsetLeft);
  const right = Math.min(data.offsetLeft + data.width, offsetLeft + width);

  return {
    left,
    width: right - left
  };
}
