The University of Lahore – Final Project Proposal 

## **THE UNIVERSITY OF LAHORE** 

_Department of Software Engineering_ 

## Final Year Project Proposal 

For probably the first time in your undergraduate/graduate program, you are required to defend a proposal of a larger project. In teams, you will be working on the common project, but individual team members will be required to take on responsibilities for specific work for which each will be held accountable. Interaction, collaboration and assistance are allowed and expected, but each person will receive an individual mark for his/her work performed in the project. 

|||||Day|Day|||Month<br>Year|Month<br>Year|||||
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
||**DATE**||**–**<br>**–**<br>~~COO~~|||||||||||
||**PROJECT TITLE:**||**PROJECT TITLE:**|||||**Centralized Custom Tailoring & Delivery Platform with Guided**<br>**Measurement Studio**||||||
|||||||||||||||
||**STUDENT INFORMATION**_._|||||||||||||
|**Sr.**||**Student ID**||||||**Name**||||**Email**|**Mobile**|
|1.||70135473||||||Huzaifa babar||||70135473@student.uol.ed|0305-4060801|
|||||||||||||u||
|||||||||||||.pk||
|2.||70139294||||||Abdul-Ahad Haroon||||70139294@student.uol.ed|0345-1533707|
|||||||||||||u||
|||||||||||||.pk||



## **PROBLEM STATEMENT** 

Pakistan’s online unstitched suit market suffers from high return rates due to incorrect customer measurements, lack of quality control, and poor communication between customers and tailors. Existing e-commerce platforms do not provide guided measurement assistance, centralized stitching management, or integrated delivery tracking. This project aims to develop a centralized platform that guides customers through measurement entry, manages internal tailoring operations, performs quality checks, and integrates courier delivery all under one controlled system. 

Page 1 

The University of Lahore – Final Project Proposal 

## **EXECUTIVE SUMMARY** 

Pakistan’s online unstitched suit market suffers from high return rates due to incorrect customer measurements, lack of quality control, and poor communication between customers and tailors. Existing e-commerce platforms do not provide guided measurement assistance, centralized stitching management, or integrated delivery tracking. This project aims to develop a centralized platform that guides customers through measurement entry, manages internal tailoring operations, performs quality checks, and integrates courier delivery all under one controlled system. The system eliminates direct customer-to-tailor interaction, ensuring consistent quality and reducing miscommunication. A dedicated delivery integration layer connects with courier services such as TCS to provide real-time tracking and proof of delivery. Internal modules handle tailor workload balancing, deadline monitoring, and performance analytics. The platform addresses the core problems of wrong measurements, return rates, and quality inconsistency in Pakistan’s online fashion market. It functions as a digital tailoring factory controlled, scalable, and customer-friendly combining a guided UX, production management, QC workflow, and last-mile logistics in a single system. 

Page 2 

The University of Lahore – Final Project Proposal 

## **INTRODUCTION** 

## **Relevance / Importance:** 

The online sale of unstitched suits in Pakistan is increasing, but customers often face issues such as incorrect measurements, inconsistent stitching quality, and lack of trust in tailoring services. Existing platforms either sell products only or connect customers directly with tailors, resulting in varying service standards. The proposed system uses a centralized model where customers place orders with the company, and tailoring tasks are assigned internally to tailors. This ensures better quality control, standardized services, order tracking, and an improved customer experience. 

## **Background** : 

Currently, customers either visit tailors in person or rely on generic size charts online, both of which lead to frequent fit issues. No digital platform manages the full stitching lifecycle from measurement to delivery under centralized control. 

## **Literature Review:** 

- Food delivery platforms such as Foodpanda and Uber Eats demonstrate effective order tracking, task assignment, and delivery management concepts relevant to this project. 

- E-commerce platforms such as Daraz and Amazon provide product ordering and payment workflows but do not support custom stitching or measurement management. 

- Existing tailoring applications mainly act as marketplaces that connect customers with tailors and lack centralized quality control and production management. 

