# F NET WATER HUB

# WEB APPLICATION

## 1. PROJECT OVERVIEW

F Net Water Hub is a technology-driven water supply and dispenser management platform designed to make water ordering, delivery, customer management, inventory management, dispenser management, payments, and business operations easier to manage digitally.

The first phase of the project will focus exclusively on developing a **responsive web application** that can be accessed from computers, tablets, and mobile browsers.

The web platform will provide different interfaces and permissions for:

* Administrator
* Manager
* Agent
* Driver
* Customer

The system will be designed with scalability in mind so that the future mobile application can connect to the same backend infrastructure.

The application will also maintain structured operational records for bottle movement, dispenser installment payments, customer balances, referral rewards, delivery activities, payment transactions, and inventory adjustments to improve accountability across the business.

---

## 2. PROJECT OBJECTIVES

The web application will be developed to:

* Digitize F Net Water Hub's daily operations.
* Allow customers to conveniently order water online.
* Manage water deliveries and delivery locations.
* Track bottles and dispensers.
* Manage dispenser installment payments.
* Manage customers, drivers, agents, and managers.
* Track payments and outstanding balances.
* Manage referrals and customer rewards.
* Provide business reports and analytics.
* Improve inventory visibility.
* Provide centralized administrative control.
* Maintain proper records of bottle movement between the company, drivers, and customers.
* Improve accountability for payments, stock adjustments, rewards, and dispenser transactions.
* Create a foundation for the future F Net Water Hub mobile application.

---

## 3. WEB APPLICATION USER ROLES

The system will contain five primary user roles.

### 3.1 Administrator

The administrator will have the highest level of access.

The administrator can:

* Manage all users.
* Create, edit, deactivate, and manage user accounts.
* Manage customers.
* Manage drivers.
* Manage agents.
* Manage managers.
* Manage products.
* Manage bottles.
* Manage dispensers.
* Manage orders.
* Manage deliveries.
* Manage inventory.
* Manage payments.
* Manage dispenser payment plans.
* Manage referrals and rewards.
* Monitor tracker information.
* View reports and analytics.
* Manage system settings.
* Review major inventory adjustments.
* Review payment reversals and corrections.
* View system audit records.
* Manage operational business rules where applicable.

---

## 4. ADMINISTRATOR DASHBOARD

The administrator dashboard will provide an overview of the company's operations.

### Dashboard Statistics

The dashboard will display:

* Total Customers
* Active Customers
* New Customers
* Total Orders
* Pending Orders
* Completed Orders
* Total Deliveries
* Pending Deliveries
* Completed Deliveries
* Total Revenue
* Outstanding Payments
* Available Water Bottles
* Empty Bottles
* Damaged Bottles
* Available Dispensers
* Installed Dispensers
* Dispensers on Payment Plans
* Successful Referrals
* Free Bottles Earned
* Tracker Alerts

The dashboard will also provide quick access to important operational activities and alerts.

Additional administrative alerts may include:

* Overdue dispenser installments
* Unreconciled bottle shortages
* Failed deliveries
* Payment reversals
* Stock adjustments
* Lost bottles
* Damaged bottles
* Suspicious or unusual account activity

---

## 5. CUSTOMER WEB PORTAL

Customers will have their own secure account.

Customers will be able to:

* Register an account.
* Log in and log out.
* Manage their profile.
* Add and manage delivery addresses.
* Order water.
* Request bottle refills.
* Schedule deliveries.
* View active orders.
* Track delivery status.
* View order history.
* View payment history.
* Make payments.
* View outstanding balances.
* Apply for dispenser installment plans.
* View dispenser payment information.
* Report dispenser faults.
* View referral information.
* Refer new customers.
* View rewards.
* Redeem eligible free-bottle rewards.
* View refillable bottles currently recorded against their account.
* Receive notifications.

---

## 6. CUSTOMER PROFILE

Each customer profile will contain relevant information including:

* Customer ID
* Full Name
* Phone Number
* Email Address
* Ghana Digital Address
* GPS Location
* Delivery Addresses
* Customer Status
* Dispenser Status
* Payment Plan Status
* Refillable Bottles Held
* Outstanding Bottle Balance
* Take-Away Bottles Purchased
* Referral Code
* Referral Count
* Successful Referrals
* Free Bottle Balance
* Order History
* Payment History

---

