import { delegateToSchema } from '@graphql-tools/delegate';
import { Resolver, Query, Context, Info } from '@nestjs/graphql';
import { Country } from './models/country.model';
import fetch from 'cross-fetch';
import { OperationTypeNode, print } from 'graphql';
import { introspectSchema, wrapSchema } from '@graphql-tools/wrap';
import { AsyncExecutor } from '@graphql-tools/utils';
import { AddFieldToDelegatedRequest } from './transform';
@Resolver(() => Country)
export class CountryResolver {
  @Query(() => [Country])
  async allCountries(@Context() context, @Info() info): Promise<Country[]> {
    const executor: AsyncExecutor = async ({ document, variables }) => {
      const query = print(document);
      const fetchResult = await fetch('https://countries.trevorblades.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });
      return fetchResult.json();
    };
    const schema = await introspectSchema(executor);
    const result = await delegateToSchema({
      schema: wrapSchema({
        schema,
        transforms: [new AddFieldToDelegatedRequest(schema, 'Country', 'code')],
        executor,
      }),
      operation: OperationTypeNode.QUERY,
      fieldName: 'countries',
      args: {},
      context,
      info,
    });

    console.log('result:', result[0]);
    //want to do some mapping here with country.code even if the user didn't request it.
    // for example. maybe expose a field called codeStartsWithA. and i want the user to be able to query it without having to query code as well.
    return result;
  }
}
