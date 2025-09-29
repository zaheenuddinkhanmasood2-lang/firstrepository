# StudyShare - Classmate Note Sharing App

A beautiful, production-ready single-page application that allows classmates to share handwritten notes with animated thumbnails and comprehensive features.

## Features

### 🎨 Visual Design
- **Animated Thumbnails**: Each note displays as an animated thumbnail with entrance animations and hover effects (flip, zoom, parallax)
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewing
- **Modern UI**: Clean, professional interface with subtle shadows and smooth transitions
- **Accessibility**: Full keyboard navigation support, ARIA labels, and focus management

### 📝 Note Management
- **Upload Support**: Accept PDF and image files (JPG, PNG)
- **First Page Extraction**: Automatically extracts and displays the first page as thumbnail
- **Full Note Viewer**: Modal viewer with zoom capability
- **Download Functionality**: One-click download of original notes
- **Tagging System**: Add and filter notes by custom tags
- **Class Organization**: Organize notes by subject/class

### 🔍 Search & Filter
- **Real-time Search**: Search notes by title and tags
- **Class Filtering**: Filter notes by specific classes
- **Tag Filtering**: Click tags to filter related notes
- **Sorting Options**: Sort by date (newest/oldest) or name (A-Z/Z-A)

### 💾 Data Persistence
- **Local Storage**: Notes persist between browser sessions
- **Sample Data**: Includes sample notes for demonstration

## Technical Implementation

### Architecture
- **Single Page Application**: Built with vanilla HTML, CSS, and JavaScript
- **Modular Design**: Clean, maintainable code structure with clear separation of concerns
- **Component-based**: Reusable UI components and utility functions

### Animations
- **CSS Animations**: Smooth, performant animations using CSS transforms and transitions
- **Entrance Animations**: Staggered slide-up animations for note cards
- **Hover Effects**: Multiple animation variants (flip, zoom, parallax)
- **Micro-interactions**: Subtle feedback for user actions

### Performance
- **Optimized Images**: Auto-cropped thumbnails for consistent grid layout
- **Debounced Search**: Efficient search with 300ms debounce
- **Lazy Loading**: Efficient rendering of large note collections
- **Local Processing**: PDF processing handled client-side

## Installation & Integration

### Quick Start
1. Download all files to your web server directory
2. Open `index.html` in a web browser
3. Start uploading and sharing notes!

### File Structure
```
studyshare/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and animations
├── script.js           # Application logic and functionality
└── README.md          # This documentation
```

### Dependencies
- **PDF-lib**: Included via CDN for PDF processing
- **Google Fonts**: Inter font family for typography
- **No build process required**: Ready to use out of the box

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- CSS Grid and Flexbox for layout
- LocalStorage for data persistence

## Customization

### Adding New Classes
Update the class options in both the HTML select elements and the JavaScript `getClassDisplayName()` method:

```javascript
// In script.js
getClassDisplayName(classKey) {
    const classNames = {
        math: 'Mathematics',
        physics: 'Physics',
        // Add your new classes here
        computer_science: 'Computer Science',
        art: 'Art History'
    };
    return classNames[classKey] || classKey;
}
```

### Styling Modifications
- **Colors**: Update CSS custom properties in `styles.css`
- **Animations**: Modify animation keyframes and timing functions
- **Layout**: Adjust grid columns and spacing in `.notes-grid`
- **Typography**: Change font weights and sizes

### Feature Extensions
- **Categories**: Add subcategories within classes
- **Collaboration**: Add user accounts and sharing permissions
- **Export**: Bulk export functionality
- **Advanced Search**: Full-text search within notes

## Security Considerations

### File Handling
- File type validation on upload
- Client-side processing (no server uploads)
- Size limits can be implemented

### Data Storage
- Local storage only (no external data transmission)
- Can be enhanced with encrypted storage
- Easy migration to backend storage

## Production Deployment

### Web Server Setup
1. Upload files to your web server
2. Ensure HTTPS for secure file handling
3. Configure appropriate MIME types

### CDN Integration
- Replace local assets with CDN versions
- Implement image optimization services
- Add service worker for offline functionality

### Performance Optimization
- Minify CSS and JavaScript files
- Compress images and assets
- Implement caching strategies

## Accessibility Features

- **Keyboard Navigation**: Full app navigation with Tab, Enter, and Escape keys
- **Screen Reader Support**: ARIA labels and semantic HTML structure
- **Focus Management**: Proper focus handling in modals and interactive elements
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design with touch support

---

Built with ❤️ for seamless note sharing between classmates. Ready for production use with minimal setup required.