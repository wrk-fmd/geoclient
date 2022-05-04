import {TextUtils} from '../util';
import de from './de';
import en from './en';
import {LocalizedStrings} from './localized-strings';

const availableLanguages: { [name: string]: LocalizedStrings } = {de, en};
const activeLanguage = navigator.languages
  .map(locale => locale.split('-')[0])
  .find(language => language in availableLanguages);

const defaultLanguage = 'de';
const strings = availableLanguages[activeLanguage || defaultLanguage];

/**
 * This is a very simple implementation providing localized strings
 * @param key The translation key
 * @param properties Optional properties used as replacements in a template string
 * @return A translated string, or the key of no translation exists
 */
export function i18n(key: keyof LocalizedStrings, properties?: { [key: string]: any }): string {
  const value = strings[key];
  if (!value) {
    return key;
  }
  if (!properties) {
    return value;
  }
  return TextUtils.templateReplace(value, properties);
}