## 7. WATER ORDERING SYSTEM

Customers will be able to place water orders directly through the web application.

### Water Products

The system can support:

* Refillable Water Bottles
* Take-Away Water Bottles
* Bulk Water Supply

### Customer Ordering Process

The customer will:

1. Select a water product.
2. Select quantity.
3. Select delivery address.
4. Choose a delivery date/time where applicable.
5. Add delivery instructions.
6. Review the order.
7. Make payment or select an available payment option.
8. Apply an eligible reward where applicable.
9. Submit the order.
10. Receive order confirmation.

For refillable bottle orders, the system will also determine the expected number of empty bottles to be returned during delivery.

An order will maintain an appropriate status throughout its lifecycle.

Possible order statuses may include:

* Pending
* Confirmed
* Processing
* Assigned
* Out for Delivery
* Delivered
* Failed
* Cancelled

Customers may cancel eligible orders while they are still within the permitted cancellation stage. Orders that have already been delivered cannot be cancelled.

---

## 8. REFILLABLE BOTTLE MANAGEMENT

The system will support the company's reusable bottle exchange process.

Customers will be able to request refills.

Drivers will be able to:

* Deliver filled bottles.
* Collect empty bottles.
* Record bottle exchanges.
* Record bottle shortages.
* Record damaged bottles.
* Update delivery status.

The system will maintain records of:

* Filled bottles.
* Empty bottles.
* Bottles currently with customers.
* Bottles assigned to drivers.
* Bottles in transit.
* Returned bottles.
* Damaged bottles.
* Lost bottles.

### Refillable Bottle Exchange Rule

Refillable bottle orders will normally operate using an exchange model.

For example, where a customer receives five refillable bottles, the expected return will normally be five empty refillable bottles.

The driver will record:

* Number of filled bottles delivered
* Number of empty bottles collected
* Number of bottles not returned
* Number of damaged bottles returned
* Any relevant remarks

Where fewer empty bottles are returned than expected, the difference will be recorded against the customer's account as a **bottle shortage or outstanding bottle balance**.

The shortage will not automatically disappear after delivery.

It may later be:

* Reconciled when the customer returns the bottle.
* Converted into a bottle charge according to company policy.
* Written off or adjusted by an authorized manager or administrator.

Every adjustment will maintain a history for accountability.

---

## 9. TAKE-AWAY BOTTLE MANAGEMENT

Take-away bottles will be treated as permanent customer purchases.

The system will allow the company to:

* Manage take-away bottle products.
* Record sales.
* Track quantities sold.
* Monitor inventory.
* View sales history.

Take-away bottles will not normally create an empty-bottle return obligation because ownership passes to the customer after purchase.

---

## 10. DELIVERY MANAGEMENT

The platform will provide a centralized delivery management system.

### Customer

Customers can:

* Select delivery locations.
* Save multiple addresses.
* Share GPS location.
* Add delivery instructions.

### Address Types

The system will support:

* Home
* Office
* Shop
* School
* Warehouse
* Other

### Delivery Instructions

Customers can provide instructions such as:

* Call upon arrival.
* Leave at reception.
* Deliver to back gate.
* Contact security.
* Other delivery instructions.

Every delivery will be linked to the relevant customer and order.

A completed delivery should record relevant operational information including:

* Driver
* Customer
* Order
* Delivery date/time
* Bottles delivered
* Empty bottles collected
* Payment collected where applicable
* Delivery status
* Delivery remarks

### Failed Deliveries

When a delivery cannot be completed, the driver will select or provide a reason.

Possible reasons include:

* Customer unavailable
* Customer cancelled
* Incorrect location
* Unable to contact customer
* Vehicle problem
* Payment issue
* Insufficient stock
* Other operational reason

Products assigned to a failed delivery must be reconciled before being returned to available inventory.

A failed delivery will therefore not automatically be treated as a completed sale.

---

## 11. DRIVER PORTAL

Drivers will have a dedicated dashboard.

Drivers can:

* View assigned deliveries.
* View delivery details.
* View customer information required for delivery.
* View delivery location.
* Update delivery status.
* Record bottle exchanges.
* Collect empty bottles.
* Record collected payments where applicable.
* Record damaged bottles.
* Record bottle shortages.
* Record reasons for failed deliveries.
* View delivery history.

### Driver Dashboard

The dashboard will display:

