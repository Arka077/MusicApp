# Music App Frontend

A modern, responsive React-based music streaming application frontend built with Vite.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── MusicPlayer.jsx  # Music player control
│   │   ├── MusicCard.jsx    # Music card display
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   ├── Alert.jsx        # Alert notifications
│   │   └── ProtectedRoute.jsx # Route protection for auth
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Library.jsx      # Music library page
│   │   └── Upload.jsx       # Music upload page
│   ├── services/            # API services
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── authService.js   # Authentication API calls
│   │   └── musicService.js  # Music API calls
│   ├── context/             # React context providers
│   │   ├── AuthContext.jsx  # Authentication context
│   │   └── MusicContext.jsx # Music player context
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   └── useMusic.js      # Music player hook
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # Application constants
│   │   └── helpers.js       # Helper functions
│   ├── styles/              # CSS stylesheets
│   │   ├── global.css       # Global styles
│   │   ├── Header.css       # Header styles
│   │   ├── MusicPlayer.css  # Player styles
│   │   ├── MusicCard.css    # Card styles
│   │   ├── Home.css         # Home page styles
│   │   ├── Auth.css         # Auth page styles
│   │   ├── Library.css      # Library page styles
│   │   ├── Upload.css       # Upload page styles
│   │   ├── LoadingSpinner.css # Spinner styles
│   │   └── Alert.css        # Alert styles
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global CSS reset
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 📦 Key Dependencies

- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 🎨 Features

### Pages

- **Home** - Landing page with features overview
- **Login** - User authentication
- **Register** - New user registration
- **Library** - Browse and search music
- **Upload** - Upload new music tracks

### Components

- **Header** - Navigation and auth status
- **MusicPlayer** - Audio controls and progress tracking
- **MusicCard** - Music track display
- **ProtectedRoute** - Route guard for authenticated pages
- **Alert** - Notification system
- **LoadingSpinner** - Loading state indicator

## 🔐 Authentication

The app uses JWT tokens stored in localStorage for authentication. Protected routes require valid authentication tokens.

### Login Flow

1. User enters email and password
2. AuthService sends credentials to backend
3. Token is stored in localStorage
4. User is redirected to library

### Protected Routes

- `/library` - View music library
- `/upload` - Upload new music

## 🎵 Music Player

The MusicPlayer component provides:

- Play/Pause controls
- Next/Previous track navigation
- Progress bar with time display
- Auto-play next track on completion

## 🔌 API Integration

All API calls go through a centralized Axios instance (`api.js`) that:

- Sets the base URL to `http://localhost:5000/api`
- Automatically adds JWT tokens to request headers
- Handles response interceptors

### Available Services

**AuthService**

- `register(userData)` - Create new account
- `login(credentials)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get current user from storage
- `isAuthenticated()` - Check auth status

**MusicService**

- `getAllMusic()` - Fetch all music
- `getMusicById(id)` - Fetch specific music
- `searchMusic(query)` - Search music
- `getAlbums()` - Fetch albums
- `getAlbumById(id)` - Fetch album details
- `uploadMusic(formData)` - Upload new music

## 🎯 Custom Hooks

### useAuth()

Access authentication state and methods:

```javascript
const { user, loading, error, login, register, logout, isAuthenticated } =
  useAuth();
```

### useMusic()

Access music player state and methods:

```javascript
const {
  currentMusic,
  isPlaying,
  playlist,
  play,
  pause,
  playNext,
  playPrevious,
} = useMusic();
```

## 🎨 Styling

The app uses a dark theme with a purple/blue accent color scheme:

- Primary Color: `#667eea`
- Secondary Color: `#764ba2`
- Background: `#1e1e2e` - `#2d2d44`
- Text: `#e0e0e0`

All styles are component-scoped CSS modules with a global stylesheet for consistency.

## 🔄 State Management

The app uses React Context API for global state:

- **AuthContext** - Manages authentication state
- **MusicContext** - Manages music player state

## 📱 Responsive Design

The app is fully responsive with breakpoints at:

- 768px - Tablet
- 480px - Mobile

## 🛠️ Development Tips

1. **Add New Page**: Create component in `pages/`, add route in `App.jsx`
2. **Create Service**: Add methods to appropriate service file in `services/`
3. **Add Component**: Create JSX file in `components/` and matching CSS
4. **Custom Hook**: Create file in `hooks/` following naming convention `use*`
5. **Utility Functions**: Add to `utils/helpers.js`

## 🐛 Troubleshooting

### API calls failing

- Ensure backend is running on `http://localhost:5000`
- Check token is valid in localStorage
- Verify CORS settings on backend

### Component styles not loading

- Ensure CSS file is imported in component
- Check CSS file path
- Clear browser cache

### Authentication issues

- Clear localStorage and login again
- Check backend token validation
- Verify token is set in request headers

## 📝 Notes

- The app requires the backend server running at `http://localhost:5000`
- JWT tokens are stored in localStorage (consider using more secure storage in production)
- File uploads require multipart/form-data support on backend
