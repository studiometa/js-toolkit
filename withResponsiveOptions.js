/**
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 * @typedef {import('../services/resize').ResizeServiceProps} ResizeServiceProps
 */

/**
 * Extends the configuration of an existing class.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @returns {T}
 */
export default function withResponsiveOptions(BaseClass) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Get responsive options.
     *
     * data-option-foo[xxs,xs,s]="foo"
     * data-option-foo[m,l]="bar"
     * data-option-foo="baz"
     *
     * @todo parse values like OptionsManager
     * @returns {any}
     */
    get $options() {
      const options = super.$options;
      const { breakpoint } = /** @type {ResizeServiceProps} */ (this.$services.get('resized'));
      const breakpointRegex = new RegExp(`\\[${breakpoint}|,${breakpoint},|,${breakpoint}\\]`);

      const datasetKeys = Object.keys(this.$el.dataset);
      Object.keys(options).forEach((optionName) => {
        const responsiveOptions = datasetKeys.filter(
          (key) => key.startsWith(optionName) && key !== optionName
        );
        if (responsiveOptions.length) {
          const finalOption = responsiveOptions.find((responsiveOptionName) =>
            breakpointRegex.test(responsiveOptionName)
          );
          options[optionName] = this.$el.dataset[finalOption];
        }
      });

      return options;
    }
  };
}
