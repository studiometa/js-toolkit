import { registerComponents } from '../src/index';
import { Accordion } from './components/Accordion';
import { Reveal } from './components/Reveal';
import { Slider } from './components/Slider';
import { TodoList } from './components/TodoList';

// One call: each parent registers its `config.components` recursively,
// every registered name auto-mounts through the single MutationObserver.
registerComponents(Accordion, Slider, TodoList, Reveal);
