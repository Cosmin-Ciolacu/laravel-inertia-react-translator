export type Dictionary = Record<string, any> | (() => Record<string, any>);
export type ReplaceObject =
  | Record<string, string | number>
  | string
  | number
  | null;
export type ComposedKeyResult = {
  key: string;
  count: number | null;
  replace: ReplaceObject;
};

export type TranslationProviderProps = {
  children: React.ReactNode;
  getDictionary: () => Dictionary;
};
