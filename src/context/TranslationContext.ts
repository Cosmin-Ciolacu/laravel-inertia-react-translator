import { createContext } from "react";
import { ITranslationContext } from "../interfaces";

const TranslationContext = createContext<ITranslationContext | undefined>(
  undefined
);

export default TranslationContext;
