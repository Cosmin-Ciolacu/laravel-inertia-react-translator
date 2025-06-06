import Translator from "../Translator";

export interface ITranslationContext {
  translator: Translator;
  txt: (key: string, replace?: Record<string, any>) => string;
}
