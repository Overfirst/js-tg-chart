import { tooltip } from './tooltip';
import { toDate, line, circle, isOver, boundaries, css, toCoords, computeYRatio, computeXRatio } from './utils'
import { sliderChart } from './slider';

const PADDING = 40;

const WIDTH = 600;
const DPI_WIDTH = WIDTH * 2;
const VIEW_WIDTH = DPI_WIDTH;

const HEIGHT = 200;
const DPI_HEIGHT = HEIGHT * 2;
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2

const ROWS_COUNT = 5;


export function chart(root, data) {
  let raf;

  const canvas = root.querySelector('[data-el="main"]');
  const tip = tooltip(root.querySelector('[data-el="tooltip"]'));
  const slider = sliderChart(root.querySelector('[data-el="slider"]'), data, DPI_WIDTH);

  canvas.width = DPI_WIDTH;
  canvas.height = DPI_HEIGHT;

  css(canvas, {
    width: WIDTH + 'px',
    height: HEIGHT + 'px'
  });

  const ctx = canvas.getContext('2d');

  const proxy = new Proxy({}, {
    set(...args) {
      const result = Reflect.set(...args);
      raf = requestAnimationFrame(paint);
      return result;
    }
  });

  slider.subscribe(position => {
    proxy.position = position;
  });

  canvas.addEventListener('mousemove', mousemove);
  canvas.addEventListener('mouseleave', mouseleave);

  function clear() {
    ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT);
  }

  function paint() {
    clear();

    const length = data.columns[0].length;

    const leftIndex = Math.round(length * proxy.position[0] / 100);
    const rightIndex = Math.round(length * proxy.position[1] / 100);

    const columns = data.columns.map(col => {
      const result = col.slice(leftIndex, rightIndex);
      if (typeof result[0] !== 'string') {
        result.unshift(col[0]);
      }
      return result;
    });

    const [yMin, yMax] = boundaries({columns, types: data.types});

    const xRatio = computeXRatio(VIEW_WIDTH, columns[0].length);
    const yRatio = computeYRatio(VIEW_HEIGHT, yMax, yMin);

    const xData = columns.filter(col => data.types[col[0]] !== 'line')[0];
    const yData = columns.filter(col => data.types[col[0]] === 'line');
     
    yAxis(yMin, yMax);
    xAxis(xData, yData, xRatio);
  
    yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin)).forEach((points, index) => {
      const color = data.colors[yData[index][0]];
      line(ctx, points, { color });

      for (const [x, y] of points) {
        if (isOver(proxy.mouse, x, points.length, DPI_WIDTH)) {
          circle(ctx, [x, y], color);
          break;
        }
      }
    });
  }

  function mousemove({ clientX, clientY }) {
    const { left, top } = canvas.getBoundingClientRect();
    proxy.mouse = {
      x: (clientX - left) * 2,
      tooltip: {
        left: clientX - left,
        top: clientY - top
      }
    };
  }

  function mouseleave() {
    proxy.mouse = null;
    tip.hide();
  }

  function xAxis(xData, yData, xRatio) {
    const colsCount = 6;
    const step = Math.round(xData.length / colsCount);
    ctx.beginPath();
    for (let i = 1; i < xData.length; i++) {
      const x = i * xRatio;
  
      if ((i - 1) % step === 0) {
        const text = toDate(xData[i]);
        ctx.fillText(text.toString(), x, DPI_HEIGHT - 10);
      }
      
      if (isOver(proxy.mouse, x, xData.length, DPI_WIDTH)) {
        ctx.save();
        ctx.moveTo(x, PADDING / 2);
        ctx.lineTo(x, DPI_HEIGHT - PADDING);
        ctx.stroke();
        ctx.restore();

        tip.show(proxy.mouse.tooltip, {
          title: toDate(xData[i]),
          items: yData.map(col => ({
            color: data.colors[col[0]],
            name: data.names[col[0]],
            value: col[i + 1]
          }))
        });
      }
    }
    ctx.closePath();
  }

  function yAxis(yMin, yMax) {
    const step = VIEW_HEIGHT / ROWS_COUNT;
    const textStep = (yMax - yMin) / ROWS_COUNT;
  
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#bbb';
    ctx.font = 'normal 24px Helvetcica, sans-serif'
    ctx.fillStyle = '#96a2aa';
  
    for (let i = 1; i <= ROWS_COUNT; i++) {
      const y = step * i;
      const text = Math.round(yMax - textStep * i);
  
      ctx.fillText(text, 5, y + PADDING - 10)
      ctx.moveTo(0, y + PADDING);
      ctx.lineTo(DPI_WIDTH, y + PADDING);
    }
  
    ctx.stroke();
    ctx.closePath();
  }

  return {
    init() {
      paint();
    },
    destroy() {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', mousemove);
      canvas.removeEventListener('mouseleave', mouseleave);
    }
  };
}