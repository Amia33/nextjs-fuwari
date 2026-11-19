import { allSpecs } from "content-collections";

export function getSpec(name: string) {
  return allSpecs.find((doc) => doc._meta.path === name);
}
