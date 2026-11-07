import { useState, useEffect } from "react";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { Link } from "react-router";

// Defined types for distinct context styling
type NotificationType = "user" | "system" | "market" | "contribution";

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  category: string;
  timeAgo: string;
  isUnread: boolean;
  user?: {
    name: string;
    avatar: string;
    statusColor: string;
  };
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "contribution",
    title: "Contribution Successful",
    message: "Your monthly recurring contribution of ₱5,000.00 has been credited to your Equity PERA Fund.",
    category: "Contributions",
    timeAgo: "5 min ago",
    isUnread: true,
  },
  {
    id: 2,
    type: "market",
    title: "Market Alert",
    message: "BDO PERA Equity Fund NAVPU increased by +2.4% following today's market close.",
    category: "Market Watch",
    timeAgo: "24 min ago",
    isUnread: true,
  },
  {
    id: 3,
    type: "user",
    title: "Advisor Message",
    message: "sent you an updated asset rebalancing proposal for your retirement timeline.",
    category: "Consultation",
    timeAgo: "1 hr ago",
    isUnread: false,
    user: {
      name: "Maria Santos (CFA)",
      avatar: "/images/user/user-02.jpg",
      statusColor: "bg-success-500",
    },
  },
  {
    id: 4,
    type: "system",
    title: "Security Update",
    message: "Your dynamic PERA Annual Contribution limit has been verified. You can contribute up to ₱200,000 this calendar year.",
    category: "System",
    timeAgo: "5 hr ago",
    isUnread: false,
  },
  {
    id: 5,
    type: "system",
    title: "Tax Credit Earned",
    message: "Your 5% Digital Tax Credit certificate for last year's PERA contributions is now downloadable.",
    category: "Tax Incentives",
    timeAgo: "1 day ago",
    isUnread: false,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  // Prevent background body scrolling when mobile full-screen panel is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Dynamic Asset and Icon Resolver Component
  const NotificationVisual = ({ item }: { item: NotificationItem }) => {
    if (item.type === "user" && item.user) {
      return (
        <span className="relative block w-10 h-10 rounded-full z-1 max-w-10 flex-shrink-0">
          <img width={40} height={40} src={item.user.avatar} alt={item.user.name} className="w-full h-full overflow-hidden rounded-full object-cover" />
          <span className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900 ${item.user.statusColor}`}></span>
        </span>
      );
    }

    // Custom Icon styles mapped by PERA category rules
    const configs = {
      contribution: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        svg: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        ),
      },
      market: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        svg: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        ),
      },
      system: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        svg: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ),
      },
      user: { bg: "", text: "", svg: null } // Fallback handler override
    };

    const current = configs[item.type] || configs.system;

    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${current.bg} ${current.text}`}>
        {current.svg}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${!notifying ? "hidden" : "flex"}`}>
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor"/>
        </svg>
      </button>

      {/* ================= CUSTOM NATIVE MOBILE SLIDE PANELS (< lg) ================= */}
      <div className="lg:hidden">
        {/* Backdrop Tint Overlay */}
        <div
          className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeDropdown}
        />

        {/* Full-Screen Drawer: Right-to-Left Native App Sheet */}
        <div
    className={`fixed top-0 right-0 bottom-0 z-[9999] flex h-full w-full flex-col bg-white p-4 shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-dark mobile-dropdown-sheet ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`} // <-- ADDED 'mobile-dropdown-sheet' HERE
  >
          {/* Mobile Navigation Header */}
          <div className="relative flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={closeDropdown}
              className="flex items-center justify-center p-2 -ml-2 text-gray-500 rounded-full active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <h5 className="text-xl font-semibold text-gray-800 dark:text-gray-200 absolute left-1/2 -translate-x-1/2">
              Notifications
            </h5>

            <button
              onClick={handleMarkAllRead}
              className="flex items-center justify-center p-2 -mr-2 text-gray-500 rounded-full active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
              title="Mark all as read"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.9768 9.99417L10.9649 14.006L9.02327 12.0644M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z" stroke="#323544" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            </button>
          </div>

          {/* Independent Native Mobile Scroll Container */}
          <ul className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar py-2 text-left">
            {notifications.map((item) => (
              <li key={item.id} className={`${item.isUnread ? "bg-blue-50/40 dark:bg-blue-500/[0.02]" : ""}`}>
                <button
                  onClick={closeDropdown}
                  className="w-full text-left flex gap-3 border-b border-gray-100 p-3 px-4.5 py-3 active:bg-gray-100 dark:border-gray-800 dark:active:bg-white/5 transition-colors"
                >
                  <NotificationVisual item={item} />
                  
                  <span className="block flex-1">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.type === "user" ? (
                        <>
                          <span className="font-semibold text-gray-800 dark:text-white/90">{item.user?.name}</span>
                          <span> {item.message}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-800 dark:text-white/90 block text-theme-base mb-0.5">{item.title}</span>
                          <span className="text-gray-600 dark:text-gray-400">{item.message}</span>
                        </>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-gray-400 text-theme-xs">
                      <span className="font-medium text-gray-500 dark:text-gray-400">{item.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.timeAgo}</span>
                    </span>
                  </span>
                  
                  {item.isUnread && (
                    <span className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Action Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
            <Link
              to="/"
              onClick={closeDropdown}
              className="block w-full py-3.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-xl active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              View All History
            </Link>
          </div>
        </div>
      </div>

      {/* ================= UNTOUCHED DESKTOP DROPDOWN (>= lg) ================= */}
      <div className="hidden lg:block">
        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="absolute -right-[240px] mt-[17px] flex h-[520px] w-[380px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark lg:right-0"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleMarkAllRead} 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mr-2 font-medium"
              >
                Mark all as read
              </button>
            </div>
          </div>
          
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar flex-1">
            {notifications.map((item) => (
              <li key={item.id} className={`${item.isUnread ? "bg-blue-50/30 dark:bg-blue-500/[0.01]" : ""}`}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 relative group"
                >
                  <NotificationVisual item={item} />

                  <span className="block text-left flex-1">
                    <span className="mb-1 block text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.type === "user" ? (
                        <>
                          <span className="font-semibold text-gray-800 dark:text-white/90">{item.user?.name}</span>
                          <span> {item.message}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-800 dark:text-white/90 block mb-0.5">{item.title}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{item.message}</span>
                        </>
                      )}
                    </span>

                    <span className="flex items-center gap-2 text-gray-400 text-theme-xs">
                      <span className="font-medium text-gray-500 dark:text-gray-400">{item.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.timeAgo}</span>
                    </span>
                  </span>

                  {item.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 self-center flex-shrink-0 ml-1" />
                  )}
                </DropdownItem>
              </li>
            ))}
          </ul>

          <Link
            to="/"
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            View All History
          </Link>
        </Dropdown>
      </div>
    </div>
  );
}