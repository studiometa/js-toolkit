import type { Base } from '@studiometa/js-toolkit';

export async function mount(...components: Base[]) {
  await Promise.all(components.map((component) => component.$mount()));
}

export async function destroy(...components: Base[]) {
  await Promise.all(components.map((component) => component.$destroy()));
}