* Today's Deliveries
* Pending Deliveries
* Completed Deliveries
* Delivery History
* Assigned Orders

### Delivery Status

Deliveries can move through statuses such as:

* Pending
* Assigned
* Out for Delivery
* Delivered
* Failed Delivery
* Cancelled

Drivers will record operational events but will not normally have permission to manually change overall inventory quantities or modify completed historical financial records.

---

## 12. MANAGER PORTAL

Managers will be responsible for supervising daily operations.

Managers can:

* View daily orders.
* Monitor deliveries.
* Assign drivers.
* Monitor driver performance.
* Monitor inventory.
* Review customer requests.
* Follow up on outstanding payments.
* Handle customer complaints.
* Monitor staff activities.
* Review operational reports.
* Review bottle shortages.
* Reconcile failed deliveries.
* Review authorized inventory adjustments.
* Monitor overdue dispenser installments.

### Manager Dashboard

The dashboard will include:

* Daily Orders
* Pending Deliveries
* Completed Deliveries
* Driver Performance
* Inventory Status
* Customer Requests
* Outstanding Payments
* Bottle Shortages
* Overdue Installments
* Operational Alerts

---

## 13. AGENT PORTAL

Agents will help the company acquire and manage customers.

Agents can:

* Register customers.
* View customers they registered.
* Generate referrals.
* Track referral activity.
* View orders generated through their referrals.
* View commissions earned where applicable.
* Support customers.

### Agent Dashboard

The dashboard will display:

* Customers Registered
* Referrals
* Successful Referrals
* Orders Generated
* Commissions Earned

Agents will only have access to information necessary to perform their assigned responsibilities.

---

## 14. INVENTORY MANAGEMENT

The system will provide centralized inventory management.

### Water Bottle Inventory

The system will track:

* Filled Bottles
* Empty Bottles
* Bottles With Customers
* Bottles Assigned to Drivers
* Bottles in Transit
* Returned Bottles
* Damaged Bottles
* Lost Bottles

### Dispenser Inventory

The system will track:

* Available Dispensers
* Installed Dispensers
* Dispensers on Payment Plans
* Fully Paid Dispensers
* Faulty Dispensers

Inventory quantities will be updated based on relevant transactions and operational activities.

### Inventory Movement

Rather than relying only on manually edited stock totals, important bottle movements will be recorded as inventory transactions.

Examples include:

* Filled bottle dispatched
* Filled bottle delivered
* Empty bottle collected
* Empty bottle returned
* Bottle damaged
* Bottle lost
* Bottle moved to customer
* Bottle returned from customer
* Inventory adjustment

Drivers will record operational events such as deliveries and bottle collections.

Managers and administrators will handle authorized inventory corrections.

Major or sensitive inventory adjustments may require administrator authorization.

Every manual stock adjustment should include:

* Previous quantity
* New quantity or adjustment quantity
* Reason
* User responsible
* Date and time

---

## 15. DISPENSER MANAGEMENT

The company will be able to manage dispensers provided to customers.

Each dispenser record can contain:

* Dispenser ID
* Customer
* Installation Date
* Dispenser Status
* Total Cost
* Amount Paid
* Outstanding Balance
* Payment Plan
* Next Payment Date
* Payment History
* Ownership Status
* Maintenance Status

Possible dispenser statuses may include:

* Available
* Reserved
* Installed
* Under Maintenance
* Faulty
* Retrieved
* Retired

The system will distinguish between the physical location/status of the dispenser and its ownership status.

---

## 16. DISPENSER INSTALLMENT PLAN

Customers can obtain dispensers through installment payments.

The system will track:

* Total Dispenser Cost
* Initial Payment
* Amount Paid
* Outstanding Balance
* Installment Amount
* Payment Frequency
* Payment History
* Next Payment Date
* Payment Status
* Payment Reminders
* Ownership Status

Possible installment statuses may include:

* Pending
* Active
* Due Soon
* Overdue
* Fully Paid
* Suspended
* Defaulted
* Cancelled

Once the full amount has been paid, the system can mark the dispenser as fully paid and eligible for ownership transfer according to the company's policy.

An overdue payment will not automatically delete the customer's payment plan.

Instead, the system may:

* Mark the installment as overdue.
* Notify the customer.
* Notify the manager.
* Record the number of overdue days.
* Allow authorized staff to follow up.
* Apply company-approved action where necessary.

