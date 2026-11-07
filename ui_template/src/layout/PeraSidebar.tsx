import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { NavLink, Link, useLocation } from "react-router";

const views = ["Contributor View", "Employer View", "Admin View", "CMS View"];
const navSections = [
    {
        group: "My PERA",
        items: [
            { id: "dashboard", label: "Dashboard", path: "/dashboard" },
            { id: "portfolio", label: "My Portfolio", path: "/portfolio" },
            { id: "contributions", label: "Contributions", path: "/contributions" },
            { id: "retirementgoals", label: "Retirement Goals", path: "/peragoals" },
        ],
    },
    {
        group: "Workforce Management",
        items: [
            { id: "employerdashboard", label: "Employer Dashboard", path: "/employer-dashboard" },
            { id: "employeeroster", label: "Employee Roster", path: "/employee-roster" },
            { id: "contributionsmanagement", label: "Contributions Management", path: "/contributions-management" },
        ],
    },
    {
        group: "Control Center",
        items: [
            { id: "admindashboard", label: "Admin Dashboard", path: "/admin-dashboard" },
            { id: "approvalsqueue", label: "Approvals Queue", path: "/approvals-queue" },
            { id: "usermanagement", label: "User Management", path: "/user-management" },
        ],
    },
    {
        group: "CMS Hub",
        items: [
            { id: "cmsdashboard", label: "CMS Dashboard", path: "/cms-dashboard" },
            { id: "learneditor", label: "ACME Learn Editor", path: "/learn-editor" },
            { id: "productcatalog", label: "Product Catalog", path: "/product-catalog" },
        ],
    },
    {
        group: "Resource & Tools",
        items: [
            { id: "learn", label: "CGSI Learn", path: "/learn" },
            { id: "messaging", label: "Messaging", path: "/messaging" },
        ],
    },
];

const viewGroupMapping: Record<string, string[]> = {
    "Contributor View": ["My PERA", "Resource & Tools"],
    "Employer View": ["Workforce Management", "Resource & Tools"],
    "CMS View": ["CMS Hub", "Resource & Tools"],
    "Admin View": ["Control Center", "Resource & Tools"],
};

interface MobileDockIntent {
    home: { path: string; label: string };
    search: { path: string; label: string };
    contribute: { path: string; label: string }; 
    learn: { path: string; label: string };
}

