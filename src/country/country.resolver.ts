import { delegateToSchema } from '@graphql-tools/delegate';
import { Resolver, Query, Context, Info } from '@nestjs/graphql';
import { Country } from './models/country.model';
import fetch from 'cross-fetch';
import { GraphQLResolveInfo, OperationTypeNode, print } from 'graphql';
import { introspectSchema, wrapSchema } from '@graphql-tools/wrap';
import { AsyncExecutor } from '@graphql-tools/utils';
import { AddFieldToDelegatedRequest } from './transform';
@Resolver(() => Country)
export class CountryResolver {
  @Query(() => [Country])
  async allCountries(
    @Context() context,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Country[]> {
    const executor: AsyncExecutor = async ({ document, variables }) => {
      const query = print(document);
      const fetchResult = await fetch('http://localhost:3001/graphql', {
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
        executor,
      }),
      operation: OperationTypeNode.QUERY,
      fieldName: 'countries',
      args: {},
      context,
      info,
      transforms: [new AddFieldToDelegatedRequest(schema, 'Country', 'code')],
    });

    console.log('result:', result);
    (result[0] as Country).startsWithA = (result[0].code as string).startsWith(
      'A',
    );
    return result;
  }
}