Until all required payments and conditions are completed, the dispenser may remain recorded as:

**Company Owned – Installment Plan**

After full payment and the required approval, its ownership status may change to:

**Customer Owned**

---

## 17. SMART DISPENSER TRACKING

The web application will include the management interface for smart dispenser trackers.

Where compatible tracking hardware/API is available, the system can display information such as:

* Dispenser ID
* Customer ID
* GPS Location
* Water Level
* Daily Usage
* Last Refill Date
* Battery Status
* Online/Offline Status

### Tracker Alerts

The system will support alerts for:

* Low Water Level
* Dispenser Relocated
* Device Offline
* Maintenance Required
* Tampering Alert

**Important:** Physical tracker hardware, installation, SIM/data charges, GPS devices, sensors, and third-party IoT services are not included in the GH₵12,000 development cost unless separately agreed.

The Phase 1 system may therefore provide the software structure and interface necessary for future IoT integration without requiring physical tracker hardware during the initial web application development.

---

## 18. PAYMENT SYSTEM

The platform will support recording and processing customer payments through available payment integrations.

### Supported Payment Methods

The system is planned to support:

* MTN Mobile Money
* Telecel Cash
* AirtelTigo Money
* Bank Transfer
* Cash
* Debit/Credit Card

Actual gateway availability and API requirements will determine which payment methods can be fully automated during Phase 1.

### Payment Features

* Online payments
* Payment confirmation
* Payment receipts
* Payment history
* Outstanding balance tracking
* Payment reminders
* Dispenser installment payments
* Order payment status
* Cash-on-delivery recording where permitted
* Payment reversals/refunds
* Transaction reference tracking

### Cash Payments and Cash-on-Delivery

Where cash payment or cash-on-delivery is permitted:

1. The driver or authorized staff member records the amount received.
2. The payment is linked to the corresponding customer and order.
3. The transaction records who collected the money and when.
4. Management can subsequently reconcile the cash received.

Drivers will not have unrestricted permission to modify previously completed financial records.

### Payment Reversals and Refunds

Completed payment records should not simply be deleted.

Where a payment must be reversed, corrected, or refunded, the system will create an appropriate reversal or refund record so that the original transaction remains traceable.

---

## 19. REFERRAL & REWARD SYSTEM

Every eligible customer can receive a referral code and referral link.

### Referral Process

A referral becomes successful when:

1. A new customer registers.
2. The new customer places an order.
3. Payment is completed.

### Reward

**Every 5 successful referrals = 1 free water bottle.**

The system will automatically track eligible referrals and update the customer's reward balance.

### Referral Dashboard

Customers can view:

* Referral Code
* Referral Link
* Total Referrals
* Successful Referrals
* Free Bottles Earned
* Free Bottles Available
* Free Bottles Redeemed
* Referral History
* Reward Status

### Reward Redemption

When a customer earns a free bottle, the reward will be credited to the customer's reward balance.

During an eligible order, the customer may redeem the available free-bottle reward.

Once redeemed, the available balance will automatically decrease.

A referral should only qualify as successful after the required purchase and payment conditions have been completed.

Cancelled, failed, refunded, fraudulent, or otherwise invalid qualifying transactions may be removed from referral eligibility according to company policy.

---

## 20. NOTIFICATION SYSTEM

The web platform will provide system notifications.

### Customer Notifications

Examples:

* Order Confirmed
* Delivery Assigned
* Delivery Completed
* Payment Due
* Payment Received
* Payment Overdue
* Water Refill Reminder
* Free Bottle Earned
* Reward Redeemed
* Dispenser Payment Reminder
* Bottle Shortage Notification

### Driver Notifications

* New Delivery Assigned
* Delivery Updated
* Customer Location Updated
* Delivery Cancelled

### Manager Notifications

* Low Inventory
* Outstanding Payment
* Delivery Delay
* Failed Delivery
* New Customer Request
* Bottle Shortage
* Overdue Dispenser Installment

### Administrator Notifications

* Revenue Summary
* Inventory Alerts
* Tracker Alerts
* Payment Alerts
* Operational Alerts
* Significant Inventory Adjustment

SMS, WhatsApp, email, or other third-party notification services may require separate service/API charges.

---

## 21. REPORTS & ANALYTICS

The administrator and authorized managers will have access to operational reports.

### Sales Reports

