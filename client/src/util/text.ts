/**
 * This namespace contains helpers for handling text
 */
export namespace TextUtils {
  /**
   * Replaces placeholders in the template with the values from the data object
   * @param template A string with '{{key}}' placeholders
   * @param data An object of values corresponding to the keys in the template string
   * @return A string, where the placeholders are replaced by the corresponding value or the empty string if the value is not given
   */
  export function templateReplace(template: string, data: { [key: string]: string }): string {
    return template.replace(/{{([^{}]+)}}/g, (_, key) => data[key] !== undefined ? data[key] : '');
  }

  /**
   * Formats a string for usage in a Leaflet popup
   * @param text The string to format
   * @return The formatted string, which defaults to the empty string
   */
  export function forPopup(text: string | null | undefined): string {
    // This does not do much anymore - previous replacements of newlines are just handled with CSS now
    // TODO Currently we allow HTML in the input text. Do we want that?
    return text ? text.trim() : '';
  }

  /**
   * Parses a string as number and handles null/undefined inputs
   * @param str The nullable numeric string
   * @param parse A parsing function such as {@link parseFloat} or {@link parseInt}
   * @return The numeric value in the string, or {@link NaN} as default
   */
  export function nullSafeParse(str: string | null | undefined, parse: (str: string) => number): number {
    return str !== undefined && str !== null ? parse(str) : NaN;
  }
}
