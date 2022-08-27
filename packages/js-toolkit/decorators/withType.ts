import type { Base, BaseTypeParameter, BaseConstructor } from '../Base/index.js';

export default function withType<
  T extends BaseConstructor<Base>,
  U extends BaseTypeParameter = BaseTypeParameter
>(BaseClass: T) {
  return BaseClass as T & BaseConstructor<Base<U>> & Pick<typeof Base, keyof typeof Base>;
}
