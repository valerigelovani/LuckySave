export type Lang = 'ka' | 'en';

export const DEFAULT_LANG: Lang = 'ka';

export const LANG_LABELS: Record<Lang, string> = {
  ka: 'ქარ',
  en: 'EN',
};

export const LANG_LOCALE: Record<Lang, string> = {
  ka: 'ka-GE',
  en: 'en-US',
};

export const LANG_CURRENCY_SYMBOL: Record<Lang, string> = {
  ka: '₾',
  en: '$',
};

export const LANG_CURRENCY_POSITION: Record<Lang, 'prefix' | 'suffix'> = {
  ka: 'suffix',
  en: 'prefix',
};
