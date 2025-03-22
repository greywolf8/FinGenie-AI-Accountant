#FinGenie
FinGenie is a AI Accountant that provides financial management services with decentralized authentication and Blockchain based Decentralized Storage.

#Features
Decentralized authentication using DIDs (Decentralized Identifiers)
User registration and login functionality using DIDs
Persistent user sessions using Blockchain storage (Arweave + Bundlr)
Firebase integration for backend services and accounts atorage
Prerequisites
Node.js (v16 or later recommended)
npm or yarn
Firebase account for backend services
Arweave + Bundlr


#Installation
Clone the repository:

bash


git clone https://github.com/yourusername/fingenie.git
cd fingenie
#Install dependencies:

bash


npm install
# or
yarn install

#for blockchain based Storage

npm install arweave arbundles bundlr-network
or
yarn add arweave arbundles bundlr-network


Create a Firebase project:

Go to Firebase Console
Create a new project
Set up Authentication, Firestore, and any other services needed
Get your Firebase configuration (apiKey, authDomain, etc.)
Create a .env.local file in the root directory with your Firebase configuration:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
Start the development server:

bash


npm run dev
or
yarn dev
Open http://localhost:3000 in your browser to see the application.

#Project Structure
/app: Next.js app directory containing pages and layouts
/components: Reusable React components
/contexts: React context providers (including AuthContext)
/public: Static assets
/styles: CSS and styling files
Authentication
The application uses a custom authentication system with decentralized identifiers (DIDs). Users can:

Register with a username, DID, and blockchain address
Login using their DID and username
Maintain persistent sessions through local storage
#Deployment
This is a Next.js application that can be deployed to various platforms:

Vercel (recommended):

bash


npm install -g vercel
vercel
Netlify, AWS, or other platforms that support Next.js applications.

Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
#License
MIT License

Note: This README is based on the limited code snippet provided. For a more comprehensive README, additional information about the application's purpose, features, and structure would be helpful.
