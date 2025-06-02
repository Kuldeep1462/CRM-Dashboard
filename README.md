# Mini CRM Platform

A comprehensive full-stack CRM platform built with React.js, Next.js, Node.js, Express.js, and MongoDB. Features include customer management, campaign creation with AI-powered rule building, and delivery simulation.

## Features

### 🔐 Authentication
- Google OAuth 2.0 integration
- JWT-based session management
- Protected routes and API endpoints

### 📊 Data Management
- Customer data ingestion via REST APIs
- Order tracking and management
- Real-time dashboard statistics

### 🎯 Campaign Management
- Dynamic rule builder with AND/OR logic
- AI-powered natural language to rule conversion
- Campaign message generation with AI
- Audience preview and targeting
- Delivery simulation with 90% success rate

### 🤖 AI Integration
- Natural language rule conversion using OpenAI
- Automated campaign message generation
- Personalized customer communications

### 📈 Analytics & Logging
- Campaign delivery tracking
- Communication logs with status updates
- Performance metrics and statistics

## Tech Stack

### Frontend
- **React.js** with Next.js 14 (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **OpenAI API** for AI features

### Deployment
- **Backend**: Render/Railway
- **Database**: MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth 2.0 credentials
- OpenAI API key

### Local Development Environment Variables

Create a `.env.local` file in your project root directory:

\`\`\`env
# Database Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-crm

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# AI Integration  
OPENAI_API_KEY=sk-your-openai-api-key-here
\`\`\`

**Important Notes:**
- Replace the placeholder values with your actual credentials
- The `NEXT_PUBLIC_` prefix makes the Google Client ID available to the frontend
- Never commit the `.env.local` file to version control

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/mini-crm
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-crm

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# AI Integration
OPENAI_API_KEY=sk-your-openai-api-key
\`\`\`

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd mini-crm-platform
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins: `http://localhost:3000`
   - Copy the Client ID to your `.env.local`

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local`

5. **Get OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Generate an API key
   - Add it to your `.env.local`

6. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Sign in with Google to access the platform

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication

### Customer Management
- `GET /api/customers` - Fetch all customers
- `POST /api/customers` - Create/update customer
  \`\`\`json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "totalSpend": 15000,
    "visitCount": 5,
    "lastActive": "2024-01-15T10:30:00Z"
  }
  \`\`\`

### Order Management
- `POST /api/orders` - Create new order
  \`\`\`json
  {
    "customerId": "customer_id_here",
    "amount": 2500,
    "orderDate": "2024-01-15T14:30:00Z"
  }
  \`\`\`

### Campaign Management
- `GET /api/campaigns` - Fetch all campaigns
- `POST /api/campaigns` - Create and launch campaign
- `POST /api/campaigns/preview` - Preview audience count

### AI Features
- `POST /api/ai/convert-rules` - Convert natural language to rules
- `POST /api/ai/generate-message` - Generate campaign messages

### Vendor Integration
- `POST /api/vendor/receipt` - Update delivery status
  \`\`\`json
  {
    "messageId": "message_id_here",
    "status": "DELIVERED"
  }
  \`\`\`

## Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Next.js API   │    │   MongoDB       │
│   Frontend      │◄──►│   Routes        │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google OAuth  │    │   OpenAI API    │    │   Mongoose ODM  │
│   Authentication│    │   AI Features   │    │   Data Models   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## Data Models

### Customer
\`\`\`typescript
{
  name: string
  email: string (unique)
  phone: string
  totalSpend: number
  visitCount: number
  lastActive: Date
}
\`\`\`

### Order
\`\`\`typescript
{
  customerId: ObjectId
  amount: number
  orderDate: Date
}
\`\`\`

### Campaign
\`\`\`typescript
{
  name: string
  description: string
  rules: Rule[]
  message: string
  status: 'draft' | 'active' | 'completed'
  targetCount: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  createdBy: string
}
\`\`\`

### Communication Log
\`\`\`typescript
{
  campaignId: ObjectId
  customerId: ObjectId
  message: string
  status: 'SENT' | 'DELIVERED' | 'FAILED'
  sentAt: Date
  deliveredAt?: Date
}
\`\`\`

## AI Features

### Natural Language Rule Conversion
Convert plain English descriptions into structured rules:

**Input**: "People who haven't shopped in 6 months and spent over ₹5000"

**Output**: 
\`\`\`json
{
  "rules": [
    {
      "id": "1",
      "field": "lastActive",
      "operator": "<",
      "value": "180",
      "logic": "AND"
    },
    {
      "id": "2", 
      "field": "totalSpend",
      "operator": ">",
      "value": "5000"
    }
  ]
}
\`\`\`

### Campaign Message Generation
AI-powered message creation based on campaign context:

**Input**: Campaign name and description

**Output**: Personalized message template with {name} placeholder

## Deployment


### Backend (Render/Railway)
1. Create a new web service
2. Connect your repository
3. Set environment variables
4. Deploy with automatic builds

### Database (MongoDB Atlas)
1. Create a cluster on MongoDB Atlas
2. Set up database user and network access
3. Get connection string and update `MONGODB_URI`

## Usage Examples

### Creating a Customer via API
\`\`\`bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com", 
    "phone": "+91-9876543210",
    "totalSpend": 25000,
    "visitCount": 8
  }'
\`\`\`

### Creating an Order
\`\`\`bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_id_here",
    "amount": 3500
  }'
\`\`\`

### Campaign Rule Examples
- High-value customers: `totalSpend > 50000`
- Inactive customers: `lastActive < 90` (days)
- Frequent visitors: `visitCount > 10`
- New customers: `visitCount <= 2 AND totalSpend < 5000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
