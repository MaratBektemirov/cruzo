import { AbstractComponent } from "./component";
import { AbstractService } from "./service";
import type {
  I18nLocaleView,
  I18nMessages,
  I18nPluralForms,
} from "./types/i18n-types";

const N_TOKEN = /\{\{\s*n\s*\}\}/g;

function isPluralForms(value: unknown): value is I18nPluralForms {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function substituteN(template: string, n: number) {
  return template.replace(N_TOKEN, String(n));
}

class I18nService extends AbstractService {
  public lang$ = this.newRx<string>("en");

  private pluralRules = new Map<string, Intl.PluralRules>();

  setLang(lang: string) {
    this.lang$.update(lang);
  }

  connect(component: AbstractComponent, messages: I18nMessages) {
    const i18n$ = component.newRx(
      this.createLocaleView(messages, this.lang$.actual),
    );

    const onLangChange = () => {
      if (component.destroyed) {
        this.lang$.postUpdateFns?.delete(onLangChange);

        if (this.lang$.postUpdateFns?.size === 0) {
          this.lang$.postUpdateFns = null;
        }

        return;
      }

      i18n$.update(this.createLocaleView(messages, this.lang$.actual));
    };

    this.lang$.setPostUpdate(onLangChange);

    const unsubscribe = i18n$.unsubscribe.bind(i18n$);

    i18n$.unsubscribe = () => {
      this.lang$.postUpdateFns?.delete(onLangChange);

      if (this.lang$.postUpdateFns?.size === 0) {
        this.lang$.postUpdateFns = null;
      }

      unsubscribe();
    };

    return i18n$;
  }

  plural(
    messages: I18nMessages,
    key: string,
    n: number,
    lang = this.lang$.actual,
  ) {
    const dict = messages[lang];

    if (!dict) {
      throw new Error(`i18n: locale "${lang}" not found in messages`);
    }

    return this.formatPlural(dict[key], n, lang, key);
  }

  private createLocaleView(messages: I18nMessages, lang: string): I18nLocaleView {
    const dict = messages[lang];

    if (!dict) {
      throw new Error(`i18n: locale "${lang}" not found in messages`);
    }

    const view = { ...dict } as I18nLocaleView;

    view.plural = (key: string, n: number) =>
      this.formatPlural(dict[key], n, lang, key);

    return view;
  }

  private formatPlural(
    forms: string | I18nPluralForms | undefined,
    n: number,
    lang: string,
    key: string,
  ) {
    if (forms == null) {
      throw new Error(`i18n: key "${key}" not found for locale "${lang}"`);
    }

    if (typeof forms === "string") {
      return substituteN(forms, n);
    }

    if (!isPluralForms(forms)) {
      throw new Error(`i18n: key "${key}" is not a plural forms map`);
    }

    const category = this.getPluralRules(lang).select(n);
    const template = forms[category] ?? forms.other;

    if (template == null) {
      throw new Error(
        `i18n: no plural form "${category}" (or "other") for key "${key}" in locale "${lang}"`,
      );
    }

    return substituteN(template, n);
  }

  private getPluralRules(lang: string) {
    let rules = this.pluralRules.get(lang);

    if (!rules) {
      rules = new Intl.PluralRules(lang);
      this.pluralRules.set(lang, rules);
    }

    return rules;
  }
}

export const i18nService = new I18nService();
