# Laravel Inertia React Translator

The `laravel-inertia-react-translator` package was primarily built, to be paired with the `antonioprimera/laravel-js-localization` package, to provide a seamless localization experience for Laravel Inertia React apps.

The Laravel package provides the necessary backend functionality to expose the Laravel localization files to the frontend, this package provides the necessary frontend functionality to access the localized strings in your React components.

While the two packages were built to work together, you can also use this package as a standalone package in your Inertia + React apps, without the Laravel package, by using the exposed Translator class directly and providing the dictionary of translations manually (either from a JS Object or from an API).

# Installation

```bash
npm install laravel-inertia-react-translator
```

# Usage

```tsx
import { usePage } from "@inertiajs/react";
import { TranslatorProvider } from "./TranslatorContext";

const inertiaDictionary = () => usePage().props.dictionary;

<TranslatorProvider getDictionary={inertiaDictionary}>
  {/* your app */}
</TranslatorProvider>;
```

# Accessing Translations

```tsx
import { useTranslator } from "laravel-inertia-react-translator";

const MyComponent = () => {
  const { t } = useTranslator();

  return <div>{t("welcome.message")}</div>;
};
```

# Using custom dictionary

```tsx
import { TranslatorProvider } from "laravel-inertia-react-translator";
const customDictionary = {
  "welcome.message": "Welcome to my app!",
};
const inertiaDictionary = () => customDictionary;
<TranslatorProvider getDictionary={inertiaDictionary}>
  {/* your app */}
</TranslatorProvider>;
```

# Related Package

- [antonioprimera/laravel-js-localization](https://github.com/AntonioPrimera/laravel-js-localization) - The Laravel package that provides the backend functionality to expose the Laravel localization files to the frontend.
