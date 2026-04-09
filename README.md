**Flyte**

Flyte is a social platform designed for airline travelers to connect, share updates, and communicate in real-time. Think of it as a "Reddit for flights" where users can join communities based on their travel schedules, engage in peer-to-peer messaging, and stay informed through a robust notification system.

🚀 **Key Features**
Offline-First Experience: Built with WatermelonDB on the frontend to ensure seamless usability even when internet connectivity is intermittent (like during a flight).

Real-Time Communication: A dual-WebSocket architecture powers the app—one dedicated to direct messaging (DM) and the other for global application notifications.

Secure Authentication: Integration with Google OAuth2 and JWT (JSON Web Tokens) ensures secure and standardized user access.

Reddit-Style Platform: Connect with fellow travelers on the same or similar flights to discuss delays, share tips, or coordinate meetups.

🛠️ **Tech Stack**

Backend Framework: Spring Boot (Java)

Database: PostgreSQL (Relational)

Messaging: Dual WebSockets for DMs and notifications

Security: Spring Security with Google OAuth and JWT

Frontend Framework: React Native

Styling: TailwindCSS

Offline Storage: WatermelonDB for data persistence and synchronization

🏗️ **Architecture**

The app is built using a modern distributed architecture:

RESTful APIs: The backend exposes services via REST for core business logic and data management.

Data Integrity: Structured using DTOs and transactional service methods to ensure consistent data handling across the system.

Scalability: Designed with a clean separation between the mobile client and the Spring Boot backend to support high-throughput real-time interactions.

🏁 **Getting Started**

Prerequisites
Java 17+

Node.js & npm/yarn

PostgreSQL

Android Studio / Xcode (for mobile development)

Backend Setup
Clone the repository.

Configure your PostgreSQL credentials in src/main/resources/application.properties.

Set up your Google OAuth credentials.

Run the application using ./mvnw spring-boot:run.

Mobile Setup
Navigate to the mobile directory.

Install dependencies: npm install.

Configure your backend API URL in the environment settings.

Run the app: npx react-native run-android or npx react-native run-ios.
