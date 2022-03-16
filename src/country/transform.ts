import { Transform } from '@graphql-tools/delegate';

import { visit, Kind, visitWithTypeInfo, TypeInfo, FieldNode } from 'graphql';

export class AddFieldToDelegatedRequest implements Transform {
  schema;
  fieldName;
  typeName;
  constructor(schema, fieldName, typeName) {
    this.schema = schema;
    this.fieldName = fieldName;
    this.typeName = typeName;
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
            // IF the field name is missing for the typename, add it
            if (
              !selections.find(
                (s: FieldNode) => s.name.value === this.fieldName,
              )
            ) {
              selections.push({
                kind: Kind.FIELD,
                name: { kind: Kind.NAME, value: this.fieldName },
              });
              console.log('added field');
            }
            return { ...node, selections };
          }
          return node;
        },
      }),
    );
    return { ...originalRequest, document: doc };
  }
}
