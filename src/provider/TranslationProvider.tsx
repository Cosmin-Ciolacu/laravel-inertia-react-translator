import { JSX, useMemo } from "react";
import { TranslationProviderProps } from "../types";
import Translator from "../Translator";
import TranslationContext from "../context/TranslationContext";

export function TranslationProvider({
  children,
  getDictionary,
}: TranslationProviderProps): JSX.Element {
  const translator = useMemo(
    () => new Translator(getDictionary),
    [getDictionary]
  );

  const txt = (key: string, replace?: Record<string, any>): string =>
    translator.translate(key, replace);

  const value = useMemo(
    () => ({
      translator,
      txt,
    }),
    [translator, txt]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
