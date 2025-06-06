import { ComposedKeyResult, Dictionary, ReplaceObject } from "./types";

class Translator {
  //--- Properties --------------------------------------------------------------------------------------------------
  /**
   * The dictionary can be an object or a function that returns an object.
   */
  dictionary: Dictionary = {};

  //--- Constructor -------------------------------------------------------------------------------------------------

  constructor(dictionary: Dictionary = {}) {
    if (dictionary) this.setDictionary(dictionary);
  }

  //--- Public API --------------------------------------------------------------------------------------------------

  setDictionary(dictionary: Dictionary): void {
    this.dictionary = dictionary;
  }

  getDictionary(): Record<string, any> {
    return typeof this.dictionary === "function"
      ? this.dictionary()
      : this.dictionary;
  }

  //--- Translation methods ------------------------------------------------------------------------------------------

  translate(key: string, replace?: ReplaceObject): string {
    let translation = this.#getTranslationFromDictionary(
      key,
      this.getDictionary()
    );

    //if we have a translation or a set of replacements, we can proceed
    if (translation || replace)
      return this.#replacePlaceholders(
        translation ?? key,
        this.#normalizeReplaceObject(replace)
      );

    //if we got here, we have no translation and no replacements, so we check if we have a composed key
    if (!this.#isComposedKey(key)) return key;

    //if we have a composed key, we split it into its parts and try to translate it
    const composedKey = this.#splitComposedKey(key);

    //if we have a count, we try to translate the plural form
    if (composedKey.count !== null && !isNaN(composedKey.count))
      return this.translatePlural(
        composedKey.key,
        composedKey.count,
        composedKey.replace
      );

    //if we have a replacement object, try to translate the key with the replacements (recursive call!)
    if (composedKey.replace)
      return this.translate(composedKey.key, composedKey.replace);

    //if we got here, we have a composed key without a count or replacements, so we return the key
    return composedKey.key;
  }

  translatePlural(key: string, count: number, replace?: ReplaceObject): string {
    let translation = this.#getTranslationFromDictionary(
      key,
      this.getDictionary()
    );
    if (!translation) return key;

    translation = this.#pickPluralForm(count, translation.split("|"));
    if (!translation) return key;

    let replaceObject = this.#normalizeReplaceObject(replace);
    let defaultReplaceObject = { count: count, value: count };

    return this.#replacePlaceholders(translation, {
      ...defaultReplaceObject,
      ...(typeof replaceObject === "object" ? replaceObject : {}),
    });
  }

  //--- Private helpers ---------------------------------------------------------------------------------------------

  /**
   * Pick the correct plural form for a given count. The forms are given as an array of strings (exploded by |).
   * The count is used to find the right plural form. Following options are supported:
   *  - {0} zero|{1} one|[2-10] few|[11-99] many|[100-*] other
   *  - one|zero or many
   */
  #pickPluralForm(count: number, forms: string[]): string | null {
    if (!Array.isArray(forms) || forms.length === 0) return null;

    if (forms.length === 1) return forms[0];

    //use the default plural forms, equivalent to ({1} one|[0, 2-*] zero or many)
    let translated = count === 1 ? forms[0] : forms[1];

    for (let i = 0; i < forms.length; i++) {
      //check for a specific plural form: {count} form
      let exactNumber = forms[i].match(/\{(\d+)\}\s?(.*)/); //match {n} and the rest of the string
      if (exactNumber !== null && count === parseInt(exactNumber[1])) {
        return exactNumber[2];
      }

      //check for a plural range in any of the forms: [n - m] / [n - *] / [n, m] / [n, *]
      let range = forms[i].match(
        /\s*\[\s*(\d+)\s*(?:-|,)\s*(\d*\*?)\s*\]\s*(.*)/
      );
      if (range !== null) {
        const rangeStart = parseInt(range[1]);
        const rangeEnd = range[2] === "*" ? Infinity : parseInt(range[2]);
        if (count >= rangeStart && count <= rangeEnd) {
          return range[3];
        }
      }
    }

    return translated;
  }

  #getTranslationFromDictionary(
    key: string,
    dictionary: Dictionary
  ): string | null {
    if (!key) return "";
    const result = key
      .split(".")
      .reduce(
        (t, i) => (t && typeof t === "object" ? t[i] ?? null : null),
        dictionary
      );
    return typeof result === "string" ? result : null;
  }

  #replacePlaceholders(translation: string, replace: ReplaceObject): string {
    if (!replace) return translation;

    Object.keys(replace).forEach((key) => {
      if (typeof replace === "object" && replace !== null && key in replace) {
        translation = translation.replaceAll(
          `:${key}`,
          String((replace as Record<string, string | number>)[key])
        );
      }
    });

    return translation;
  }

  //normalize the replacement object to a key-value object
  #normalizeReplaceObject(replace: any): ReplaceObject {
    if (!replace) return null;

    let replaceObject = replace;

    // if replace is a number, we assume it's: count OR value
    if (typeof replaceObject === "number")
      replaceObject = { count: replace, value: replace };

    // if replace is a string, we assume it's: value, name
    if (typeof replaceObject === "string")
      replaceObject = { value: replace, name: replace };

    return typeof replaceObject === "object" ? replaceObject : null;
  }

  #isComposedKey(key: string): boolean {
    return typeof key === "string" && (key.includes("[") || key.includes("{"));
  }

  //given a key in the form of 'a.b[1]{replace: value}', split it into
  //the key 'a.b', the plural count 1, and the replacement object {replace: value}
  #splitComposedKey(composedKey: string): ComposedKeyResult {
    // Updated regex to correctly handle missing parts
    const match = composedKey.match(/^(.+?)(?:\[(\d+)])?(?:{(.+?)})?$/);

    // Return null if no match
    if (!match) return { key: composedKey, count: null, replace: null };

    const key = match[1];
    const count = match[2] ? parseInt(match[2], 10) : null;
    const rawArgs = match[3];

    // Parse replacement arguments if provided
    const replace = rawArgs
      ? Object.fromEntries(
          rawArgs.split(",").map((pair) => pair.split(":").map((s) => s.trim()))
        )
      : null;

    return { key, count, replace };
  }
}

export default Translator;
