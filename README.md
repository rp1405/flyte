# ✈️ Flyte

**Flyte** is a social platform designed for airline travelers to connect, share updates, and communicate in real-time. Think of it as a **"Reddit for flights"** where users can join communities based on their travel schedules, build a network of travel companions, engage in peer-to-peer messaging, and stay informed through a robust notification system.

---

## 🚀 **Key Features**

*   **👥 Smart Social Networking (New!)**
    *   **Add Friend System:** Seamlessly send, accept, or decline friend requests to build your network of frequent flyers and travel buddies.
    *   **Flight-Based Communities:** Connect with fellow travelers on the same or similar flights to discuss delays, share lounge tips, or coordinate airport meetups.
*   **📡 Offline-First Experience**
    *   Built with **WatermelonDB** on the frontend to ensure seamless usability, post viewing, and drafting messages even when internet connectivity is intermittent (like during a flight).
*   **💬 Real-Time Communication**
    *   A high-performance **dual-WebSocket architecture** powers the app—one dedicated to low-latency direct messaging (DM) and the other for instantaneous global application notifications.
*   **🔒 Secure Authentication**
    *   Robust integration with **Google OAuth2** and **JWT (JSON Web Tokens)** ensures secure, standardized, and hassle-free user onboarding.

---

## 🛠️ **Tech Stack**

*   **Backend Framework:** Spring Boot (Java 17)
*   **Database:** PostgreSQL (Relational)
*   **Real-time Protocol:** Dual WebSockets for DMs and notifications
*   **Security & Auth:** Spring Security with Google OAuth 2.0 and JWT
*   **Frontend Framework:** React Native (Cross-platform iOS/Android)
*   **Styling:** TailwindCSS (NativeWind)
*   **Offline Engine:** WatermelonDB for local data persistence and background synchronization

---

## 🏗️ **Architecture & Engineering**

The platform is designed with a modern, high-throughput distributed architecture:

*   **RESTful Micro-services:** The backend exposes highly optimized REST endpoints for core business logic, user management, and social interactions.
*   **Data Integrity & Security:** Built using strict **Data Transfer Objects (DTOs)** and ACID-compliant transactional service methods to guarantee zero data loss.
*   **Scalable Separation:** Complete decoupling of the mobile client and the Spring Boot backend allows both systems to scale independently under heavy real-time traffic.

---

## 🏁 **Getting Started**

### 📋 **Prerequisites**
*   Java 17+ Installed
*   Node.js & npm/yarn Installed
*   PostgreSQL Instance Running
*   Android Studio / Xcode (for mobile emulation)

### ⚙️ **Backend Setup**
1.  **Clone the repository:** `git clone <repo-url>`
2.  **Configure Environment:** Update your PostgreSQL and Google OAuth credentials in `src/main/resources/application.properties`.
3.  **Boot the Server:** Run the application using `./mvnw spring-boot:run`.

### 📱 **Mobile Setup**
1.  **Navigate to directory:** `cd mobile`
2.  **Install dependencies:** `npm install`
3.  **Set Environment Variables:** Configure your backend API URL in your `.env` settings.
4.  **Launch the App:** Run `npx react-native run-android` or `npx react-native run-ios`.
