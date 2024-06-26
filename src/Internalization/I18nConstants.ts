export class LanguageInfo {
    englishName: string
    localizedName: string
    subtag: string|null
    key: string

    constructor(subtag: string|null, englishName: string, localizedName: string, customKey?: string) {
        this.subtag = subtag;
        this.englishName = englishName;
        this.localizedName = localizedName;

        this.key = customKey ?? this.englishName;
    }
}

export const LanguagesInfo: { [key: string]: LanguageInfo } = {
    Arabic: new LanguageInfo('ar', 'Arabic', 'العربية'),
    Bangla: new LanguageInfo(null, 'Bangla', 'বাংলা'),
    Bosnian: new LanguageInfo('bs', 'Bosnian', 'Bosanski'),
    Bulgarian: new LanguageInfo('bg', 'Bulgarian', 'Български'),
    Cantonese: new LanguageInfo(null, 'Cantonese', '粵語'),
    Catalan: new LanguageInfo('ca', 'Catalan', 'Català'),
    ChineseClassical: new LanguageInfo(null, 'Chinese (Classical)', '文言文', 'ChineseClassical'),
    ChineseSimplified: new LanguageInfo('zh-hans', 'Chinese (Simplified)', '简体中文', 'ChineseSimplified'),
    ChineseTraditional: new LanguageInfo('zh-hant', 'Chinese (Traditional)', '正體中文', 'ChineseTraditional'),
    Croatian: new LanguageInfo('hr', 'Croatian', 'Hrvatski'),
    Czech: new LanguageInfo('cs', 'Czech', 'Čeština'),
    Danish: new LanguageInfo('da', 'Danish', 'Dansk'),
    Dutch: new LanguageInfo('nl', 'Dutch', 'Nederlands'),
    English: new LanguageInfo('en', 'English', 'English'),
    Esperanto: new LanguageInfo(null, 'Esperanto', 'Esperanto'),
    Finnish: new LanguageInfo('fi', 'Finnish', 'Suomi'),
    French: new LanguageInfo('fr', 'French', 'Français'),
    German: new LanguageInfo('de', 'German', 'Deutsch'),
    Greek: new LanguageInfo('el', 'Greek', 'Ελληνικά'),
    Hebrew: new LanguageInfo('he', 'Heberew', 'עברית'),
    Hungarian: new LanguageInfo('hu', 'Hungarian', 'Magyar'),
    Indonesian: new LanguageInfo('id', 'Indonesian', 'Bahasa Indonesia'),
    Italian: new LanguageInfo('it', 'Italian', 'Italiano'),
    Japanese: new LanguageInfo('ja', 'Japanese', '日本語'),
    Korean: new LanguageInfo('ko', 'Korean', '한국어'),
    Lithuanian: new LanguageInfo('lt', 'Lithuanian', 'Lietuvių'),
    NorwegianBokmal: new LanguageInfo(null, 'Norwegian (Bokmål)', 'Norsk Bokmål', 'NorwegianBokmal'),
    Polish: new LanguageInfo('pl', 'Polish', 'Polski'),
    Portuguese: new LanguageInfo('pt', 'Portuguese', 'Português'),
    Romanian: new LanguageInfo(null, 'Romanian', 'Română'),
    Russian: new LanguageInfo('ru', 'Russian', 'Русский'),
    Serbian: new LanguageInfo('sr', 'Serbian', 'Српски (Srpski)'),
    Slovak: new LanguageInfo('sk', 'Slovak', 'Slovenčina'),
    Spanish: new LanguageInfo('es', 'Spanish', 'Español'),
    Swedish: new LanguageInfo('sv', 'Swedish', 'Svenska'),
    Thai: new LanguageInfo('th', 'Thai', 'ไทย'),
    Turkish: new LanguageInfo('tr', 'Turkish', 'Türkçe'),
    Ukrainian: new LanguageInfo('uk', 'Ukrainian', 'Українська'),
    Vietnamese: new LanguageInfo(null, 'Vietnamese', 'Tiếng Việt'),
    Quechua: new LanguageInfo(null, 'Quechua', 'Runa simi')
};

const validLangPostfixes = Object
    .values(LanguagesInfo)
    .map(i => '(' + i.localizedName + ')');
export const validLangSubtags: string[] = Object
    .values(LanguagesInfo)
    .filter(i => i.subtag != null)
    .map(i => i.subtag!);

export function isTranslated(title: string): boolean {
    for (const postfix of validLangPostfixes) {
        if (title.endsWith(postfix)) {
            return true;
        }
    }

    return false;
}

// TODO: Maybe add a class method to LanguageInfo class to avoid iterating over all of the postfixes all the time
export function removeLanguagePostfix(pageOrTitle: string): string {
    const remove = (target: string, postfix: string): string => {
        return target.substring(0, target.length - 1 - postfix.length);
    };

    for (const postfix of validLangPostfixes) {
        if (!pageOrTitle.endsWith(postfix)) {
            continue;
        }

        const split = pageOrTitle.split('/');
        if (split.length <= 1) {
            return remove(pageOrTitle, postfix);
        }
        else {
            return split
                .map(part => remove(part, postfix))
                .join('/');
        }
    }

    return pageOrTitle;
}

export function getLangInfoFor(key: string): LanguageInfo {
    const info = LanguagesInfo[key];
    if (info == null) {
        throw new Error(`Invalid language key: ${key}`);
    }

    return info;
}