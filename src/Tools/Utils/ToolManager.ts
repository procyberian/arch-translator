import {makeCollapsibleFooter} from "./CollapsibleFooter";
import {PageInfo} from "../../Utilities/PageUtils";

type ToolSection = {
    rootElement: HTMLElement
    list: HTMLUListElement
};

export type CustomSidebarTool = {
    name: string
    toolElement: HTMLAnchorElement
    showCallback?: (pageInfo: PageInfo) => boolean
};

export type CustomFooterTool = {
    name: string
    header: string
    toolElement: HTMLElement
    storeKey: string
};

type RegisteredFooterTool = {
    container: HTMLDivElement
    tool: HTMLElement
    toggler: HTMLElement
};

type SimpleSidebarTool = {
    name: string
    displayText: string
    handler: (this:HTMLAnchorElement, ev: MouseEvent) => any
    showCallback?: (pageInfo: PageInfo) => boolean
};

const toolInProgressClass = 'at-tool-inProgress';
export function sideTool(toolInfo: SimpleSidebarTool): CustomSidebarTool {
    const element = document.createElement('a');
    element.innerHTML = toolInfo.displayText;
    element.addEventListener('click', e => {
        if (element.parentElement!.classList.contains(toolInProgressClass)) {
            return;
        }

        // @ts-ignore
        const result = toolInfo.handler(e);
        if (result instanceof Promise) {
            element.parentElement!.classList.add(toolInProgressClass);
            result.finally(() => {
                element.parentElement!.classList.remove(toolInProgressClass);
            });
        }
    });

    return {
        name: toolInfo.name,
        toolElement: element,
        showCallback: toolInfo.showCallback
    };
}

export class ToolManager {
    private static _instance: ToolManager|null = null;
    private _sidebarToolSection: ToolSection;
    private _sidebarToolSectionAddedToDom: boolean = false;
    private _footerTools: RegisteredFooterTool[] = [];
    private _footerToolContainer: JQuery|null = null;

    private constructor() {
        if (ToolManager._instance != null) {
            throw new Error("ToolManager was initialized already");
        }

        ToolManager._instance = this;

        this._sidebarToolSection = ToolManager._createToolSectionElement();
    }

    /**
     * Adds the ArchTranslator tool section to the DOM
     * @param parent If not null, adds the tool section to the specified element (otherwise looks for #vector-page-tools)
     */
    public addSidebarToPage(parent: HTMLElement|null = null) {
        if (this._sidebarToolSectionAddedToDom) {
            throw new Error("The tool section was added to DOM already");
        }

        if (parent == null) {
            parent = document.getElementById('vector-page-tools');
            if (parent == null) {
                throw new Error('Could not find vector-page-tools');
            }
        }

        parent.appendChild(this._sidebarToolSection.rootElement);
        this._sidebarToolSectionAddedToDom = true;
    }

    /**
     * Adds the footer tools to the DOM
     * @param editForm The JQuery element from editForm hook
     */
    public addFooterToPage(editForm: JQuery) {
        if (this._footerToolContainer != null) {
            throw new Error("Footer tool container was already initialized");
        }

        this._footerToolContainer = editForm;
        for (const tool of this._footerTools) {
            this._addFooterToolToContainer(tool);
        }
    }

    /**
     * Adds a custom tool to the sidebar
     * @param tool
     * @param currentPageInfo Used to hide useless tools based on the info about the current page
     */
    public addSidebarTool(tool: CustomSidebarTool, currentPageInfo: PageInfo) {
        if (tool.showCallback != null && !tool.showCallback(currentPageInfo)) {
            return;
        }

        const listItem = document.createElement('li');
        listItem.id = `t-at-${tool.name}`;
        listItem.classList.add('mw-list-item');
        listItem.appendChild(tool.toolElement);

        this._sidebarToolSection.list.appendChild(listItem);
    }

    /**
     * Adds a custom tool to the footer as a collapsible element
     * @param tool
     */
    public addFooterTool(tool: CustomFooterTool) {
        const registeredTool = this._registerFooterTool(tool);
        this._addFooterToolToContainer(registeredTool);

        makeCollapsibleFooter(
            $(registeredTool.tool),
            $(registeredTool.toggler),
            tool.storeKey
        );
    }

    private _addFooterToolToContainer(tool: RegisteredFooterTool) {
        if (this._footerToolContainer != null) {
            this._footerToolContainer
                .find('.templatesUsed')
                .before(tool.container);
        }
    }

    private _registerFooterTool(tool: CustomFooterTool): RegisteredFooterTool {
        const parentElement = document.createElement('div');
        parentElement.className = tool.name;

        const togglerElement = document.createElement('div');
        togglerElement.className = `${tool.name}-toggler`;
        togglerElement.innerHTML = `<p>${tool.header}</p>`;

        parentElement.appendChild(togglerElement);
        parentElement.appendChild(tool.toolElement);

        if (tool.toolElement.tagName === 'UL' || tool.toolElement.tagName === 'OL' || tool.toolElement.tagName === 'DL') {
            tool.toolElement.classList.add('mw-editfooter-list');
        }

        const registeredTool = {
            container: parentElement,
            tool: tool.toolElement,
            toggler: togglerElement
        };
        this._footerTools.push(registeredTool);

        return registeredTool;
    }

    /** Returns the singleton instance of ToolManager */
    public static get instance(): ToolManager {
        if (this._instance == null) {
            return new ToolManager();
        }

        return this._instance;
    }

    private static _createToolSectionElement(): ToolSection {
        const toolContainer = document.createElement('div');
        toolContainer.id = 'p-arch-translator';
        toolContainer.classList.add('vector-menu', 'mw-portlet');

        // Heading
        const menuHeading = document.createElement('div');
        menuHeading.classList.add('vector-menu-heading');
        menuHeading.innerText = 'Arch Translator';
        toolContainer.appendChild(menuHeading);

        // Content
        const menuContent = document.createElement('div');
        menuContent.classList.add('vector-menu-content');
        toolContainer.appendChild(menuContent);

        const menuList = document.createElement('ul');
        menuList.classList.add('vector-menu-content-list');
        menuContent.appendChild(menuList);

        return {
            rootElement: toolContainer,
            list: menuList
        };
    }
}