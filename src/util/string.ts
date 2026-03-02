import { type MaybeRefOrGetter, toValue } from 'vue'

/**
 * Trims leading whitespace of `text`, then removes leading whitespace
 * from each line of `text` equal to the amount of whitespace that was
 * removed from the line of `text` containing the first non-whitespace
 * character. Effectively this method trims the arbitrary indentation
 * of multi-line string literals passed as a Vue component prop.
 *
 * 1. Computes a "base indentation" for the provided `text`, by
 *    finding the column position of the first non-whitespace character.
 * 2. Removes exactly "base indentation" leading whitespace characters from
 *    each line of `text`, shifting the body left to justify with the first
 *    non-whitespace character.
 *
 * For example, with the '|' character indicating the start of each line:
 * |  <MyComponent :text="string_trimIndent(`
 * |    int main(int argc, const char* argv[]) {
 * |      return 0;
 * |    }
 * |  `)" />
 *
 * There are 4 spaces leading "int" in the text which is the "base indentation".
 * The resulting string removes the empty first line of text, and 4 characters
 * of whitespace leading the remaining lines of text, including any trailing whitespace.
 *
 * """
 * |int main(int argc, const char* argv[]) {
 * |  return 0;
 * |}
 * |
 * """
 *
 * @param value The string to adjust
 * @returns The adjusted string.
 */
export function string_trimIndent(text: MaybeRefOrGetter<undefined|null|string>): undefined|string {
  const lines = toValue(text)?.trimEnd().split('\n');
  if (!lines) {
    return;
  }
  let result = "";
  let base_indent = 0;
  let found_first_line = false;
  for (let line of lines) {
    if (!found_first_line) {
      found_first_line = /[^\s]/.test(line);
      if (!found_first_line) {
        continue;
      }
      base_indent = 0;
      for (const c of line) {
        if (c == ' ') {
          base_indent += 1;
        } else {
          break;
        }
      }
    }
    if (base_indent > 0 && line.startsWith(' '.repeat(base_indent))) {
      line = line.substring(base_indent);
    }
    result += line + '\n';
  }
  return result.trimEnd();
}