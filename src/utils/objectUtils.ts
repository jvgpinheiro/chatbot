export function mergeSets<T>(...sets: Array<Set<T>>): Set<T> {
  const merged = new Set<T>();
  sets.forEach((set) => {
    set && set.forEach((value) => merged.add(value));
  });
  return merged;
}
