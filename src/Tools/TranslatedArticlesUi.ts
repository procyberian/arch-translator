import {RedirectResult, TranslatedArticlesResult} from "./Workers/TranslatedArticlesWorker";
import {makeCollapsibleFooter} from "./Utils/CollapsibleFooter";
import {titleToPageName} from "../Utilities/PageUtils";

const LOCALIZED_LINKS_UI_STORE_KEY = "mwedit-state-arch-translator-translated-art";

let editFormLocalizedArticlesTable: HTMLTableElement | null = null;
let tableBody: HTMLElement | null = null;

export const addTranslatedArticlesUi = ($editForm: JQuery) => {
    const localizedArticlesUiHtml =
        `<div class="localizedArticlesUi">
            <div class="localizedArticlesUi-toggler">
                <p>AT - Localized articles:</p>
            </div>
            <table class="wikitable mw-editfooter-list">
                <thead>
                    <tr>
                        <th>Localized name</th>
                        <th>Redirected from</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="2">Please wait</td>
                    </tr>
                </tbody>
            </table>
        </div>`;

    $editForm
        .find('.templatesUsed')
        .before(localizedArticlesUiHtml);

    const linksTable = $editForm.find('.localizedArticlesUi table');
    editFormLocalizedArticlesTable = linksTable[0] as HTMLTableElement;

    tableBody = $editForm.find('.localizedArticlesUi table tbody')[0] as HTMLElement;

    makeCollapsibleFooter(
        linksTable,
        $editForm.find('.localizedArticlesUi-toggler'),
        LOCALIZED_LINKS_UI_STORE_KEY
    );
};

export const addWorkerResultToUi = (result: TranslatedArticlesResult) => {
    const compareRedirects = (a: RedirectResult, b: RedirectResult) => {
        const aOrder = a.exists
            ? 0
            : 1;
        const bOrder = b.exists
            ? 0
            : 1;

        return aOrder - bOrder;
    };
    const linkify = (title: string, followRedirects: boolean = true) => {
        return followRedirects
            ? `/title/${titleToPageName(title)}`
            : `/index.php?title=${encodeURIComponent(titleToPageName(title))}&redirect=no`;
    };

    if (editFormLocalizedArticlesTable == null || tableBody == null) {
        throw new Error('editFormLocalizedArticlesTable was not created yet');
    }

    if (result.existing.length <= 0 && result.redirects.length <= 0 && result.notExisting.length <= 0) {
        tableBody.innerHTML = '<td class="muted-link" colspan="2">No links were found in the page content</td>';
        return;
    }

    tableBody.innerHTML = '';

    const existingRedirectCell = `<td class="muted-link" rowspan="${result.existing.length}">N/A</td>`
    let existingRedirectCellAdded = false;

    for (const existing of result.existing) {
        const row = document.createElement('tr');
        const className = 'green-link';
        row.classList.add(className);

        row.innerHTML = `<td class="${className}"><a href="${linkify(existing)}">${existing}</td></a>`;
        if (!existingRedirectCellAdded) {
            row.innerHTML += existingRedirectCell;
            existingRedirectCellAdded = true;
        }

        tableBody.appendChild(row);
    }
    for (const redirect of result.redirects.sort(compareRedirects)) {
        const row = document.createElement('tr');
        const className = 'blue-link';
        row.classList.add(className);

        const nameCell = document.createElement('td');
        nameCell.className = redirect.exists
            ? 'green-link'
            : 'red-link';
        nameCell.innerHTML = redirect.exists ?
            `<a href="${linkify(redirect.localizedRedirectTarget)}">${redirect.localizedRedirectTarget}</a>`
            : redirect.localizedRedirectTarget;
        row.appendChild(nameCell);

        const redirectCell = document.createElement('td');
        redirectCell.className = className;

        const redirectSrc = `<a href="${linkify(redirect.link, false)}">${redirect.link}</a>`;
        const redirectTarget = `<a href="${linkify(redirect.redirectsTo)}">${redirect.redirectsTo}</a>`;
        redirectCell.innerHTML = `${redirectSrc} -&gt; ${redirectTarget}`;
        row.appendChild(redirectCell);

        tableBody.appendChild(row);
    }

    const notExistingRedirectCell = `<td class="muted-link" rowspan="${result.notExisting.length}">N/A</td>`
    let notExistingRedirectCellAdded = false;
    for (const notExisting of result.notExisting) {
        const row = document.createElement('tr');
        const className = 'red-link';
        row.classList.add(className);

        row.innerHTML = `<td class="${className}">${notExisting}</td>`;
        if (!notExistingRedirectCellAdded) {
            row.innerHTML += notExistingRedirectCell;
            notExistingRedirectCellAdded = true;
        }

        tableBody.appendChild(row);
    }
};