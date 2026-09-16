import { describe, expect, it } from "vitest";
import { AbstractComponent } from "./component";
import { i18nService } from "./i18n.service";
import type { I18nMessages } from "./types/i18n-types";

const messages: I18nMessages = {
  en: {
    title: "Files",
    files: {
      one: "{{n}} file",
      other: "{{n}} files",
    },
  },
  ru: {
    title: "Файлы",
    files: {
      one: "{{n}} файл",
      few: "{{n}} файла",
      many: "{{n}} файлов",
      other: "{{n}} файла",
    },
  },
};

class I18nHostComponent extends AbstractComponent {
  static selector = "i18n-host-component";
  i18n$ = i18nService.connect(this, messages);
}

describe("i18nService", () => {
  it("defaults to en and switches locale via setLang", () => {
    i18nService.setLang("en");
    expect(i18nService.lang$.actual).toBe("en");

    i18nService.setLang("ru");
    expect(i18nService.lang$.actual).toBe("ru");
  });

  it("plural picks English forms", () => {
    expect(i18nService.plural(messages, "files", 1, "en")).toBe("1 file");
    expect(i18nService.plural(messages, "files", 2, "en")).toBe("2 files");
  });

  it("plural picks Russian one/few/many", () => {
    expect(i18nService.plural(messages, "files", 1, "ru")).toBe("1 файл");
    expect(i18nService.plural(messages, "files", 2, "ru")).toBe("2 файла");
    expect(i18nService.plural(messages, "files", 5, "ru")).toBe("5 файлов");
    expect(i18nService.plural(messages, "files", 21, "ru")).toBe("21 файл");
  });

  it("connect exposes dict keys and plural on the locale view", () => {
    i18nService.setLang("en");
    const host = new I18nHostComponent();

    expect(host.i18n$.actual.title).toBe("Files");
    expect(host.i18n$.actual.plural("files", 1)).toBe("1 file");
    expect(host.i18n$.actual.plural("files", 3)).toBe("3 files");

    i18nService.setLang("ru");
    expect(host.i18n$.actual.title).toBe("Файлы");
    expect(host.i18n$.actual.plural("files", 2)).toBe("2 файла");
    expect(host.i18n$.actual.plural("files", 5)).toBe("5 файлов");
  });

  it("throws on missing locale or key", () => {
    expect(() => i18nService.plural(messages, "files", 1, "de")).toThrow(
      /locale "de"/,
    );
    expect(() => i18nService.plural(messages, "missing", 1, "en")).toThrow(
      /key "missing"/,
    );
  });
});
