/**
 * Auto-bind methods to an instance.
 *
 * @param  {Object}               instance          The instance.
 * @param  {Object}               options           Specify methods to include or exlude.
 * @param  {Array<String|RegExp>} [options.include] Methods to include.
 * @param  {Array<String|RegExp>} [options.exclude] Methods to exclude.
 * @return {Object}                                 The instance.
 */
export default function autoBind(instance: any, options: {
    include: Array<string | RegExp>;
    exclude: Array<string | RegExp>;
}): any;
