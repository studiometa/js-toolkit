import OptionsManager from './OptionsManager.js';
import { useResize } from '../../services/index.js';

/**
 * @typedef {import('./OptionsManager.js').OptionObject} OptionObject
 * @typedef {OptionObject & { responsive?: boolean }} ResponsiveOptionObject
 */

/**
 * Class options to manage options as data attributes on an HTML element.
 */
export default class ResponsiveOptionsManager extends OptionsManager {
  /**
   * Get an option value.
   *
   * @param   {string} name The option name.
   * @param   {ResponsiveOptionObject} config The option configuration.
   * @returns {any}
   */
  get(name, config) {
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
  set(name, value, config) {
    if (!config.responsive) {
      super.set(name, value, config);
      return;
    }

    super.set(this.__getResponsiveName(name), value, config);
  }

  /**
   * Get the currently active responsive name of an option.
   *
   * @param   {string} name The default name of the option.
   * @returns {string}      The responsive name if one matches the current breakpoint, the default name otherwise.
   */
  __getResponsiveName(name) {
    const { breakpoint } = useResize().props();

    if (!breakpoint) {
      return name;
    }

    let responsiveName = name;
    const propertyName = ResponsiveOptionsManager.__getPropertyName(name);
    const regex = new RegExp(`${propertyName}\\[(.+)\\]$`);

    Object.keys(this.__element.dataset)
      .filter((optionName) => regex.test(optionName))
      .forEach((optionName) => {
        const [, breakpoints] = optionName.match(regex);
        const isInBreakpoint = breakpoints.split(',').includes(breakpoint);
        if (isInBreakpoint) {
          responsiveName = optionName.replace(/^option/, '');
        }
      });

    return responsiveName;
  }
}
