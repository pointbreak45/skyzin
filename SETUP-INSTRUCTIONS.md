# 🚀 SkyZin E-Learning Platform - Setup Instructions

## 📋 Project Structure
```
SkyZin-main/
├── backend/        # Node.js/Express API server
├── admin/          # Next.js admin dashboard
├── user/           # Next.js user interface
├── install-all.bat # Install all dependencies
├── start-all.bat   # Start all services
├── start-backend.bat
├── start-admin.bat
└── start-user.bat
```

## 🛠️ Prerequisites
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## 📦 Quick Setup

### Option 1: Automated Installation (Recommended)
1. **Double-click `install-all.bat`** - This will install all dependencies for all components
2. **Double-click `start-all.bat`** - This will start all services in separate terminal windows

### Option 2: Manual Installation
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install admin dependencies
cd ../admin
npm install

# Install user dependencies
cd ../user
npm install
```

## 🏃‍♂️ Running the Applications

### Start All Services (Recommended)
```bash
# Run this command or double-click start-all.bat
start-all.bat
```
This opens 3 terminal windows with:
- **Backend Server**: http://localhost:5000
- **Admin Panel**: http://localhost:4000
- **User Interface**: http://localhost:3000

### Start Individual Services

#### Backend Server
```bash
# Run this command or double-click start-backend.bat
start-backend.bat
```
- Runs on: **http://localhost:5000**
- API endpoints available at `/api/*`

#### Admin Panel
```bash
# Run this command or double-click start-admin.bat
start-admin.bat
```
- Runs on: **http://localhost:4000**
- Responsive admin dashboard with tables optimized for all devices

#### User Interface
```bash
# Run this command or double-click start-user.bat
start-user.bat
```
- Runs on: **http://localhost:3000**
- Main user-facing e-learning platform

## 🔧 Development Commands

### Backend Commands
```bash
cd backend
npm run dev     # Start with nodemon (auto-restart)
npm start       # Start production server
```

### Admin Commands
```bash
cd admin
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run linter
```

### User Commands
```bash
cd user
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run linter
```

## 📱 Responsive Design Features

The admin panel tables are now fully responsive and optimized for:
- 📱 **Mobile devices** (< 768px) - Card-based layout
- 📱 **Z Fold phones** (316px - 424px) - Compact table mode
- 💻 **Tablets** (768px - 1024px) - Responsive table
- 🖥️ **Desktop** (> 1024px) - Full table layout

### Key Responsive Features:
- ✅ Mobile-friendly card layouts for tables
- ✅ Z Fold phone specific optimizations
- ✅ Priority-based column visibility
- ✅ Touch-optimized controls
- ✅ Smooth transitions between layouts

## 🌐 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:5000 | REST API server |
| Admin Panel | http://localhost:4000 | Administrative dashboard |
| User Interface | http://localhost:3000 | Main application |

## 📁 Important Files

### Configuration Files
- `backend/package.json` - Backend dependencies and scripts
- `admin/package.json` - Admin panel dependencies and scripts
- `user/package.json` - User interface dependencies and scripts

### Startup Scripts
- `install-all.bat` - Install all packages
- `start-all.bat` - Start all services
- `start-backend.bat` - Start only backend
- `start-admin.bat` - Start only admin panel
- `start-user.bat` - Start only user interface

## ⚠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: Port 3000/4000/5000 is already in use
   ```
   - Stop other applications using these ports
   - Or modify port numbers in package.json scripts

2. **Dependencies Not Found**
   ```
   Error: Cannot find module '...'
   ```
   - Run `install-all.bat` again
   - Delete `node_modules` folders and reinstall

3. **Node Version Issues**
   ```
   Error: Requires Node.js version 18 or higher
   ```
   - Update Node.js from [nodejs.org](https://nodejs.org/)

### Manual Dependency Installation
If automated installation fails, install manually:

```bash
# Root
npm install node-fetch@^2.7.0

# Backend
cd backend
npm install bcryptjs@^2.4.3 cloudinary@^2.7.0 cors@^2.8.5 dotenv@^16.3.1 express@^4.18.2 express-rate-limit@^7.1.5 express-validator@^7.0.1 helmet@^7.1.0 jsonwebtoken@^9.0.2 mongoose@^8.0.0 multer@^2.0.2 nodemailer@^7.0.6 socket.io@^4.8.1 socket.io-client@^4.8.1
npm install --save-dev nodemon@^3.0.2

# Admin
cd ../admin
npm install

# User
cd ../user
npm install
```

## 🚀 Next Steps

1. **Database Setup**: Configure MongoDB connection in `backend/.env`
2. **Environment Variables**: Set up required environment variables
3. **Testing**: Test all functionality across different devices
4. **Deployment**: Configure for production deployment

## 📞 Support

If you encounter any issues:
1. Check the terminal output for error messages
2. Ensure all dependencies are installed correctly
3. Verify Node.js version compatibility
4. Check that ports 3000, 4000, and 5000 are available

---

**Happy coding! 🎉**