- Video-guided onboarding used in fitness and healthcare applications helps users provide accurate information and inspires the measurement guidance feature of the proposed system. 

- The proposed system combines these concepts into a centralized tailoring platform where the company manages stitching, quality assurance, and delivery operations. 

None of the existing solutions combine guided measurement input, internal tailor management, QC workflow, and courier integration making this project unique. 

## **COMPETITORS/COMPETITIVE ANALYSIS** 

## **Competitor** 

Daraz / Amazon 

Local Tailor Apps (Marketplace Model) 

Generic E-Commerce Stores 

## **Features** 

Product listing, online shopping, order placement, payment processing 

Connect customers with independent tailors, order management 

Product browsing, order placement, online payments 

## **Limitations** 

No custom stitching services, no body measurement guidance, no tailoring workflow 

No centralized quality control, inconsistent stitching quality, limited order monitoring, no standardized process 

No measurement studio, no stitching management system, no tailor coordination, no customization support 

Page 3 

The University of Lahore – Final Project Proposal 

## **OBJECTIVES** 

- To develop a centralized platform for custom stitching of unstitched suits purchased online 

- To implement a Guided Measurement Studio with step-by-step video and photo assistance 

- To build an admin Command Center for order assignment, tailor management, and QC control 

- To integrate a courier API (TCS) for real-time delivery tracking 

- To provide customers with live order status updates from placement to delivery 

## **MOTIVATION** 

Online clothing shopping in Pakistan is growing, but customers often receive ill-fitted stitched suits due to incorrect measurements and poor quality control.Tailoring services are also unorganized with no proper order management.This project solves these problems by bringing the entire stitching process under one controlled digital system. Customers are guided step by step to enter correct measurements, all stitching is handled internally, and quality is checked before every delivery ensuring better fit, better quality, and a trustworthy experience. 

Page 4 

The University of Lahore – Final Project Proposal 

## **REQUIREMENTS** 

## **Functional Requirements:** 

- Paste product link and auto-fetch product details 

- • Guided Measurement Studio (video + text + photo upload per body part) • Manual measurement entry option • User registration and login • Order placement and payment processing (JazzCash / EasyPaisa / Bank Accounts) • Admin dashboard receive, assign, and monitor orders • Tailor panel view assigned tasks, update work status • QC module approve or reject finished garments • Delivery agent panel update delivery status, confirm proof of delivery • Courier API integration (TCS) generate tracking ID, live updates • Customer order tracking page • Ratings and feedback submission 

## **Non-Functional Requirements:** 

- Responsive on web and mobile 

- • Secure authentication and payment handling • Scalable to support multiple concurrent orders • Fast page load and real-time status updates • User-friendly interface for non-technical customers 

## **FEATURES OF PROJECT** 

## **1. Product Link Parser** 

Customer pastes an unstitched suit link; system fetches product image, name, and details automatically. 

## **2. Guided Measurement Studio** 

Body part by body part input flow. Each step includes a short instructional video (10–20 sec), diagrams, do’s and don’ts, and an input field. Photo upload is optional for validation. 

Page 5 

The University of Lahore – Final Project Proposal 

## **3. Order & Payment Module** 

Confirms order with measurements, processes payment via JazzCash / EasyPaisa / Bank Accounts, and sends order to admin. 

## **4. Admin Command Center** 

Central dashboard to view all orders, assign tailors, monitor progress in real time, manage tailor workload, and approve finished garments after QC. 

## **5. Tailor Management Module** 

Internal panel for tailors to view assigned tasks, follow measurement instructions, update work status, and meet deadlines. Tracks productivity and workload balance. 

## **6. Quality Control (QC) Workflow** 

Before dispatch, QC team inspects the garment and either approves it for delivery or flags it for correction. 

## **7. Delivery Integration (TCS API)** 

Approved orders are handed to courier. Tracking ID is generated and shared with the customer for live delivery updates and proof of delivery. 

## **8. Customer Order Tracking** 