* Daily Sales
* Weekly Sales
* Monthly Sales
* Annual Sales
* Product Sales
* Payment Reports

### Delivery Reports

* Completed Deliveries
* Pending Deliveries
* Cancelled Deliveries
* Failed Deliveries
* Driver Performance

### Customer Reports

* Total Customers
* Active Customers
* New Customers
* Customer Orders
* Referral Statistics
* Customer Bottle Balances

### Inventory Reports

* Bottle Inventory
* Dispenser Inventory
* Damaged Items
* Lost Items
* Stock Movement
* Inventory Adjustments
* Bottles With Customers
* Bottles Assigned to Drivers

### Payment Reports

* Total Payments
* Outstanding Payments
* Dispenser Installment Payments
* Payment History
* Cash Collections
* Reversals and Refunds
* Overdue Installments

---

## 22. SEARCH, FILTER & MANAGEMENT TOOLS

Administrative users will have tools to efficiently manage records.

The system will support:

* Search
* Filtering
* Sorting
* Pagination
* Status filtering
* Date filtering
* Customer lookup
* Order lookup
* Payment lookup
* Delivery lookup
* Bottle lookup
* Dispenser lookup
* Referral lookup

---

## 23. AUTHENTICATION & SECURITY

The platform will include:

* Secure user registration.
* Login and logout.
* Password protection.
* Role-based access control.
* Protected dashboards.
* Permission-based system access.
* Account status management.
* Secure handling of customer information.
* Secure session management.
* Input validation.
* Access restrictions for administrative functions.
* Audit logging for sensitive operations.

Each user will only have access to the features permitted by their assigned role.

Sensitive activities such as:

* Inventory adjustments
* Payment reversals
* Account changes
* Dispenser ownership changes
* Reward corrections
* Order cancellations
* Administrative changes

will be recorded where appropriate.

The audit history may record:

* User responsible
* Action performed
* Record affected
* Previous value where applicable
* New value where applicable
* Date and time
* Reason where required

---

## 24. RESPONSIVE WEB DESIGN

The web application will be responsive and optimized for:

* Desktop computers
* Laptops
* Tablets
* Mobile web browsers

The interface will follow the F Net Water Hub brand identity.

### Brand Colors

**Primary Blue:** #0057B8

**Light Blue:** #00AEEF

**White:** #FFFFFF

### Design Direction

* Clean
* Modern
* Professional
* Water-themed
* Easy to navigate
* Mobile responsive
* Consistent dashboard design
* Water-wave visual elements

### Styling Framework

**Tailwind CSS** will be used as the primary styling framework for the web application.

Tailwind CSS will support:

* Responsive layouts
* Consistent spacing and typography
* Reusable utility classes
* Responsive dashboards
* Mobile-first design
* Consistent color usage
* Reusable interface components
* Faster UI development
* Consistent styling across all user portals

The application will use Tailwind CSS together with reusable components to maintain a consistent design system across the customer, driver, agent, manager, and administrator interfaces.

---

## 25. BACKEND & DATABASE

The web application will have a centralized backend responsible for:

* User management
* Authentication
* Orders
* Customers
* Deliveries
* Drivers
* Agents
* Managers
* Inventory
* Payments
* Dispenser plans
* Referrals
* Rewards
* Notifications
* Reports
* Tracker information
* File and media storage
* Audit records
* Inventory transactions

The backend architecture will be structured to support the future mobile application.

The application will use a relational database design to maintain structured relationships between customers, orders, deliveries, payments, bottles, dispensers, referrals, rewards, users, and other operational records.

Database access will be handled using Prisma ORM with PostgreSQL.

Uploaded files and media will be stored through MinIO object storage rather than directly inside the relational database.

The development and deployment environment will use Docker containers to provide consistent services for the application, database, and object storage.

---

## 26. FUTURE MOBILE APPLICATION

The mobile application is **not included in Phase 1**.

After successful completion of the web application, the mobile application can be developed as **Phase 2**.

The future mobile application may include:

* Customer mobile app
* Driver mobile app
* Agent mobile app
* Manager mobile app
* Push notifications
* Mobile GPS features
* Mobile delivery tracking
* Mobile ordering
* Mobile payments
* Other features agreed during Phase 2

The mobile application will be quoted and scoped separately.

The Phase 1 architecture will therefore avoid unnecessary dependence on browser-only business logic so that important backend functionality can later be reused by the mobile application.

