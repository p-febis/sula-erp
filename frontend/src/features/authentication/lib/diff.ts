type Diff<T> = {
  toAssociate: Set<T>;
  toDisassociate: Set<T>;
};

export function calculateDifference<T>(oldItems: T[], newItems: T[]): Diff<T> {
  const oldSet = new Set(oldItems);
  const newSet = new Set(newItems);

  return {
    toAssociate: newSet.difference(oldSet),
    toDisassociate: oldSet.difference(newSet),
  };
}
