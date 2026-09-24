# Database Setup Instructions

## Prerequisites
1. Install XAMPP from https://www.apachefriends.org/
2. Start Apache and MySQL services in XAMPP Control Panel

## Steps to Set Up Database

1. Open phpMyAdmin: http://localhost/phpmyadmin

2. Click on "New" in the left sidebar

3. Enter database name: `farmer_marketplace`

4. Click "Create" button

5. Click on the "Import" tab at the top

6. Click "Choose File" and select the `schema.sql` file from the `database` folder

7. Click "Go" button at the bottom to import

8. You should see a success message

## Database Connection Details

- Host: localhost
- Port: 3306
- Database: farmer_marketplace
- Username: root
- Password: (empty)

## Testing the Database

You can test the database connection by running the server:

```bash
cd server
npm start