---

## 27. PHASE 1 DELIVERY PLAN

The web application will be developed within **3 weeks**.

### WEEK 1: FOUNDATION & CUSTOMER SYSTEM

### Development Activities

* Project setup
* Docker development environment
* PostgreSQL database setup
* Prisma ORM configuration
* MinIO storage configuration
* Database/backend foundation
* Authentication
* User roles and permissions
* Next.js application setup
* Tailwind CSS configuration
* UI/UX implementation
* Customer registration
* Customer dashboard
* Customer profile
* Delivery addresses
* Water products
* Water ordering
* Order management

### Week 1 Deliverable

A functional customer-facing web system with the core ordering workflow.

---

### WEEK 2: OPERATIONS & MANAGEMENT

### Development Activities

* Administrator dashboard
* Manager dashboard
* Driver dashboard
* Agent dashboard
* Customer management
* Driver management
* Agent management
* Order management
* Delivery management
* Bottle inventory
* Bottle exchange workflow
* Inventory transaction tracking
* Dispenser inventory
* Dispenser installment plans
* Payment records
* Referral system
* Audit logging
* Reusable Tailwind CSS interface components

### Week 2 Deliverable

Functional operational and management dashboards.

---

### WEEK 3: INTEGRATION, REPORTING & LAUNCH

### Development Activities

* Payment integration/configuration
* Notifications
* Referral rewards automation
* Dispenser tracking interface
* Reports and analytics
* Search and filtering
* System testing
* Responsive optimization
* Tailwind CSS styling review
* Bug fixing
* Security review
* Docker production configuration
* Deployment
* Final system handover

### Week 3 Deliverable

Production-ready web application.

---

# 28. TECHNOLOGY STACK

The Phase 1 F Net Water Hub web application will be developed using a modern, scalable technology stack designed to support the current web platform and possible future mobile application.

## 28.1 Frontend and Web Framework

### Next.js

**Next.js** will be used as the main web application framework.

It will support:

* Customer-facing web pages
* Administrator dashboard
* Manager dashboard
* Driver dashboard
* Agent dashboard
* Server-side application functionality
* API endpoints
* Responsive interfaces
* Secure authenticated application pages
* Future integration with external services

The interface will be developed with reusable components to maintain consistency throughout the application.

---

## 28.2 Programming Language

### TypeScript

TypeScript will be used for the application development.

It will provide:

* Stronger type checking
* Better code maintainability
* Reduced programming errors
* Improved development consistency
* Easier long-term system maintenance

---

## 28.3 Styling Framework

### Tailwind CSS

**Tailwind CSS** will be used as the primary styling framework for the web application.

It will support:

* Responsive layouts
* Mobile-first design
* Consistent spacing
* Typography
* Colors
* Borders
* Shadows
* Forms
* Tables
* Cards
* Dashboards
* Navigation components
* Reusable UI patterns

Tailwind CSS will be configured according to the F Net Water Hub brand identity, including:

* Primary Blue: #0057B8
* Light Blue: #00AEEF
* White: #FFFFFF

The application will use reusable components and shared Tailwind CSS design patterns to ensure visual consistency across all user roles.

---

## 28.4 Database

### PostgreSQL

**PostgreSQL** will be used as the primary relational database management system.

It will store structured application information including:

* Users
* Customers
* Products
* Orders
* Deliveries
* Payments
* Inventory
* Bottles
* Dispensers
* Payment plans
* Referrals
* Rewards
* Notifications
* Audit records
* Tracker information

PostgreSQL will provide reliable relational data management for the operational requirements of the platform.

---

## 28.5 Object Relational Mapping

### Prisma ORM

**Prisma** will be used to manage communication between the Next.js application and PostgreSQL database.

Prisma will support:

* Database schema management
* Database migrations
* Structured relationships
* Type-safe database queries
* Data validation support
* Easier database maintenance

---

## 28.6 Containerization

### Docker

**Docker** will be used to containerize important system services.

The Docker environment may include separate services for:

* Next.js application
* PostgreSQL database
* MinIO object storage

Docker will provide a consistent development and deployment environment and reduce differences between development, testing, and production configurations.

---

## 28.7 File and Object Storage

### MinIO

**MinIO**, running through Docker, will be used as the primary object storage solution.

MinIO can store files such as:

