export type Features = Record<'asyncChildren', boolean>;

export const features = new Map<keyof Features, boolean>([['asyncChildren', false]]);
