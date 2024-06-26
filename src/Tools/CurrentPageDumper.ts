import {getCurrentPageContent, getCurrentPageInfo, PageType} from "../Utilities/PageUtils";
import {setCachedPageInfo} from "../Storage/ScriptDb";
import {CachedPageInfoType} from "../Storage/ScriptDbModels";
import {findRedirect} from "../Utilities/WikiTextParser";

/**
 * Automatically updates the cache for the opened page
 */
export const cacheCurrentPage = async () => {
    const info = getCurrentPageInfo();
    if (info.pageType !== PageType.Read) return;

    if (info.isRedirect) {
        const content = await getCurrentPageContent();
        const redirectTarget = findRedirect(content);
        if (redirectTarget == null) {
            throw new Error("The current page is a redirect but no redirect link was found");
        }

        await setCachedPageInfo({
            latestRevisionId: info.latestRevisionId,
            pageName: info.pageName,
            redirectsTo: redirectTarget.linkWithHeader,
            type: CachedPageInfoType.Redirect
        });
    }
    else {
        await setCachedPageInfo({
            latestRevisionId: info.latestRevisionId,
            pageName: info.pageName,
            type: info.isTranslated ? CachedPageInfoType.Translated : CachedPageInfoType.English
        });
    }
};