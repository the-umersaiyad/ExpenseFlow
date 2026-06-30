"use client";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    popoverClass: 'expense-tour-theme',
    steps: [
      { 
        element: window.innerWidth < 768 ? '#tour-sidebar-trigger-mobile' : '#tour-sidebar', 
        popover: { title: 'Navigation', description: 'Access different pages like Transactions and Categories here.', side: "right", align: 'start' } 
      },
      { 
        element: '#tour-summary-cards', 
        popover: { title: 'Financial Overview', description: 'Quickly see your total balance, income, and expenses for the selected period.', side: "bottom", align: 'start' } 
      },
      { 
        element: '#tour-analytics', 
        popover: { title: 'Analytics', description: 'Track your daily cash flow trends visually.', side: "top", align: 'center' } 
      },
      { 
        element: window.innerWidth < 768 ? '#tour-new-transaction-mobile' : '#tour-new-transaction', 
        popover: { title: 'Quick Add', description: 'Click here to instantly add a new income or expense transaction.', side: "left", align: 'center' } 
      },
    ]
  });
  driverObj.drive();
};
