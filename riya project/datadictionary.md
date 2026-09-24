# Data Dictionary

This document outlines the data dictionary for the database schema of the Farmer Marketplace project.

---

## 1. users

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the user (Primary Key, Auto Increment) |
| `name` | VARCHAR(100) | Full name of the user |
| `email` | VARCHAR(100) | Unique email address used for login and notifications |
| `password` | VARCHAR(255) | Encrypted/hashed password for user authentication |
| `role` | ENUM('farmer', 'customer') | System role determining permissions and interface access |
| `phone` | VARCHAR(20) | Contact telephone number of the user |
| `address` | TEXT | Physical address or primary delivery location of the user |
| `profile_image` | VARCHAR(255) | URL or file path to the user's profile picture |
| `bio` | TEXT | Short biography or personal/farm introduction |
| `farm_name` | VARCHAR(100) | Registered or display name of the farm (farmer role) |
| `farm_location` | VARCHAR(255) | Geographical location or district of the farm (farmer role) |
| `created_at` | TIMESTAMP | Timestamp when the user account was created |
| `updated_at` | TIMESTAMP | Timestamp when the user profile was last updated |

---

## 2. products

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the product (Primary Key, Auto Increment) |
| `farmer_id` | INT | Foreign key referencing the farmer who listed the product (`users.id`) |
| `name` | VARCHAR(100) | Name of the produce or agricultural item |
| `category` | VARCHAR(50) | Category of produce (e.g., Vegetables, Fruits, Dairy, Grains) |
| `description` | TEXT | Comprehensive description of product quality, harvest, and features |
| `price` | DECIMAL(10, 2) | Price per unit in currency |
| `quantity` | INT | Available stock quantity in inventory |
| `unit` | VARCHAR(20) | Measurement unit for quantity (e.g., 'kg', 'bunch', 'dozen') |
| `image_url` | VARCHAR(255) | URL or file path to the product display image |
| `is_available` | BOOLEAN | Flag indicating whether the item is active and available for purchase |
| `created_at` | TIMESTAMP | Timestamp when the product listing was created |
| `updated_at` | TIMESTAMP | Timestamp when the product listing was last updated |

---

## 3. orders

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the order (Primary Key, Auto Increment) |
| `customer_id` | INT | Foreign key referencing the customer who placed the order (`users.id`) |
| `order_number` | VARCHAR(20) | Unique alphanumeric reference code for tracking the order |
| `total_amount` | DECIMAL(10, 2) | Total order monetary value including all items |
| `status` | ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'on_the_way', 'delivered', 'cancelled') | Current lifecycle stage and delivery progression of the order |
| `shipping_address` | TEXT | Complete destination address for delivery |
| `destination_latitude` | DECIMAL(10, 8) | GPS latitude coordinate of the customer's delivery location |
| `destination_longitude` | DECIMAL(11, 8) | GPS longitude coordinate of the customer's delivery location |
| `payment_method` | VARCHAR(50) | Payment mode selected by customer (e.g., COD, online, card) |
| `payment_status` | ENUM('pending', 'paid', 'completed', 'failed') | Current status of payment transaction |
| `notes` | TEXT | Special delivery instructions or remarks provided by customer |
| `created_at` | TIMESTAMP | Timestamp when the order was submitted |
| `updated_at` | TIMESTAMP | Timestamp when the order details or status were last updated |

---

## 4. order_items

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the line item (Primary Key, Auto Increment) |
| `order_id` | INT | Foreign key referencing the parent order (`orders.id`) |
| `product_id` | INT | Foreign key referencing the purchased product (`products.id`) |
| `farmer_id` | INT | Foreign key referencing the farmer supplying the item (`users.id`) |
| `quantity` | INT | Number of product units ordered |
| `price` | DECIMAL(10, 2) | Price per unit at the time the order was placed |
| `total` | DECIMAL(10, 2) | Total cost for this line item (`quantity * price`) |
| `created_at` | TIMESTAMP | Timestamp when the item was recorded in the order |

---

## 5. order_status_history

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the history entry (Primary Key, Auto Increment) |
| `order_id` | INT | Foreign key referencing the associated order (`orders.id`) |
| `status` | VARCHAR(50) | Order status milestone reached (e.g., 'confirmed', 'out_for_delivery') |
| `note` | TEXT | Optional remarks or explanation accompanying the status update |
| `updated_by` | INT | User ID of the person or admin who initiated the status change |
| `updated_by_role` | VARCHAR(20) | Role of the user updating status (e.g., 'farmer', 'customer', 'system') |
| `created_at` | TIMESTAMP | Timestamp when this status update occurred |

---

