# NDC Features AI Chatbot - System Design Document (Simplified POC)

## 1. Project Overview

### 1.1 Purpose

Build a simple AI-powered chatbot system that allows users to query NDC (New Distribution Capability) feature implementation data across airlines and providers. This POC focuses on core functionality: data management and intelligent querying.

### 1.2 Key Objectives

-   Create a simple database to store NDC feature data
-   Provide natural language querying of NDC feature data
-   Enable manual data updates through a clean web interface
-   Deliver accurate, contextual responses about airline feature implementations

## 2. Simplified Data Model

### 2.1 Core Tables (Keep It Simple)

#### Airlines Table

```
airlines
- id (Primary Key)
- name (e.g., "American Airlines")
- codes (e.g., "AA" or "LH, OS, SN, LX, EN, 4Y")
- provider (e.g., "Accelya (Former Farelogix)")
- status (e.g., "Production", "Pilot")
```

#### Features Table

```
features
- id (Primary Key)
- category (e.g., "Shopping", "Global", "Booking")
- name (e.g., "Dynamic pricing", "Unaccompanied minors")
- description
```

#### Implementations Table

```
implementations
- id (Primary Key)
- airline_id (Foreign Key)
- feature_id (Foreign Key)
- value (stores "CP", "Max 6", "All", "0", "1", "To be clarified", etc.)
- notes (optional additional info)
```

### 2.2 Data Setup

Start with manually entering the key data from your Excel file into these three simple tables.

## 3. Simple System Architecture

### 3.1 Technology Stack

-   **Frontend**: React.js with basic UI components
-   **Backend**: Node.js/Express.js API
-   **Database**: SQLite for simplicity (can upgrade to PostgreSQL later)
-   **AI**: Anthropic Claude API
-   **Version Control**: Git with GitHub repository
-   **Deployment**: Docker containerization for Debian Linux server
-   **Container Orchestration**: Docker Compose for multi-service setup

### 3.2 Two Main Components

#### 3.2.1 Data Management Interface

**Simple admin panel to manage the data**

**Pages Needed**:

-   Airlines page: Add/edit/delete airlines
-   Features page: Add/edit/delete features
-   Implementation Matrix: Grid view to set feature values for each airline
-   Simple forms with basic validation

#### 3.2.2 Chatbot Interface

**Clean chat interface for querying data**

**Features**:

-   Chat window with conversation history
-   Text input for natural language queries
-   Display results in tables or formatted text
-   Basic query suggestions

## 4. Simple RAG Implementation

### 4.1 Basic Context Retrieval

**For each user query**:

1.  Extract airlines and features mentioned in the query
2.  Get relevant data from the database
3.  Send the data + user question to Claude API
4.  Return Claude's response to the user

### 4.2 Query Processing Steps

1.  **Parse Query**: Identify what the user is asking about
2.  **Database Lookup**: Get relevant records from the three tables
3.  **Context Building**: Format the data for Claude API
4.  **AI Response**: Let Claude answer using the provided data
5.  **Display**: Show the response to the user

## 5. Example Queries (All Still Supported)

### 5.1 Implementation Status

**"Which airlines support dynamic pricing?"**

-   Find "dynamic pricing" in features table
-   Get all implementations for that feature
-   Return airlines where value is not "0" or "To be clarified"

### 5.2 Feature-Specific

**"Is 'Unaccompanied Minor' supported for airline AA?"**

-   Find AA in airlines table
-   Find "Unaccompanied Minor" in features table
-   Get implementation record and return the value

### 5.3 Comparisons

**"Compare features across Altea NDC airlines"**

-   Find all airlines with provider "Altea NDC"
-   Get all their feature implementations
-   Format as comparison table

### 5.4 Provider/Status

**"List all production airlines with Accelya"**

-   Filter airlines by provider "Accelya" and status "Production"
-   Return the list

## 6. Simple UI Design

### 6.1 Data Management (Admin Side)

**Three simple pages**:

**Airlines Page**:

-   Table showing all airlines with edit/delete buttons
-   "Add New Airline" button with form (name, codes, provider, status)

**Features Page**:

-   Table showing all features with edit/delete buttons
-   "Add New Feature" button with form (category, name, description)

**Implementation Matrix**:

-   Grid layout: airlines as columns, features as rows
-   Click any cell to edit the implementation value
-   Save button to update changes

### 6.2 Chatbot Interface

**Simple chat layout**:

-   Chat history area showing conversation
-   Input box at bottom for typing questions
-   Send button
-   Optional: A few example query buttons to get users started

## 7. Simple API Design

### 7.1 Data Management APIs

```
Airlines:
GET /api/airlines - Get all airlines
POST /api/airlines - Create airline
PUT /api/airlines/:id - Update airline
DELETE /api/airlines/:id - Delete airline

Features:
GET /api/features - Get all features  
POST /api/features - Create feature
PUT /api/features/:id - Update feature
DELETE /api/features/:id - Delete feature

Implementations:
GET /api/implementations - Get all implementations
PUT /api/implementations/:airlineId/:featureId - Update implementation value
```

### 7.2 Chatbot API

```
POST /api/chat - Send user question, get AI response
```

## 8. Development & Deployment Strategy

### 8.0 Version Control Setup

-   Initialize Git repository with proper .gitignore
-   Create GitHub repository for code hosting
-   Establish branching strategy (main, develop, feature branches)
-   Set up commit message conventions
-   Configure GitHub Actions for CI/CD (optional)

## 9. Implementation Steps

### 9.1 Phase 1: Basic Setup

1.  Create React app with basic routing
2.  Set up Express.js backend with SQLite database
3.  Create the three database tables
4.  Build basic CRUD operations for airlines and features

### 9.2 Phase 2: Data Management UI

1.  Create Airlines management page with forms
2.  Create Features management page with forms
3.  Build Implementation Matrix grid interface
4.  Add basic validation and error handling

### 9.3 Phase 3: Chatbot Integration

1.  Set up Anthropic API integration
2.  Create chat interface components
3.  Implement query processing logic
4.  Test with example queries

### 9.4 Phase 4: Containerization & Deployment

1.  Add styling and improve UX
2.  Add loading states and error handling
3.  Create Dockerfile for containerization
4.  Set up Docker Compose for multi-service deployment
5.  Configure environment variables for production
6.  Deploy to Debian Linux server using Docker
7.  Manual data entry of initial dataset