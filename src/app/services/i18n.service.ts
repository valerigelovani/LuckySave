import { Injectable, computed, effect, signal } from '@angular/core';
import { DEFAULT_LANG, LANG_CURRENCY_POSITION, LANG_CURRENCY_SYMBOL, LANG_LOCALE, Lang } from '../core/i18n/i18n.types';
import { EN } from '../core/i18n/en';
import { KA } from '../core/i18n/ka';
import { HistoryEventParams, HistoryItem } from '../core/models';
import { formatCurrency } from '../core/utils/currency.util';
import { formatDate } from '../core/utils/date.util';

const DICTIONARIES: Record<Lang, Record<string, string>> = { ka: KA, en: EN };
const STORAGE_KEY = 'luckysave.lang.v1';

function loadStoredLang(): Lang | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'ka' || raw === 'en' ? raw : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(loadStoredLang() ?? DEFAULT_LANG);
  readonly locale = computed(() => LANG_LOCALE[this.lang()]);
  readonly currencySymbol = computed(() => LANG_CURRENCY_SYMBOL[this.lang()]);
  readonly currencyPosition = computed(() => LANG_CURRENCY_POSITION[this.lang()]);

  constructor() {
    effect(() => {
      const lang = this.lang();
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // localStorage unavailable — language choice just won't persist across reloads.
      }
      document.documentElement.lang = lang;
    });
  }

  setLanguage(lang: Lang): void {
    this.lang.set(lang);
  }

  t = (key: string, params?: Record<string, string | number>): string => {
    const dict = DICTIONARIES[this.lang()];
    let text = dict[key] ?? key;
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      }
    }
    return text;
  };

  formatCurrency = (amount: number): string =>
    formatCurrency(amount, this.locale(), this.currencySymbol(), this.currencyPosition());

  formatDate = (iso: string): string => formatDate(iso, this.locale());

  monthOrdinal = (month: number): string => {
    if (this.lang() === 'ka') return month === 1 ? `${month}-ლი` : `${month}-ე`;
    return `${month}`;
  };

  private resolveParams(params?: HistoryEventParams): HistoryEventParams | undefined {
    if (!params) return params;
    const resolved = { ...params };
    if ('amount' in resolved) resolved['amount'] = this.formatCurrency(Number(resolved['amount']));
    if ('month' in resolved) resolved['month'] = this.monthOrdinal(Number(resolved['month']));
    return resolved;
  }

  tHistoryTitle = (item: HistoryItem): string => this.t(item.titleKey, this.resolveParams(item.titleParams));

  tHistoryDescription = (item: HistoryItem): string =>
    this.t(item.descriptionKey, this.resolveParams(item.descriptionParams));
}
