import * as cardinal from '@journeyapps-platform/types-cardinal';

export const reduceValidStatements = (policies: cardinal.RawPolicy[], actions: string[], model: string) => {
  return policies.reduce((statements: cardinal.PolicyStatement[], policy) => {
    return policy.statements.reduce((statements, statement) => {
      if (!actions.some((a) => cardinal.compareWithWildcards(statement.actions, a))) {
        return statements;
      }

      if (!statement.resources.some((resource) => cardinal.compareWithWildcards(resource.selector.model, model))) {
        return statements;
      }

      statements.push(statement);

      return statements;
    }, statements);
  }, []);
};