export default function PeraSidebar() {
    const { isExpanded, isMobileOpen } = useSidebar();
    const isVisible = isExpanded || isMobileOpen;
    const location = useLocation();

    const [viewOpen, setViewOpen] = useState(false);
    const [moreMobileOpen, setMoreMobileOpen] = useState(false);
    const [activeView, setActiveView] = useState("Contributor View");

    const viewDropdownRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMoreMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
                setViewOpen(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
                setMoreMobileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allowedGroups = viewGroupMapping[activeView] || [];
    const filteredNavSections = navSections.filter((section) =>
        allowedGroups.includes(section.group)
    );

    const getMobileDockIntents = (): MobileDockIntent => {
        switch (activeView) {
            case "Employer View":
                return {
                    home: { path: "/employer-dashboard", label: "Home" },
                    search: { path: "/employee-roster", label: "Search" },
                    contribute: { path: "/contributions-management", label: "Contribute" },
                    learn: { path: "/learn", label: "Learn" },
                };
            case "Admin View":
                return {
                    home: { path: "/admin-dashboard", label: "Home" },
                    search: { path: "/user-management", label: "Search" },
                    contribute: { path: "/approvals-queue", label: "Contribute" },
                    learn: { path: "/learn", label: "Learn" },
                };
            case "CMS View":
                return {
                    home: { path: "/cms-dashboard", label: "Home" },
                    search: { path: "/product-catalog", label: "Search" },
                    contribute: { path: "/learn-editor", label: "Contribute" },
                    learn: { path: "/learn", label: "Learn" },
                };
            case "Contributor View":
            default:
                return {
                    home: { path: "/dashboard", label: "Home" },
                    search: { path: "/portfolio", label: "Search" },
                    contribute: { path: "/contributions", label: "Contribute" },
                    learn: { path: "/learn", label: "Learn" },
                };
        }
    };

    const dockIntents = getMobileDockIntents();
    const primaryPaths = [dockIntents.home.path, dockIntents.search.path, dockIntents.contribute.path, dockIntents.learn.path];
    
    const contextOverflowLinks = filteredNavSections.flatMap(section => 
        section.items.filter(item => !primaryPaths.includes(item.path))
    );

    const isOverflowActive = contextOverflowLinks.some(item => location.pathname === item.path);

    return (
        <>
            {/* ================= DESKTOP SIDEBAR PANEL LAYOUT (>= xl) ================= */}
            <aside
                className={`sidebar fixed top-16 xl:top-0 left-0 z-40 hidden xl:flex h-screen w-[290px] flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
                    isVisible ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* SIDEBAR HEADER */}
                <div className="px-5 pt-5 pb-7">
                    <div ref={viewDropdownRef} className="relative flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="shrink-0">
                                <img src="./images/logo/pera-logo-2.svg" alt="Logo" className="h-10 w-10" />
                            </Link>
                            <div>
                                <span className="text-sm font-normal text-gray-800 dark:text-white/90">
                                    CGSI PERA Dashboard
                                </span>
                                <span className="flex items-center gap-1 rounded text-xs font-normal text-gray-500 dark:text-gray-400">
                                    {activeView}
                                </span>
                            </div>
                        </div>

                        <div className="ml-auto">
                            <button
                                onClick={() => setViewOpen(!viewOpen)}
                                className="inline-flex size-5 items-center justify-center rounded-md border border-gray-200 text-gray-800 dark:border-gray-800 dark:text-gray-400"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" className="size-2.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.1668 6.24235L8.00016 2.07568L3.8335 6.24235M3.8335 9.75736L8.00016 13.924L12.1668 9.75736" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {viewOpen && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 border border-gray-100">
                                {views.map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => {
                                            setActiveView(view);
                                            setViewOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                            activeView === view ? "bg-gray-100 dark:bg-gray-700" : ""
                                        }`}
                                    >
                                        <span>{view}</span>
                                        {activeView === view && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* NAV CONTENT REGION */}
                <div className="no-scrollbar flex flex-col overflow-y-auto px-5 pb-10">
                    <nav>
                        {filteredNavSections.map((section) => (
                            <div key={section.group} className="mb-7">
                                <h3 className="mb-2 px-3 text-xs font-medium text-gray-800 dark:text-white/90">
                                    {section.group}
                                </h3>
                                <ul className="flex flex-col gap-0.5">
                                    {section.items.map((item) => (
                                        <li key={item.id}>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `docs-menu-item ${isActive ? "docs-menu-item-active" : "docs-menu-item-inactive"}`
                                                }
                                            >
                                                {item.label}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* ================= FIXED MOBILE DOCK PANEL (< xl) ================= */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/60 px-2 pb-safe-bottom shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
                <nav className="flex items-center justify-around h-16 max-w-md mx-auto relative">
                    
                    {/* 1. HOME */}
                    <NavLink
                        to={dockIntents.home.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-14 h-full transition-colors ${
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                            }`
                        }
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12.45 4.90342C12.1833 4.70342 11.8167 4.70342 11.55 4.90342L5.05 9.77842C4.86115 9.92006 4.75 10.1423 4.75 10.3784V18.4998C4.75 18.9141 5.08579 19.2498 5.5 19.2498H9V16.9998C9 15.343 10.3431 13.9998 12 13.9998C13.6569 13.9998 15 15.343 15 16.9998V19.2498H18.5C18.9142 19.2498 19.25 18.9141 19.25 18.4998V10.3784C19.25 10.1423 19.1389 9.92006 18.95 9.77842L12.45 4.90342ZM10.65 3.70342C11.45 3.10342 12.55 3.10342 13.35 3.70342L19.85 8.57842C20.4166 9.00334 20.75 9.67021 20.75 10.3784V18.4998C20.75 19.7425 19.7426 20.7498 18.5 20.7498H14.25C13.8358 20.7498 13.5 20.4141 13.5 19.9998V16.9998C13.5 16.1714 12.8284 15.4998 12 15.4998C11.1716 15.4998 10.5 16.1714 10.5 16.9998V19.9998C10.5 20.4141 10.1642 20.7498 9.75 20.7498H5.5C4.25736 20.7498 3.25 19.7425 3.25 18.4998V10.3784C3.25 9.67021 3.58344 9.00334 4.15 8.57842L10.65 3.70342Z" fill="currentColor"/>
                        </svg>
                        <span className="text-[10px] font-medium mt-1 tracking-tight truncate w-full text-center">
                            {dockIntents.home.label}
                        </span>
                    </NavLink>

                    {/* 2. SEARCH */}
                    <NavLink
                        to={dockIntents.search.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-14 h-full transition-colors ${
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                            }`
                        }
                    >
                        <svg className="size-5" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="currentColor"/>
                        </svg>
                        <span className="text-[10px] font-medium mt-1 tracking-tight truncate w-full text-center">
                            {dockIntents.search.label}
                        </span>
                    </NavLink>

                    {/* 3. CENTER BLUE BUTTON: CONTRIBUTE */}
                    <div className="relative w-16 h-full flex items-center justify-center -top-3.5">
                        <NavLink
                            to={dockIntents.contribute.path}
                            className={({ isActive }) =>
                                `flex items-center justify-center w-14 h-14 rounded-full shadow-md border-4 border-white dark:border-gray-900 transition-all active:scale-95 ${
                                    isActive ? "bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`
                            }
                        >
                            <svg className="size-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.9961 20.0004L11.9961 3.99902M6 14.0043L11.9998 20.0003L18 14.0043" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </NavLink>
                        <span className="absolute bottom-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap translate-y-4">
                            {dockIntents.contribute.label}
                        </span>
                    </div>

                    {/* 4. LEARN */}
                    <NavLink
                        to={dockIntents.learn.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-14 h-full transition-colors ${
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                            }`
                        }
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12.2977 3.30965C12.1077 3.22751 11.8923 3.22751 11.7023 3.30965L2.45232 7.30965C2.17775 7.42838 2 7.69891 2 7.99805C2 8.29718 2.17775 8.56771 2.45232 8.68644L5.125 9.84219V15.9259C5.125 16.0717 5.16749 16.2143 5.24727 16.3363L5.875 15.9259C5.24727 16.3363 5.24706 16.336 5.24727 16.3363L5.24814 16.3376L5.2492 16.3392L5.25188 16.3433L5.25947 16.3546C5.26553 16.3636 5.27359 16.3753 5.28365 16.3897C5.30378 16.4184 5.33196 16.4577 5.36827 16.5059C5.44085 16.6023 5.54621 16.735 5.68494 16.8917C5.96196 17.2047 6.375 17.6169 6.9293 18.0282C8.04166 18.8535 9.72592 19.6759 12 19.6759C14.2741 19.6759 15.9583 18.8535 17.0707 18.0282C17.625 17.6169 18.038 17.2047 18.3151 16.8917C18.4538 16.735 18.5591 16.6023 18.6317 16.5059C18.668 16.4577 18.6962 16.4184 18.7163 16.3897C18.7264 16.3753 18.7345 16.3636 18.7405 16.3546L18.7481 16.3433L18.7508 16.3392L18.7519 16.3376C18.7521 16.3373 18.7527 16.3363 18.125 15.9259L18.7527 16.3363C18.8325 16.2143 18.875 16.0717 18.875 15.9259V9.84219L20.5 9.13949V14.7188C20.5 15.133 20.8358 15.4688 21.25 15.4688C21.6642 15.4688 22 15.133 22 14.7188V8C22 7.99967 22 8.00033 22 8C22 7.99968 22 7.99837 22 7.99805C22 7.69891 21.8222 7.42838 21.5477 7.30965L12.2977 3.30965ZM17.375 10.4908L12.2977 12.6864C12.1077 12.7686 11.8923 12.7686 11.7023 12.6864L6.625 10.4908V15.6793C6.67243 15.7392 6.73344 15.8131 6.80814 15.8975C7.02902 16.1471 7.36658 16.4848 7.8231 16.8236C8.73237 17.4982 10.1106 18.1759 12 18.1759C13.8894 18.1759 15.2676 17.4982 16.1769 16.8236C16.6334 16.4848 16.971 16.1471 17.1919 15.8975C17.2666 15.8131 17.3276 15.7392 17.375 15.6793V10.4908ZM12 11.1809L4.63959 7.99805L12 4.81517L19.3604 7.99805L12 11.1809Z" fill="currentColor"/>
                        </svg>
                        <span className="text-[10px] font-medium mt-1 tracking-tight truncate w-full text-center">
                            {dockIntents.learn.label}
                        </span>
                    </NavLink>

                    {/* 5. MORE */}
                    <button
                        onClick={() => setMoreMobileOpen(!moreMobileOpen)}
                        className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                            moreMobileOpen || isOverflowActive
                                ? "text-blue-600 dark:text-blue-400" 
                                : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.00338 10.5017C6.83084 10.5017 7.50163 11.1725 7.50163 12C7.50163 12.8274 6.83084 13.4982 6.00338 13.4982C5.17592 13.4982 4.50513 12.8274 4.50513 12C4.50513 11.1725 5.17592 10.5017 6.00338 10.5017Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 10.5017C12.8274 10.5017 13.4982 11.1725 13.4982 12C13.4982 12.8274 12.8274 13.4982 12 13.4982C11.1725 13.4982 10.5017 12.8274 10.5017 12C10.5017 11.1725 11.1725 10.5017 12 10.5017Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17.9965 10.5017C18.824 10.5017 19.4948 11.1725 19.4948 12C19.4948 12.8274 18.824 13.4982 17.9965 13.4982C17.1691 13.4982 16.4983 12.8274 16.4983 12C16.4983 11.1725 17.1691 10.5017 17.9965 10.5017Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[10px] font-medium mt-1 tracking-tight truncate w-full text-center">
                            More
                        </span>
                    </button>

                </nav>
            </div>

            {/* ================= MOBILE BOTTOM EXPANDABLE DRAWER ================= */}
            {moreMobileOpen && (
                <div className="xl:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
                    <div 
                        ref={moreMenuRef}
                        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto rounded-t-2xl bg-white p-5 pb-safe-bottom shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-slideUp"
                    >
                        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-700" onClick={() => setMoreMobileOpen(false)} />
                        
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                More Shortcuts
                            </h4>
                            <button 
                                onClick={() => setMoreMobileOpen(false)}
                                className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600"
                            >
                                Close
                            </button>
                        </div>

                        {/* Overflow items list */}
                        <div className="grid grid-cols-1 gap-1">
                            {contextOverflowLinks.length > 0 ? (
                                contextOverflowLinks.map((item) => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                                            }`
                                        }
                                    >
                                        {item.id === "retirementgoals" ? (
                                            /* Inline specific chart trend line icon */
                                            <svg className="size-5 opacity-80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20.0005 20H5.5C4.67157 20 4 19.3284 4 18.5V4M4 15.4191L9.19963 10.2195L13.1523 14.1722L18.7431 8.58135M18.7431 8.58135L18.7471 12.1162M18.7431 8.58135L15.2115 8.58067" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            /* Default Message/Chat bubble asset icon for other list fallbacks */
                                            <svg className="size-5 opacity-80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.25 9.77344C6.25 9.35922 6.58579 9.02344 7 9.02344H17C17.4142 9.02344 17.75 9.35922 17.75 9.77344C17.75 10.1877 17.4142 10.5234 17 10.5234H7C6.58579 10.5234 6.25 10.1877 6.25 9.77344Z" fill="currentColor"/>
                                                <path d="M7 12.0234C6.58579 12.0234 6.25 12.3592 6.25 12.7734C6.25 13.1877 6.58579 13.5234 7 13.5234H12C12.4142 13.5234 12.75 13.1877 12.75 12.7734C12.75 12.3592 12.4142 12.0234 12 12.0234H7Z" fill="currentColor"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M2.5 5.53125C2.5 4.28861 3.50736 3.28125 4.75 3.28125H19.25C20.4926 3.28125 21.5 4.28861 21.5 5.53125V16.0796C21.5 17.3223 20.4926 18.3296 19.25 18.3296H15.1014L12.6025 21.6956C12.461 21.8861 12.2377 21.9985 12.0003 21.9985C11.763 21.9985 11.5396 21.8861 11.3981 21.6956L8.89931 18.3296H4.75C3.50736 18.3296 2.5 17.3223 2.5 16.0796V5.53125ZM4.75 4.78125C4.33579 4.78125 4 5.11704 4 5.53125V16.0796C4 16.4938 4.33579 16.8296 4.75 16.8296H9.2766C9.51396 16.8296 9.73731 16.942 9.87879 17.1326L12.0003 19.9903L14.1219 17.1326C14.2634 16.942 14.4867 16.8296 14.7241 16.8296H19.25C19.6642 16.8296 20 16.4938 20 16.0796V5.53125C20 5.11704 19.6642 4.78125 19.25 4.78125H4.75Z" fill="currentColor"/>
                                            </svg>
                                        )}
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))
                            ) : (
                                <p className="text-xs text-center text-gray-400 py-4">No remaining shortcuts available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}