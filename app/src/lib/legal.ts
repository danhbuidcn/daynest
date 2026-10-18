const SITE = 'https://danhbuidcn.github.io/daynest/site';

// The site has a Vietnamese and an English policy; every other app language gets English.
export const privacyPolicyUrl = (language: string) => `${SITE}/privacy/${language === 'vi' ? 'vi' : 'en'}.html`;
