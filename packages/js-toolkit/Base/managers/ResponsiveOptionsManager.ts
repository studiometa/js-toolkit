import { OptionsManager, __getPropertyName } from './OptionsManager.js';
import type { OptionObject } from './OptionsManager.js';
import { useResize } from '../../services/index.js';
import { isDev } from '../../utils/index.js';
import { features } from '../features.js';

export type ResponsiveOptionObject = OptionObject & { responsive?: boolean };

/**
 * Class options to manage options as data attributes on an HTML element.
 */
export class ResponsiveOptionsManager<T> extends OptionsManager<T> {
  /**
   * Get an option value.
   *
   * @param   {string} name The option name.
   * @param   {ResponsiveOptionObject} config The option configuration.
   * @returns {any}
   */
  get(name: string, config: ResponsiveOptionObject) {
    if (!config.responsive) {
      return super.get(name, config);
    }

    return super.get(this.__getResponsiveName(name), config);
  }

  /**
   * Set an option value.
   *
   * @param {string} name The option name.
   * @param {any} value The new value.
   * @param {ResponsiveOptionObject} config The option configuration.
   */
  set(name: string, value: unknown, config: ResponsiveOptionObject) {
    if (!config.responsive) {
      super.set(name, value, config);
      return;
    }

    if (isDev) {
      console.warn(`[${this.__base.$id}]`, 'Responsive options are read-only.');
    }
  }

  /**
   * Get the currently active responsive name of an option.
   *
   * @param   {ResponsiveOptionsManager} that
   * @param   {string} name The default name of the option.
   * @returns {string}      The responsive name if one matches the current breakpoint, the default name otherwise.
   */
  __getResponsiveName(name: string) {
    const { breakpoint } = useResize().props();

    if (!breakpoint) {
      return name;
    }

    let responsiveName = name;
    const propertyName = __getPropertyName(name).toLowerCase();
    const regex = new RegExp(`${propertyName}:(.+)$`, 'i');
    const attributes = features.get('attributes');
    const dataOptionRegExp = new RegExp(`^${attributes.option}-`);

    for (const optionName of this.__element.getAttributeNames()) {
      if (regex.test(optionName)) {
        const [, breakpoints] = optionName.match(regex);
        const isInBreakpoint = breakpoints.split(':').includes(breakpoint);
        if (isInBreakpoint) {
          responsiveName = optionName.replace(dataOptionRegExp, '');
        }
      }
    }

    return responsiveName;
  }
}
