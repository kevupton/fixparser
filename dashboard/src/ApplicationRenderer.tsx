import { render } from 'react-dom';
import * as UIkit from 'uikit';
import * as Icons from 'uikit/dist/js/uikit-icons';

import './dashboard.scss';
import { Dashboard } from './Dashboard';

UIkit.use(Icons);

const container: HTMLElement = document.createElement('application');
container.className = 'application flexContainer flexColumn';
document.body.appendChild(container);

render(<Dashboard />, container);
