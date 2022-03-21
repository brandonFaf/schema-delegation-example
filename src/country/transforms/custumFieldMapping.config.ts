import { Country } from '../models/country.model';
export type TransformConfig<T extends object> = {
  [key in keyof Partial<T>]: T[key] extends object
    ? {
        [secondKey in keyof Partial<T>]: T[secondKey] extends Array<any>
          ? keyof T[secondKey][0]
          : keyof T[secondKey];
      }
    : keyof T;
};

export const CountryConfig: TransformConfig<Country> = {
  primaryState: { states: 'isPrimaryState' },
  startsWithA: 'code',
};
