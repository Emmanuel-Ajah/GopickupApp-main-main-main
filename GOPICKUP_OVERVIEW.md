# 🚚 **Go Pickup: App Detail & Feature Breakdown**

**Go Pickup** is a dual-purpose platform that combines a **Building Materials Marketplace** with a **General Logistics Service**. It connects customers with material vendors and provides a robust ecosystem for booking transportation and tracking deliveries.

---

### 🌟 **Core User Features**

#### 🏦 **1. Building Material Marketplace**

The app serves as a digital storefront for heavy materials.

- **Material Selection**: Dedicated modules for purchasing popular building materials (e.g., **BUA Cement**, **Mangal Cement**).
- **Natural Resources**: Users can order bulk resources like **Coal** directly from mining sites.
- **Cart System**: A seamless "Add to Cart" and checkout workflow for managing multiple material orders.

#### 📦 **2. Logistics & Load Posting**

Beyond buying materials, users can use the app for any general delivery needs.

- **Post a Load**: If you have goods to ship, you can post a "Load Request" specifying the item type (cartons, groceries, etc.), pickup location, and destination.
- **Vehicle Selection**: Users can choose their preferred vehicle type based on their needs, including:
  - **Vans & Pickups** (Light loads)
  - **Flat beds & Trailers** (Industrial loads)
  - **Tippers** (Loose materials like sand/gravel)
- **Price Negotiation**: A unique feature where users can post a request and then negotiate the final delivery rate with an admin or driver via the built-in chat.

#### 📍 **3. Advanced Order Tracking**

Instead of just a simple "shipped" status, Go Pickup provides a detailed **Delivery Timeline**:

1.  **Order Received**: Waiting for the vendor to release materials.
2.  **Preparing Order**: Status update when goods are being loaded.
3.  **Driver Assigned**: Linkage with a specific driver.
4.  **In Transit**: Active move to the destination.
5.  **Delivered**: Final confirmation at the client's location.

#### 💬 **4. Communication & Support**

- **Real-time Chat**: Connects users directly with the support team or drivers to discuss order specifics.
- **Notifications**: Instant alerts for status changes (e.g., "Driver has left pickup location").

---

### 👨‍💼 **Business & Partner Features**

#### **1. Service Provider Onboarding**

The app scales by allowing businesses to join the network:

- **Vendor Registration**: Material suppliers can register to list their inventory.
- **Driver Registration**: Independent truck owners can register to join the "Go Pickup" logistics pool.

#### **2. Admin Dashboard**

A powerful control center for the app owners to:

- Manage users and verify providers.
- Negotiate rates for "Post a Load" requests.
- Track overall platform activity and delivery exceptions.

---

### 🛠️ **Technical Stack**

| Component          | Technology                                                            |
| :----------------- | :-------------------------------------------------------------------- |
| **Frontend**       | **Expo (React Native)** with TypeScript                               |
| **Backend**        | **Node.js** with **Express**                                          |
| **Database**       | **MongoDB** (using Mongoose for data modeling)                        |
| **Authentication** | **JWT (JSON Web Tokens)** + **Bcrypt** for security                   |
| **Map Services**   | `react-native-maps` & `google-maps-directions`                        |
| **UI/UX**          | **Ionicons**, **Expo Blur**, and **Reanimated** for fluid transitions |

---

### 🎨 **Design & Aesthetics**

- **Theme**: A clean, professional **Forest Green (`#439D25`)** and **White** theme representing reliability and logistics.
- **UI Elements**: Uses modern "Glassmorphism" cards, high-quality material imagery, and a structured grid layout for easy navigation between different services.

---

### **Summary of App Purpose**

If **Uber** and **Amazon Construction Materials** had a baby, it would be **Go Pickup**. It simplifies the complex process of sourcing heavy building materials and finding reliable transportation to get them to a construction site.
