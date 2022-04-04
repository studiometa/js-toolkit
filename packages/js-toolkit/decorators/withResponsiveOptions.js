import ResponsiveOptionsManager from '../Base/managers/ResponsiveOptionsManager.js';

/**
 * Extends the configuration of an existing class.
 *
 * @template {import('../Base').BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @returns {T}
 */
export default function withResponsiveOptions(BaseClass) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Get managers.
     *
     * @returns {import('../Base/index.js').Managers}
     */
    get $managers() {
      return {
        ...super.$managers,
        OptionsManager: ResponsiveOptionsManager,
      };
    }
  };
}
