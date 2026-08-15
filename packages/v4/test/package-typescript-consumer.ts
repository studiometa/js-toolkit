import {
  watchAttributes as rootWatchAttributes,
  type AttributeChange as RootAttributeChange,
  type AttributeWatcher as RootAttributeWatcher,
} from '@studiometa/js-toolkit-v4';
import subpathWatchAttributes, {
  watchAttributes as namedSubpathWatchAttributes,
  type AttributeChange as SubpathAttributeChange,
  type AttributeWatcher as SubpathAttributeWatcher,
} from '@studiometa/js-toolkit-v4/watchAttributes';

const rootSignature: typeof rootWatchAttributes = namedSubpathWatchAttributes;
const namedSubpathSignature: typeof namedSubpathWatchAttributes = rootWatchAttributes;
const defaultSubpathSignature: typeof subpathWatchAttributes = rootWatchAttributes;

const subpathChange: SubpathAttributeChange = {
  name: 'data-packed-watch',
  value: 'one',
  previousValue: null,
};
const rootChange: RootAttributeChange = subpathChange;
const roundTripChange: SubpathAttributeChange = rootChange;

const rootWatcher: RootAttributeWatcher = (change) => {
  const compatibleChange: SubpathAttributeChange = change;
  void compatibleChange;
};
const subpathWatcher: SubpathAttributeWatcher = rootWatcher;
const roundTripWatcher: RootAttributeWatcher = subpathWatcher;

void [
  rootSignature,
  namedSubpathSignature,
  defaultSubpathSignature,
  roundTripChange,
  roundTripWatcher,
];
