# Project-02 Event Planner
Event Planner is a web application built with Next.js that allows users to create, manage, and organize events. It provides features for tracking attendees, managing tasks, and handling event details.

## Features
  - Create and manage events
  - Add and edit attendees for each event
  - Create and manage tasks for events
  - Search functionality for events
  - Responsive design for various screen sizes

# Getting Started
## Prerequisites
- Node.js (v14 or later)
- pnpm
- MongoDB database
## Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-username/event-planner.git
   cd event-planner
   ```
2. Install dependencies:
   ```
   pnpm install
   ```
3. install
   Set up environment variables:
   Create a .env.local file in the root directory and add the following:
```
   MONGODB_URI=your_mongodb_connection_string
```
4. Run the development server:
   ```
      pnpm run dev
   ```
5. Open http://localhost:3000 with your browser to see the result.

## API Routes
The application uses API routes for server-side operations:
  - app/api/events/route.js: Handles CRUD operations for events
  - app/api/attendee/route.js: Manages attendee-related operations
  - app/api/tasks/route.js: Handles task-related operations

## Deployment
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

## Created by
- Titaporn Tienanansuk Github:https://github.com/Titaporn6511420
- Sirinalin Saekhow Github:https://github.com/Sirinalin
