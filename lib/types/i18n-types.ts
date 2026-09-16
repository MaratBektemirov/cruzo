export type I18nPluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

export type I18nPluralForms = Partial<Record<I18nPluralCategory, string>>;

export type I18nLocaleDict = {
  [key: string]: string | I18nPluralForms;
};

export type I18nMessages = Record<string, I18nLocaleDict>;

export type I18nLocaleView = I18nLocaleDict & {
  plural(key: string, n: number): string;
};
