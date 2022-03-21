import { Transform } from '@graphql-tools/delegate';
import { TransformConfig } from './custumFieldMapping.config';
import { visit, Kind, visitWithTypeInfo, TypeInfo, FieldNode } from 'graphql';

export class AddFieldToDelegatedRequest<T extends object> implements Transform {
  schema;
  typeName: string;
  config: TransformConfig<T>;
  constructor(schema, typeName: string, config: TransformConfig<T>) {
    this.schema = schema;
    this.typeName = typeName;
    this.config = config;
  }
  transformRequest(originalRequest) {
    const typeInfo = new TypeInfo(this.schema);
    const doc = visit(
      originalRequest.document,
      visitWithTypeInfo(typeInfo, {
        [Kind.SELECTION_SET]: (node) => {
          const parentType = typeInfo.getParentType();
          if (parentType && parentType.name === this.typeName) {
            const selections = [...node.selections];
            // for each filed on the typename in the config
            for (const requestedFN in this.config) {
              // IF the field name is queried for,
              // check if the fields needed to derive that are also requested and if not add them
              const selection: FieldNode = selections.find(
                (s: FieldNode) => s.name.value === requestedFN,
              ) as FieldNode;
              if (selection) {
                //for each key of the object of required fields check if it is in the query
                for (const requiredField in this.config[requestedFN]) {
                  if (
                    !selections.find(
                      (s: FieldNode) => s.name.value === requiredField,
                    )
                  ) {
                    //get the selected sections for the requested Field
                    const requiredSelections = [
                      ...selection.selectionSet.selections,
                    ];
                    //add the required field selections to the selected fields
                    requiredSelections.push({
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value:
                          this.config[requestedFN][requiredField].toString(),
                      },
                    });

                    selection.selectionSet.selections = requiredSelections;

                    // add the required field to the fields being selected
                    selections.push({
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: requiredField.toString(),
                      },
                      selectionSet: selection.selectionSet,
                    });
                    console.log('added field');
                  }
                }
              }
            }
            return { ...node, selections };
          }
          return node;
        },
      }),
    );
    return { ...originalRequest, document: doc };
  }
  transformResult(originalResult) {
    console.log(
      'originalResult',
      JSON.stringify(originalResult.data.countries[0], null, 2),
    );
    return originalResult;
  }
}