* Product images
* Customer-related uploads
* Payment evidence where applicable
* Dispenser images
* Complaint/support attachments
* System documents
* Other uploaded media

The database will store references and metadata for uploaded files while the actual file contents remain in object storage.

---

## 28.8 Proposed Technical Architecture

The basic application architecture will follow:

**User Browser**

↓

**Next.js Web Application styled with Tailwind CSS**

↓

**Application / API Layer**

↓

**Prisma ORM**

↓

**PostgreSQL Database**

For uploaded files:

**Next.js Application**

↓

**MinIO Object Storage**

The principal services will be configured using Docker.

This architecture will also make it possible for a future mobile application to communicate with the same backend services where appropriate.

---

## 28.9 Technology Stack Summary

| Technology               | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| Next.js                  | Main web application framework                      |
| TypeScript               | Application programming language                    |
| Tailwind CSS             | Primary styling framework and responsive UI styling |
| PostgreSQL               | Primary relational database                         |
| Prisma ORM               | Database access and schema management               |
| Docker                   | Application and service containerization            |
| MinIO                    | File and object storage                             |
| HTML5                    | Web page structure                                  |
| Responsive UI Components | Mobile, tablet, and desktop interface               |
| REST/API Services        | External and future mobile integration              |

---

# 29. BUSINESS RULES AND OPERATIONAL WORKFLOWS

The following rules will guide the implementation of important operational processes.

These rules complement the functional requirements already defined in this proposal and may be further refined according to F Net Water Hub's approved business policies.

## 29.1 Refillable Bottle Exchange

A refillable bottle transaction will normally operate as an exchange.

Where a customer receives refillable bottles, the system will record the expected number of empty bottles to be returned.

Example:

**5 Filled Bottles Delivered → 5 Empty Bottles Expected**

Where the customer returns fewer bottles, the difference will be recorded as an outstanding bottle balance.

---

## 29.2 Outstanding Bottles

Outstanding refillable bottles will remain associated with the customer until they are:

* Returned
* Paid for where company policy requires
* Reconciled by management
* Written off by an authorized administrator

The system will retain a history of the transaction.

---

## 29.3 Bottle Movement

Bottle inventory will be based on recorded operational movements.

A bottle may move between statuses such as:

**Filled at Warehouse → Assigned to Driver → In Transit → With Customer → Empty Collected → Returned to Warehouse**

Other possible states include:

* Damaged
* Lost
* Under investigation

---

## 29.4 Driver Inventory Responsibility

Drivers can record:

* Bottles received for delivery
* Bottles delivered
* Empty bottles collected
* Damaged bottles
* Missing bottles

Drivers will not normally have unrestricted access to manually alter overall stock quantities.

---

## 29.5 Failed Delivery

A failed delivery will not be treated as a completed sale.

Products associated with the failed delivery must be reconciled after the driver returns or the delivery is rescheduled.

The reason for failure will be recorded.

---

## 29.6 Delivery Completion

A delivery should only be marked as completed after the required delivery information has been recorded.

Where applicable, this includes:

* Quantity delivered
* Empty bottles collected
* Payment collected
* Bottle shortages
* Delivery remarks

---

## 29.7 Order Cancellation

Customers may cancel orders only while the order is within a permitted cancellation stage.

Once delivery has been completed, the order cannot normally be cancelled.

Staff-controlled cancellation may be required after an order has already been assigned to a driver.

---

## 29.8 Cash-on-Delivery

Where cash-on-delivery is enabled, the driver may record the payment collected.

The system will record:

* Customer
* Order
* Amount
* Driver
* Date/time
* Payment status

Management can subsequently reconcile cash collections.

---

## 29.9 Payment Integrity

Completed financial records will not simply be deleted.

Corrections will use:

* Reversal
* Refund
* Adjustment

records where appropriate.

This will preserve transaction history.

---

## 29.10 Dispenser Installments

Every dispenser installment plan will have:

* Total price
* Initial payment
* Installment amount
* Payment schedule
* Amount paid
* Outstanding balance
* Next payment date
* Payment status

---

## 29.11 Overdue Installments

When an installment becomes overdue, the system will:

1. Mark the applicable payment as overdue.
2. Notify the customer where notification services are enabled.
3. Alert authorized management staff.
4. Maintain the outstanding balance.
5. Allow management follow-up.

