import { chart } from "./chart";
import { getChartData } from './data';
import './styles.scss';

const ch = chart(document.querySelector('#chart'), getChartData());
ch.init();