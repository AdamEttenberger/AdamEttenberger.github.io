import { useUserPreferencesStore } from '@/stores/user_preferences'

export type ImageSourcePath = string;
export type FontAwesomeIconSource = Array<string>;
export type ImageOrFontAwesomeIcon = ImageSourcePath|FontAwesomeIconSource;

export interface ThemedImage {
  srcDark: ImageSourcePath;
  srcLight: ImageSourcePath;
}

export interface ThemedFontAwesomeIcon {
  srcDark: FontAwesomeIconSource;
  srcLight: FontAwesomeIconSource;
}

export type MaybeThemedImage = ImageSourcePath|ThemedImage;
export type MaybeThemedFontAwesomeIcon = FontAwesomeIconSource|ThemedFontAwesomeIcon;
export type MaybeThemedImageOrFontAwesomeIcon = ImageOrFontAwesomeIcon|ThemedImage|ThemedFontAwesomeIcon;

export function isImageSource(value: any): value is ImageSourcePath {
  return typeof value === 'string';
}

export function isFontAwesomeIcon(value: any): value is FontAwesomeIconSource {
  return Array.isArray(value) &&
         value.length == 2 &&
         value.every(item => typeof item === 'string');
}

export function isImageOrFontAwesomeIcon(value: any): value is ImageOrFontAwesomeIcon {
  return isImageSource(value) || isFontAwesomeIcon(value);
}

export function isThemedImage(value: any): value is ThemedImage {
  return typeof value === 'object' &&
         Object.prototype.hasOwnProperty.call(value, 'srcDark') &&
         isImageSource(value.srcDark) &&
         Object.prototype.hasOwnProperty.call(value, 'srcLight') &&
         isImageSource(value.srcLight);
}

export function isThemedFontAwesomeIcon(value: any): value is ThemedFontAwesomeIcon {
  return typeof value === 'object' &&
         Object.prototype.hasOwnProperty.call(value, 'srcDark') &&
         isFontAwesomeIcon(value.srcDark) &&
         Object.prototype.hasOwnProperty.call(value, 'srcLight') &&
         isFontAwesomeIcon(value.srcLight);
}

export function isThemedImageOrFontAwesomeIcon(value: any): value is ThemedImage|ThemedFontAwesomeIcon {
  return isThemedImage(value) || isThemedFontAwesomeIcon(value);
}

export function isMaybeThemedImage(value: any): value is MaybeThemedImage {
  return isImageSource(value) || isThemedImage(value);
}

export function isMaybeThemedFontAwesomeIcon(value: any): value is MaybeThemedFontAwesomeIcon {
  return isFontAwesomeIcon(value) || isThemedFontAwesomeIcon(value);
}

export function isMaybeThemedImageOrFontAwesomeIcon(value: any): value is MaybeThemedImageOrFontAwesomeIcon {
  return isMaybeThemedImage(value) || isMaybeThemedFontAwesomeIcon(value);
}

export function getThemedImageSource(value?: any): ImageSourcePath|undefined {
  if (value === undefined) {
    return;
  }
  if (isImageSource(value)) {
    return value;
  }
  if (isThemedImage(value)) {
    return useUserPreferencesStore().useDarkMode
        ? value.srcDark
        : value.srcLight;
  }
}

export function getThemedFontAwesomeIcon(value?: any): FontAwesomeIconSource|undefined {
  if (value === undefined) {
    return;
  }
  if (isFontAwesomeIcon(value)) {
    return value;
  }
  if (isThemedFontAwesomeIcon(value)) {
    return useUserPreferencesStore().useDarkMode
        ? value.srcDark
        : value.srcLight;
  }
}

export function getThemedImageOrFontAwesomeIcon(value?: any): ImageSourcePath|FontAwesomeIconSource|undefined {
  if (value === undefined) {
    return;
  }
  var result: ImageSourcePath|FontAwesomeIconSource|undefined;
  result = getThemedImageSource(value);
  if (result !== undefined) {
    return result;
  }
  result = getThemedFontAwesomeIcon(value);
  if (result !== undefined) {
    return result;
  }
}

export function makeThemedImage(format: string): ThemedImage {
  return {
    srcDark: format.replaceAll('{theme}', 'dark'),
    srcLight: format.replaceAll('{theme}', 'light'),
  }
}
