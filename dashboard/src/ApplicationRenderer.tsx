import { render } from 'react-dom';
import 'uikit';

import './dashboard.scss';
import { Dashboard } from './Dashboard';

const container: HTMLElement = document.createElement('application');
container.className = 'application flexContainer flexColumn';
document.body.appendChild(container);

render(<Dashboard />, container);
