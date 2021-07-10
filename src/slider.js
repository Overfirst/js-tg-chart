import { css, boundaries, toCoords, line } from "./utils";

const HEIGHT = 40;
const DPI_HEIGHT = HEIGHT * 2;

export function sliderChart(root, data, DPI_WIDTH) {
  const WIDTH = DPI_WIDTH / 2;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = DPI_WIDTH;
  canvas.height = DPI_HEIGHT;

  css(canvas, {
    width: WIDTH + 'px',
    height: HEIGHT + 'px'
  });

  const [yMin, yMax] = boundaries(data);
  const xRatio = DPI_WIDTH / (data.columns[0].length - 2);
  const yRatio = DPI_HEIGHT / (yMax - yMin);
  
  const yData = data.columns.filter(col => data.types[col[0]] === 'line');
   
  yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, -5)).forEach((points, index) => {
    const color = data.colors[yData[index][0]];
    line(ctx, points, { color });
  });
}