import { useState, useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface PERAAccount {
  name: string;
  accountNumber: string;
}


// Sub-accounts array for slider state management
const subAccounts: PERAAccount[] = [
  { name: "PERA 1", accountNumber: "•••• •••• •••• 5332" },
  { name: "PERA 2", accountNumber: "•••• •••• •••• 1104" },
  { name: "PERA 3", accountNumber: "•••• •••• •••• 9867" },
  { name: "PERA 4", accountNumber: "•••• •••• •••• 4431" },
  { name: "PERA 5", accountNumber: "•••• •••• •••• 8820" },
];

export default function TotalPortfolioOverview() {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Slider state management
  const [activeIndex, setActiveIndex] = useState(0);
  const currentAccount = subAccounts[activeIndex];
  const isBeginning = activeIndex === 0;
  const isEnd = activeIndex === subAccounts.length - 1;

  // Refs for outside click handling
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useClickOutside(currencyDropdownRef, () => setIsCurrencyOpen(false));
  useClickOutside(dateDropdownRef, () => setIsDateOpen(false));

  const handlePrev = () => {
    if (!isBeginning) setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isEnd) setActiveIndex((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAccount.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const chartOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 70,
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.65,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
    },
    tooltip: {
      enabled: false,
    },
  };

  const chartSeries = [
    {
      name: "Balance",
      data: [
        20, 24, 23, 25, 30, 35, 40, 30, 32, 33, 29, 28, 27, 29, 45, 58, 70, 80,
        72, 68, 85, 79, 77, 75,
      ],
    },
  ];

  return (
    <div className="rounded-[18px] border border-gray-200 bg-gray-100 p-1.5 dark:border-gray-800 dark:bg-white/3">
      <div className="rounded-xl bg-white p-6 pb-8 dark:bg-gray-900">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Total Portfolio Value
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overview of your PERA portfolio
            </p>
          </div>
        </div>
        <div className="flex items-end border-b border-dashed border-gray-200 pb-7 dark:border-gray-800">
          <div>
            <h3 className="mb-2 text-3xl font-medium text-gray-800 dark:text-white/90">
              219,857.00
            </h3>
            <p className="flex items-center gap-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 font-medium text-success-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.9974 2.66602L7.9974 13.3336M4 6.66334L7.99987 2.66602L12 6.66334"
                    stroke="#039855"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                3.2%
              </span>
              than last month
            </p>
          </div>
          {/* Chart */}
          <div className="ml-auto w-25 sm:w-[150px]">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={70}
            />
          </div>
        </div>
        <div className="pt-7.5">
          {/* Content */}
          <div className="flex flex-col sm:items-center gap-2 sm:flex-row">
            {/* Label */}
            <p className="shrink-0 text-sm text-gray-700 dark:text-gray-400">
              PERA Account:
            </p>
            <div className="flex items-center gap-2">
              {/* Account Number */}
              <p className="shrink-0 text-lg font-medium text-gray-700 dark:text-gray-400">
                {currentAccount.accountNumber}
              </p>

              {/* Copy Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="relative flex h-8 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 shadow-xs hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                >
                  {!isCopied ? (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="absolute"
                    >
                      <path
                        d="M14.1559 14.1628H7.08724C6.39688 14.1628 5.83724 13.6032 5.83724 12.9128V5.84416M14.1559 14.1628V15.4161C14.1559 16.1065 13.5963 16.6661 12.9059 16.6661H4.58398C3.89363 16.6661 3.33398 16.1065 3.33398 15.4161V7.09416C3.33398 6.4038 3.89363 5.84416 4.58398 5.84416H5.83724M14.1559 14.1628H15.4144C16.1048 14.1628 16.6644 13.6032 16.6644 12.9128V4.58398C16.6644 3.89363 16.1048 3.33398 15.4144 3.33398H7.08724C6.39688 3.33398 5.83724 3.89363 5.83724 4.58398V5.84416"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="absolute text-success-500"
                    >
                      <path
                        d="M16.6668 5L7.50016 14.1667L3.3335 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Diagonal Arrow Action Icon Button */}
              <button
                type="button"
                className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-700 shadow-xs hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
              >
                <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.9203 6.0505C18.7834 5.86991 18.5665 5.75324 18.3223 5.75315L9.32695 5.75C8.91265 5.74985 8.57667 6.08545 8.57667 6.49958C8.57653 6.9137 8.91212 7.24954 9.32643 7.24968L16.5172 7.2522L5.79779 17.9716C5.5049 18.2645 5.5049 18.7394 5.79779 19.0323C6.09069 19.3252 6.56556 19.3252 6.85845 19.0323L17.5725 8.31828L17.5748 15.4945C17.5749 15.9086 17.9109 16.2442 18.3252 16.2441C18.7395 16.244 19.0752 15.9081 19.0751 15.494L19.0722 6.56074C19.0853 6.38214 19.0346 6.19976 18.9203 6.0505Z" fill="currentColor" />
                </svg>
              </button>

              {/* Chevrons placed on the right side of the diagonal arrow */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  id="card-slider-prev"
                  disabled={isBeginning}
                  onClick={handlePrev}
                  className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.58464 3.83325L5.41797 7.99992L9.58464 12.1666"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  id="card-slider-next"
                  disabled={isEnd}
                  onClick={handleNext}
                  className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.91797 12.1666L10.0846 7.99992L5.91797 3.83325"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-3.5 pt-5 pb-4">
        <button className="flex h-11 flex-1 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.3777 10.4603C2.9776 10.3531 2.74017 9.94185 2.84737 9.54175C3.3886 7.52186 4.58121 5.737 6.24022 4.464C7.89924 3.19099 9.93195 2.50098 12.0231 2.50098C14.1142 2.50098 16.1469 3.19099 17.806 4.464C19.2116 5.54261 20.2825 6.98868 20.906 8.63384L21.6667 7.28259C21.8699 6.92165 22.3273 6.79378 22.6882 6.99699C23.0491 7.2002 23.177 7.65754 22.9738 8.01848L21.2392 11.0995C21.1416 11.2729 20.9791 11.4003 20.7875 11.4539C20.596 11.5074 20.391 11.4827 20.2176 11.3851L17.1369 9.65037C16.776 9.44713 16.6482 8.98979 16.8514 8.62886C17.0546 8.26794 17.512 8.1401 17.8729 8.34334L19.5481 9.28664C19.0305 7.8511 18.1109 6.58872 16.8928 5.65403C15.4958 4.58203 13.784 4.00098 12.0231 4.00098C10.2621 4.00098 8.55041 4.58203 7.15337 5.65403C5.75632 6.72602 4.75203 8.22904 4.29626 9.92998C4.18906 10.3301 3.7778 10.5675 3.3777 10.4603Z" fill="#FFFFFF" />
            <path d="M20.6712 13.5393C21.0713 13.6465 21.3087 14.0577 21.2015 14.4578C20.6603 16.4777 19.4677 18.2626 17.8087 19.5356C16.1497 20.8086 14.117 21.4986 12.0258 21.4986C9.93466 21.4986 7.90195 20.8086 6.24294 19.5356C4.83447 18.4548 3.76218 17.0051 3.13924 15.3559L2.37242 16.718C2.16921 17.0789 1.71188 17.2068 1.35094 17.0035C0.989997 16.8003 0.862131 16.343 1.06534 15.9821L2.79997 12.901C2.89756 12.7277 3.06001 12.6002 3.25158 12.5467C3.44316 12.4931 3.64817 12.5179 3.8215 12.6155L6.9022 14.3502C7.26313 14.5534 7.39097 15.0108 7.18773 15.3717C6.9845 15.7326 6.52715 15.8604 6.16623 15.6572L4.50371 14.7211C5.02192 16.1532 5.94026 17.4126 7.15608 18.3455C8.55313 19.4175 10.2649 19.9986 12.0258 19.9986C13.7868 19.9986 15.4985 19.4175 16.8955 18.3455C18.2926 17.2735 19.2969 15.7705 19.7526 14.0696C19.8598 13.6695 20.2711 13.432 20.6712 13.5393Z" fill="#FFFFFF" />
            <path d="M12.0244 7.80814C12.4386 7.80814 12.7744 8.14393 12.7744 8.55814V8.72712C13.5229 8.91629 14.0767 9.59415 14.0767 10.4014C14.0767 10.8156 13.741 11.1514 13.3267 11.1514C12.9125 11.1514 12.5767 10.8156 12.5767 10.4014C12.5767 10.2761 12.4752 10.1746 12.3499 10.1746H11.9549C11.6882 10.1746 11.4721 10.3907 11.4721 10.6574C11.4721 10.8586 11.5969 11.0387 11.7854 11.1094L12.7902 11.4862C13.5641 11.7765 14.0767 12.5163 14.0767 13.3428C14.0767 14.1988 13.5343 14.9281 12.7744 15.2057V15.4419C12.7744 15.8561 12.4386 16.1919 12.0244 16.1919C11.6102 16.1919 11.2744 15.8561 11.2744 15.4419V15.273C10.526 15.0838 9.97209 14.406 9.97209 13.5988C9.97209 13.1846 10.3079 12.8488 10.7221 12.8488C11.1363 12.8488 11.4721 13.1846 11.4721 13.5988C11.4721 13.724 11.5736 13.8256 11.6989 13.8256H12.0939C12.3606 13.8256 12.5767 13.6094 12.5767 13.3428C12.5767 13.1415 12.4519 12.9614 12.2635 12.8907L11.2586 12.5139C10.4848 12.2237 9.97209 11.4839 9.97209 10.6574C9.97209 9.80135 10.5145 9.07204 11.2744 8.7944V8.55814C11.2744 8.14393 11.6102 7.80814 12.0244 7.80814Z" fill="#FFFFFF" />
          </svg>

          Rebalance
        </button>
        <button className="flex h-11 flex-1 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6.75C2 5.50736 3.00736 4.5 4.25 4.5H19.75C20.9926 4.5 22 5.50736 22 6.75V12.338C21.5725 11.8027 21.0667 11.3327 20.5 10.9453V6.75C20.5 6.33579 20.1642 6 19.75 6H4.25C3.83579 6 3.5 6.33579 3.5 6.75V17.25C3.5 17.6642 3.83579 18 4.25 18H9.88753C9.99392 18.5241 10.1599 19.0266 10.3782 19.5H4.25C3.00736 19.5 2 18.4926 2 17.25V6.75Z" fill="#323544" />
            <path d="M18.25 9.75H5.75C5.33579 9.75 5 9.41421 5 9C5 8.58579 5.33579 8.25 5.75 8.25H18.25C18.6642 8.25 19 8.58579 19 9C19 9.41421 18.6642 9.75 18.25 9.75Z" fill="#323544" />
            <path d="M10.9453 12.75C11.3172 12.2059 11.7652 11.718 12.2741 11.3017C12.1892 11.2683 12.0967 11.25 12 11.25H5.75C5.33579 11.25 5 11.5858 5 12C5 12.4142 5.33579 12.75 5.75 12.75H10.9453Z" fill="#323544" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.6565 15.2815C20.6565 16.4983 20.1173 17.5893 19.2649 18.3285V21.25C19.2649 21.5473 19.0893 21.8165 18.8172 21.9363C18.5452 22.0562 18.228 22.004 18.0087 21.8034L16.6265 20.5392L15.2443 21.8034C15.0249 22.004 14.7077 22.0562 14.4357 21.9363C14.1637 21.8165 13.9881 21.5473 13.9881 21.25V18.331C13.1339 17.5918 12.5935 16.4997 12.5935 15.2815C12.5935 13.0549 14.3985 11.25 16.625 11.25C18.8515 11.25 20.6565 13.0549 20.6565 15.2815ZM16.625 12.75C15.2269 12.75 14.0935 13.8834 14.0935 15.2815C14.0935 16.6795 15.2269 17.8129 16.625 17.8129C18.0231 17.8129 19.1565 16.6795 19.1565 15.2815C19.1565 13.8834 18.0231 12.75 16.625 12.75Z" fill="#323544" />
          </svg>

          Reward
        </button>
        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900">
          <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.7547 20.9888C11.8923 21.1495 12.0966 21.2514 12.3247 21.2514L12.3264 21.2514C12.5188 21.2518 12.7113 21.1786 12.8581 21.0319L18.8583 15.0359C19.1513 14.7431 19.1514 14.2682 18.8586 13.9752C18.5659 13.6822 18.091 13.6821 17.798 13.9749L13.0747 18.6948L13.0747 4.5C13.0747 4.08579 12.7389 3.75 12.3247 3.75C11.9105 3.75 11.5747 4.08579 11.5747 4.5L11.5747 18.6883L6.85829 13.9749C6.5653 13.6821 6.09043 13.6822 5.79763 13.9752C5.50483 14.2682 5.50498 14.7431 5.79796 15.0359L11.7547 20.9888Z" fill="#323544"/>
</svg>

        </button>
      </div>
    </div>
  );
}