Further penalties, retrieval procedures, grace periods, or enforcement actions will depend on company policy.

---

## 29.12 Dispenser Ownership

Installation of a dispenser at a customer's premises does not automatically mean ownership has transferred.

A dispenser on an active installment plan may remain:

**Company Owned – Installment Plan**

After full payment and fulfillment of company requirements, it may change to:

**Customer Owned**

---

## 29.13 Referral Qualification

A referral will only become successful after the referred customer:

1. Registers.
2. Places the required qualifying order.
3. Completes the required payment.

---

## 29.14 Referral Reward

Every five successful referrals will earn one eligible free water bottle.

The customer's available reward balance will update automatically.

---

## 29.15 Reward Redemption

When an eligible free bottle is redeemed:

* The reward usage will be recorded.
* The customer's available reward balance will decrease.
* The related order will record the reward applied.

Rewards cannot be redeemed more times than the available reward balance.

---

## 29.16 Cancelled or Refunded Referral Transactions

Where the qualifying order is cancelled, refunded, reversed, or found to be invalid, its referral qualification may also be reversed according to company policy.

---

## 29.17 Inventory Adjustment

Manual inventory corrections will be restricted to authorized staff.

Adjustments must record:

* Item
* Adjustment quantity
* Reason
* Responsible user
* Date/time

---

## 29.18 Damaged Bottles

Damaged bottles will be moved into a separate damaged inventory status rather than remaining within available stock.

---

## 29.19 Lost Bottles

Bottles confirmed as lost will be recorded separately and removed from available operational inventory.

The related customer, driver, or transaction may be linked to the loss where appropriate.

---

## 29.20 Inventory Reconciliation

Inventory should be reconcilable across major locations and states including:

* Available filled bottles
* Empty bottles
* Bottles assigned to drivers
* Bottles in transit
* Bottles with customers
* Damaged bottles
* Lost bottles

---

## 29.21 Audit Trail

Important system operations will maintain an audit history.

Examples include:

* Inventory adjustment
* Payment reversal
* Dispenser ownership change
* Reward correction
* User account change
* Order cancellation
* Administrative changes

Where applicable, the audit record will identify:

* User
* Action
* Date/time
* Record affected
* Previous information
* Updated information
* Reason

---

## 29.22 Role-Based Operational Control

Users will only perform operations relevant to their responsibilities.

For example:

**Driver**

Records deliveries and bottle exchanges.

**Agent**

Registers and supports assigned customers.

**Manager**

Supervises operations and handles permitted reconciliations.

**Administrator**

Maintains complete system oversight and controls sensitive operations.

---

## 29.23 Business Rule Configuration

Certain operational rules may eventually be configurable by administrators where practical.

Examples may include:

* Number of referrals required for a reward
* Eligible reward product
* Delivery rules
* Dispenser payment intervals
* Notification thresholds

However, major changes affecting financial or operational logic may require a system update.

---

## 30. PROJECT DELIVERABLES

At the completion of Phase 1, the client will receive:

* Responsive F Net Water Hub web application
* Customer portal
* Driver portal
* Agent portal
* Manager dashboard
* Administrator dashboard
* Water ordering system
* Delivery management system
* Bottle inventory management
* Bottle exchange and accountability system
* Dispenser management
* Dispenser installment system
* Referral and rewards system
* Payment management
* Notifications
* Reports and analytics
* Authentication and role management
* Audit trail for important system operations
* Tailwind CSS design system and responsive interface
* PostgreSQL database
* Prisma database implementation
* MinIO object storage configuration
* Docker-based deployment configuration
* Backend and database
* Production deployment
* Basic system handover

---

## 31. EXCLUSIONS

The following are not included in the GH₵12,000 Phase 1 development cost unless separately agreed:

* Native Android application
* Native iOS application
* Cross-platform mobile application
* Physical GPS tracking devices
* Smart dispenser hardware
* Water-level sensors
* IoT hardware installation
* SIM/data costs for tracking devices
* WhatsApp Business API charges
* SMS charges
* Paid third-party API subscriptions
* Google Maps/API usage charges beyond available free tiers
* App Store fees
* Google Play Store fees
* Major features not listed in this scope
* Additional development work caused by changes to the approved requirements
* Paid hosting infrastructure beyond what is specifically agreed
* Paid external storage or cloud-service charges where applicable
* Third-party payment gateway transaction charges

---