Real-time status page showing stages: Order Placed →Assigned →In Stitching →QC → Dispatched →Delivered. 

## **9. Ratings & Feedback** 

Post-delivery rating system for quality and delivery experience. 

## **ARCHITECTURAL DESIGN** 

## **System Components:** 

• Frontend: 

• React.js / Next.js (Web), React Native (Mobile,Tailor & Delivery Agent apps) 

## **Backend:** 

Node.js (Express) or Laravel / Django 

## **Database** : 

PostgreSQL or MongoDB 

AI/Media: Cloudinary / AWS S3 (video and photo hosting for Measurement Studio) Payment: Stripe / JazzCash / EasyPaisa APIs Courier: TCS Express API Hosting: Vercel (frontend) + DigitalOcean / AWS (backend) 

Page 6 

The University of Lahore – Final Project Proposal 

**Architecture Flow:** Customer (Web/Mobile) ↓ Product Link Parser ↓ Guided Measurement Studio ↓ Order + Payment Module ↓ Admin Command Center ↓ Tailor Assignment →Stitching →QC Approval ↓ TCS Courier API →Delivery Agent ↓ Customer receives order + tracking updates 

Page 7 

The University of Lahore – Final Project Proposal 

## **IMPLEMENTATION TOOLS AND TECHNIQUES** 

## **Tools:** 

- JavaScript / TypeScript (Frontend & Backend Development) 

- React.js / Next.js (Frontend User Interface) 

- Node.js with Express.js (Backend API Development) 

- PostgreSQL / MongoDB (Database Management) 

- React Native (Mobile App for Delivery Agent / Internal Staff) 

- Cloudinary / AWS S3 (Video and Image Storage) 

- Stripe / JazzCash / EasyPaisa API (Payment Integration) 

- TCS API (Courier & Delivery Tracking) 

- GitHub & Docker (Version Control and Deployment) 

## **Techniques:** 

- •REST API Development for communication between frontend and backend systems 

- Guided Measurement Validation for reducing body measurement errors 

- Smart Tailor Assignment Algorithm for workload balancing and task optimization 

- Real-Time Order Tracking and Workflow Monitoring 

- Quality Control Workflow Management for stitching verification 

- Data Analytics and Performance Monitoring for operational efficiency 

Page 8 

The University of Lahore – Final Project Proposal 

## **PR** ~~fp~~ **OJECT PLAN** 

Page 9 

The University of Lahore – Final Project Proposal 

|**VERSION CONTROL**|**VERSION CONTROL**||||
|---|---|---|---|---|
||||||
|Version|Date|Description|Updated By||
|v1.0.0|__ / __ / 2026|Initial proposal<br>submission and project<br>planning.|Team||
|v1.1.0|__ / __ / 2026|Added system<br>architecture, workflow<br>modules, and Guided<br>Measurement Studio<br>features.|Team||
|v1.2.0|__ / __ / 2026|Updated<br>implementation tools,<br>techniques, and system<br>requirements.|Team||
|v1.3.0|__ / __ / 2026|Final review,<br>corrections, and<br>documentation updates.|Team||



Page 10 

The University of Lahore – Final Project Proposal 

## **REFERENCES** 

- React.js / Next.js Official Documentation 

- Node.js / Laravel / Django Official Documentation 

- TCS Express API Documentation 

- JazzCash / EasyPaisa API Documentation 

- Cloudinary / AWS S3 Documentation 

- Research papers on e-commerce UX and measurement input systems 

- • Studies on return rates in online fashion retailReact 

- Native documentation for cross-platform mobile development 

## **……………………………….DO NOT WRITE BELOW THIS LINE…………………………………** 

**FOR OFFICE USE ONLY** Approved  Yes  No 

## **Checked & Approved/Not Approved By:** 

**==> picture [456 x 104] intentionally omitted <==**

**----- Start of picture text -----**<br>
Name:<br>Signature:<br>Day Month Year<br>DATE – –<br>**----- End of picture text -----**<br>


Page 11 

