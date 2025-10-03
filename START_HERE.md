# 🚀 Quick Start Guide

## Method 1: Automatic Setup (Recommended)

Double-click the **`setup-and-run.bat`** file in Windows Explorer, or run:

```bash
.\setup-and-run.bat
```

This will:
1. Install all dependencies
2. Start the development server
3. Open the app at http://localhost:3000

---

## Method 2: Manual Setup

If the batch file doesn't work, run these commands manually:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: **http://localhost:3000**

---

## 🎯 How to Use the App

### Import SQL Database

1. Click the **"Import SQL/DBML"** button (green button in header)

2. Paste your entire SQL database:
   ```sql
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     username VARCHAR(50) UNIQUE NOT NULL,
     email VARCHAR(100) NOT NULL
   );

   CREATE TABLE posts (
     id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT NOT NULL,
     title VARCHAR(255),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

3. Click **"Import & Generate"**

4. Your diagram appears instantly! ✨

### Features

- ✅ **SQL Import** - Paste entire SQL dumps
- ✅ **DBML Support** - Use DBML syntax
- ✅ **Auto Layout** - Automatic table positioning
- ✅ **Export PNG** - Save diagram as image
- ✅ **Export DBML** - Save as DBML file
- ✅ **Zoom & Pan** - Navigate large diagrams
- ✅ **Drag Tables** - Custom positioning
- ✅ **Sample Schemas** - Pre-built examples

---

## 📝 Supported SQL Features

- ✅ CREATE TABLE statements
- ✅ Primary Keys (PRIMARY KEY, PK)
- ✅ Foreign Keys (FOREIGN KEY ... REFERENCES)
- ✅ NOT NULL constraints
- ✅ UNIQUE constraints
- ✅ AUTO_INCREMENT
- ✅ DEFAULT values
- ✅ COMMENT notes
- ✅ Multiple tables & schemas
- ✅ Complex relationships

---

## 🛠️ Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
# Note the PID, then:
taskkill /F /PID <PID_NUMBER>
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules if it exists
rmdir /s node_modules
# Reinstall
npm install
```

### Browser Shows ERR_CONNECTION_REFUSED
1. Make sure the dev server is running
2. Check console for error messages
3. Try a different port by modifying `vite.config.ts`:
   ```ts
   server: {
     port: 3001  // Change to any available port
   }
   ```

---

## 📋 Example: Full E-Commerce Database

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

Just paste this entire SQL into the import dialog and click "Import & Generate"!

---

## 🌟 Pro Tips

1. **File Upload**: Click "Upload File" in import dialog to load `.sql` files directly
2. **Auto Layout**: After importing, click "Auto Layout" for optimal positioning  
3. **Export**: Use "Export PNG" to save high-quality diagram images
4. **Samples**: Try pre-built examples from "Samples" dropdown
5. **DBML**: Export as DBML to edit and re-import later

---

**Need Help?** Check the main `README.md` for detailed documentation.

**Happy Diagramming! 🎨**
