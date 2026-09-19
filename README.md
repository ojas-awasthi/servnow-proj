# ServNOW

ServNOW is a full-stack **Service Marketplace + CRM Management Platform** built as an end-to-end web application.

It combines a customer-facing service marketplace with a CRM system for managing customers, providers, services, bookings, leads, transactions, support tickets, notifications, and users.

## Features

### Customer Platform
- Responsive customer-facing website
- Service discovery, search, filtering, sorting, and pagination
- Service details and provider information
- Wishlist
- Registration and login
- JWT authentication
- Service booking
- Appointment date/time, address, and notes
- Mock payment flow
- Booking confirmation
- Booking history and status tracking
- Customer dashboard and profile
- Service reviews and ratings
- Loading, empty, and error states
- Responsive mobile/tablet/desktop UI

### CRM Platform
- CRM dashboard and analytics
- Customer and provider management
- Service and category management
- Booking management
- Lead management, assignment, follow-up, status management, and Kanban workflow
- Transaction management
- Support ticket management
- Notifications
- User and role management
- Role-based access control

## User Roles

| Role | Purpose |
|---|---|
| Customer | Browse and book services |
| Provider | Service provider account |
| Sales | CRM sales and lead management |
| Support | Support ticket management |
| Admin | Full CRM/user management |

## Technology Stack

### Frontend
- React.js
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- shadcn/ui
- Lucide React
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- CORS
- dotenv

### Development
- Git
- GitHub
- Postman
- MongoDB Atlas

## Architecture

```text
                    ServNOW
                       |
          +------------+------------+
          |                         |
          v                         v
   Customer Frontend          CRM Frontend
     React + Vite             React + Vite
          |                         |
          +------------+------------+
                       |
                  Axios / REST
                       |
                       v
              Node.js + Express
                       |
          +------------+------------+
          |            |            |
       Routes      Middleware   Controllers
                       |
                  Services
                       |
                  Validation
                       |
                    Mongoose
                       |
                       v
                MongoDB Atlas
```

See `docs/architecture.md` for more detail.

## Project Structure

```text
ServNOW/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── store/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── postman/
├── docs/
├── .gitignore
├── package.json
└── README.md
```

## Database Models

ServNOW uses MongoDB Atlas with Mongoose.

- **User** — customer, provider, sales, support, and admin accounts.
- **Category** — service categories.
- **Service** — marketplace services linked to category and provider.
- **Booking** — customer, provider, service, appointment, amount, status, and payment status.
- **Transaction** — payment transaction linked to booking and customer.
- **Wishlist** — services saved by a customer.
- **Review** — customer feedback and ratings for services.
- **Lead** — CRM lead, assignment, status, priority, and follow-up.
- **SupportTicket** — customer support request, assignment, priority, and status.
- **Notification** — user notifications and read/unread state.

See `docs/database-schema.md` for relationships and fields.

## Authentication & RBAC

Authentication uses JWT.

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Protected requests use:

```text
Authorization: Bearer <JWT>
```

Passwords are hashed using bcrypt.

Protected routes and APIs use authentication and role authorization middleware.

## Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real secrets.

## Installation

Prerequisites:
- Node.js
- npm
- MongoDB Atlas
- Git

Clone:

```bash
git clone https://github.com/ojas-awasthi/servNOW.git
cd servNOW
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

## Running Locally

From the project root:

```bash
npm run client
```

In another terminal:

```bash
npm run server
```

## Production Build

From the project root:

```bash
npm run build
```

This runs the Vite production build and generates `client/dist/`.

## Customer Workflow

```text
Home
  ↓
Services
  ↓
Search / Filter / Sort
  ↓
Service Details
  ↓
Wishlist / Booking
  ↓
Booking Form
  ↓
Checkout
  ↓
Mock Payment
  ↓
Booking Confirmation
  ↓
Customer Dashboard
  ↓
Booking Details / Tracking
  ↓
Review
```

## CRM Workflow

```text
CRM Dashboard
      |
      +-- Customers
      +-- Providers
      +-- Services
      +-- Categories
      +-- Bookings
      +-- Leads
      +-- Transactions
      +-- Support Tickets
      +-- Notifications
      +-- Users & Roles
```

## Booking Lifecycle

```text
Pending → Confirmed → In Progress → Completed
```

A booking can also be cancelled.

## Lead Lifecycle

```text
New → Contacted → Qualified → Proposal → Converted
```

A lead may also be marked as lost.

## Payment

The project includes a mock/test payment flow demonstrating the booking-to-transaction workflow.

Payment categories include:
- Card
- UPI
- Netbanking
- Wallet
- Mock payment

## API Documentation

The `postman/` directory contains the API documentation/collection.

Major API areas:
- Auth
- Services
- Categories
- Bookings
- Transactions
- Reviews
- Wishlist
- Leads
- Support Tickets
- Notifications
- Users
- Dashboard

See `docs/api-documentation.md`.

## Demo Accounts

The following are intended for assessment/demo use and should only be documented if they have been created successfully:

| Role | Email | Password |
|---|---|---|
| Customer | `demo.customer@servnow.com` | `ServNow@Demo2026` |
| Provider | `demo.provider@servnow.com` | `ServNow@Demo2026` |
| Sales | `demo.sales@servnow.com` | `ServNow@Demo2026` |
| Support | `demo.support@servnow.com` | `ServNow@Demo2026` |
| Admin | `demo.admin@servnow.com` | `ServNow@Demo2026` |

## Security

The application includes:
- JWT authentication
- bcrypt password hashing
- Protected routes
- Role-based authorization
- Joi request validation
- Centralized error handling
- Environment-based secrets
- MongoDB Atlas
- Password exclusion from normal user queries
- Protected CRM functionality
- Ownership checks for customer resources

## UI & UX

The interface is designed to be:
- Responsive
- Accessible
- Mobile-friendly
- Keyboard-friendly
- Consistent
- Performance-conscious

It uses semantic structure, accessible labels, Lucide icons, loading/empty/error states, responsive layouts, micro-interactions, and consistent visual hierarchy.

## Deployment

```text
React/Vite Frontend
        |
        | REST API
        v
Node.js + Express Backend
        |
        v
MongoDB Atlas
```

Configure production environment variables through the deployment platform. Never commit production secrets.

## GitHub

https://github.com/ojas-awasthi/servNOW

## Future Improvements

- Real payment gateway integration
- Provider-specific dashboards
- Advanced notification delivery
- Real-time booking updates
- Advanced analytics
- Automated email/SMS notifications
- More granular CRM permissions
- Automated testing coverage
- API rate limiting and additional production hardening

## License

This project was created as a full-stack technical assessment project.
