export const up = async () => {
  // A migration with this name was executed on staging, and then subsequently deleted (to not execute on production)
  // so staging expects it to exist and throws an error if it doesn't.
};

export const down = async () => {};
