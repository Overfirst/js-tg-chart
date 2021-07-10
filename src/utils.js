export function toDate(timestamp) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const date = new Date(timestamp);
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function line(ctx, points, { color }) {
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;

  for (const [x, y] of points) {
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.closePath();
}

export function circle(ctx, [x, y], color) {
  const CIRCLE_RADIUS = 8;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = '#fff'
  ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

export function isOver(mouse, x, length, dWidth) {
  if (!mouse) {
    return false;
  }

  const width = dWidth / length;
  return Math.abs(x - mouse.x) < width / 2;
}

export function boundaries({ columns, types }) {
  let min;
  let max;

  columns.forEach(col => {
    if (types[col[0]] !== 'line') {
      return;
    }

    if (typeof min !== 'number') min = col[1];
    if (typeof max !== 'number') max = col[1];

    if (min > col[1]) min = col[1];
    if (max < col[1]) max = col[1];

    for (let i = 2; i < col.length; i++) {
      if (min > col[i]) min = col[i];
      if (max < col[i]) max = col[i];
    }
  });

  return [min, max];
}

export function css(element, styles = {}) {
  Object.assign(element.style, styles);
}

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING) {
  return (col) => col.map((y, index) => [
    Math.floor((index - 1) * xRatio),
    Math.floor(DPI_HEIGHT - PADDING - y * yRatio)
  ])
  .filter((_, index) => index !== 0);
}