## 6. delivery_assignments

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the delivery assignment (Primary Key, Auto Increment) |
| `order_id` | INT | Foreign key referencing the order to be delivered (`orders.id`) |
| `farmer_id` | INT | Foreign key referencing the farmer dispatching the delivery (`users.id`) |
| `delivery_person_name` | VARCHAR(100) | Name of the assigned delivery agent or driver |
| `delivery_person_phone` | VARCHAR(20) | Contact phone number of the delivery agent |
| `vehicle_type` | VARCHAR(50) | Type of delivery vehicle (e.g., motorcycle, van, truck) |
| `vehicle_number` | VARCHAR(50) | License plate or vehicle identification number |
| `tracking_token` | VARCHAR(64) | Secure random access token for real-time tracking page |
| `tracking_active` | BOOLEAN | Flag indicating whether live GPS location broadcast is active |
| `status` | ENUM('assigned', 'picked_up', 'out_for_delivery', 'on_the_way', 'delivered') | Current state of delivery fulfillment |
| `notes` | TEXT | Driver notes, route remarks, or delivery instructions |
| `assigned_at` | TIMESTAMP | Timestamp when driver was assigned to the order |
| `delivery_started_at` | TIMESTAMP | Timestamp when the driver departed for delivery |
| `delivery_completed_at` | TIMESTAMP | Timestamp when the delivery was marked completed |
| `created_at` | TIMESTAMP | Timestamp when the assignment record was created |
| `updated_at` | TIMESTAMP | Timestamp when the assignment record was last updated |

---

## 7. delivery_locations

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the GPS breadcrumb (Primary Key, Auto Increment) |
| `delivery_assignment_id` | INT | Foreign key referencing the delivery assignment (`delivery_assignments.id`) |
| `latitude` | DECIMAL(10, 8) | Recorded latitude coordinate from driver's GPS device |
| `longitude` | DECIMAL(11, 8) | Recorded longitude coordinate from driver's GPS device |
| `accuracy` | FLOAT | Accuracy tolerance of the GPS fix in meters |
| `speed` | FLOAT | Instantaneous velocity/speed of travel |
| `heading` | FLOAT | Heading/bearing direction of vehicle travel in degrees |
| `recorded_at` | TIMESTAMP | Timestamp when the GPS coordinate was logged |

---

## 8. activity_logs

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the activity log entry (Primary Key, Auto Increment) |
| `user_id` | INT | Foreign key referencing the user who triggered the action (`users.id`) |
| `action` | VARCHAR(100) | Name or action code representing the operation performed |
| `entity_type` | VARCHAR(50) | Type of entity affected (e.g., 'order', 'product', 'user') |
| `entity_id` | INT | Primary key value of the affected entity |
| `details` | TEXT | Description or JSON payload containing detailed event information |
| `ip_address` | VARCHAR(50) | Client IP address from which the action was dispatched |
| `created_at` | TIMESTAMP | Timestamp when the activity was logged |

---

## 9. banners

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the promotional banner (Primary Key, Auto Increment) |
| `title` | VARCHAR(255) | Main headline text displayed on the banner |
| `subtitle` | TEXT | Supporting subtitle or promotional message text |
| `image_url` | VARCHAR(255) | Asset path or URL of the promotional banner graphic |
| `link_url` | VARCHAR(255) | Target hyperlink navigated to when banner is clicked |
| `is_active` | BOOLEAN | Flag toggling banner visibility on user-facing pages |
| `display_order` | INT | Numeric sorting index for displaying banners sequentially |
| `created_at` | TIMESTAMP | Timestamp when the banner was created |
| `updated_at` | TIMESTAMP | Timestamp when the banner was last modified |

---

## 10. notifications

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the notification (Primary Key, Auto Increment) |
| `user_id` | INT | Foreign key referencing the recipient user (`users.id`) |
| `title` | VARCHAR(255) | Brief subject line or title of the notification |
| `message` | TEXT | Full text message body of the notification |
| `type` | VARCHAR(50) | Notification category code (e.g., 'order', 'delivery', 'system') |
| `is_read` | BOOLEAN | Status flag indicating if notification has been viewed |
| `created_at` | TIMESTAMP | Timestamp when the notification was sent |

---

## 11. reviews

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the review (Primary Key, Auto Increment) |
| `product_id` | INT | Foreign key referencing the evaluated product (`products.id`) |
| `customer_id` | INT | Foreign key referencing the reviewing customer (`users.id`) |
| `rating` | INT | Numerical rating given to the product (value between 1 and 5) |
| `comment` | TEXT | Customer feedback, review text, or product critique |
| `created_at` | TIMESTAMP | Timestamp when the review was submitted |

---

## 12. wishlist

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Unique identifier for the wishlist item (Primary Key, Auto Increment) |
| `customer_id` | INT | Foreign key referencing the customer saving the item (`users.id`) |
| `product_id` | INT | Foreign key referencing the saved product (`products.id`) |
| `created_at` | TIMESTAMP | Timestamp when the product was added to wishlist |
