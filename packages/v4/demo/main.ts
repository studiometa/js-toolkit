import { registerComponents } from '../src/index.js';
import { Accordion } from './components/Accordion.js';
import { Reveal } from './components/Reveal.js';
import { Slider } from './components/Slider.js';
import { TodoList } from './components/TodoList.js';

// One call: each parent registers its `config.components` recursively,
// every registered name auto-mounts through the single MutationObserver.
registerComponents(Accordion, Slider, TodoList, Reveal);
