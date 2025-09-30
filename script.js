// StudyShare - Note Sharing Application
class StudyShareApp {
    constructor() {
        this.notes = this.loadNotesFromStorage();
        this.currentNote = null;
        this.animationVariants = ['default', 'flip-animation', 'parallax-animation'];
        
        this.init();
        this.bindEvents();
        this.renderNotes();
    }
    
    init() {
        // Initialize elements
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            classFilter: document.getElementById('classFilter'),
            sortFilter: document.getElementById('sortFilter'),
            activeTags: document.getElementById('activeTags'),
            notesGrid: document.getElementById('notesGrid'),
            emptyState: document.getElementById('emptyState'),
            uploadBtn: document.getElementById('uploadBtn'),
            uploadModal: document.getElementById('uploadModal'),
            noteModal: document.getElementById('noteModal'),
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            uploadForm: document.getElementById('uploadForm'),
            previewImage: document.getElementById('previewImage'),
            noteContent: document.getElementById('noteContent')
        };
        
        this.activeTags = new Set();
        this.currentFiles = [];
        this.customThumbnailDataUrl = null;
        
        // Add sample notes if none exist
        if (this.notes.length === 0) {
            this.addSampleNotes();
        }
    }
    
    bindEvents() {
        // Search and filters
        this.elements.searchInput.addEventListener('input', this.debounce(() => this.filterNotes(), 300));
        this.elements.classFilter.addEventListener('change', () => this.filterNotes());
        this.elements.sortFilter.addEventListener('change', () => this.sortAndRenderNotes());
        
        // Upload functionality
        this.elements.uploadBtn.addEventListener('click', () => this.openUploadModal());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        
        // Custom thumbnail functionality
        document.getElementById('thumbnailUploadArea').addEventListener('click', () => {
            document.getElementById('customThumbnail').click();
        });
        document.getElementById('customThumbnail').addEventListener('change', (e) => this.handleThumbnailSelect(e.target.files));
        document.getElementById('removeThumbnail').addEventListener('click', () => this.removeCustomThumbnail());
        
        // Upload area drag and drop
        // Upload area drag and drop
        this.elements.uploadArea.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.elements.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.elements.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // Modal controls
        document.getElementById('closeUploadModal').addEventListener('click', () => this.closeModal('uploadModal'));
        document.getElementById('closeNoteModal').addEventListener('click', () => this.closeModal('noteModal'));
        document.getElementById('cancelUpload').addEventListener('click', () => this.resetUploadForm());
        document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
        document.getElementById('downloadNote').addEventListener('click', () => this.downloadCurrentNote());
        
        // Modal backdrop clicks
        this.elements.uploadModal.addEventListener('click', (e) => {
            if (e.target === this.elements.uploadModal) this.closeModal('uploadModal');
        });
        this.elements.noteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.noteModal) this.closeModal('noteModal');
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    // File handling methods
    handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        this.currentFiles = Array.from(files);
        this.processFiles();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
    }
    
    handleThumbnailSelect(files) {
        if (!files || files.length === 0) return;
        
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file for the thumbnail');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.customThumbnailDataUrl = e.target.result;
            this.showThumbnailPreview(this.customThumbnailDataUrl);
        };
        reader.readAsDataURL(file);
    }
    
    removeCustomThumbnail() {
        this.customThumbnailDataUrl = null;
        document.getElementById('thumbnailPreview').style.display = 'none';
        document.getElementById('customThumbnail').value = '';
    }
    
    showThumbnailPreview(imageData) {
        const preview = document.getElementById('thumbnailPreview');
        preview.innerHTML = `<img src="${imageData}" alt="Custom thumbnail preview">`;
        preview.style.display = 'block';
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        
        if (files.length > 0) {
            this.currentFiles = files;
            this.processFiles();
        }
    }
    
    async processFiles() {
        if (this.currentFiles.length === 0) return;
        
        const file = this.currentFiles[0]; // Process first file
        
        try {
            let preview;
            
            if (file.type === 'application/pdf') {
                preview = await this.extractPdfFirstPage(file);
            } else if (file.type.startsWith('image/')) {
                preview = await this.readFileAsDataURL(file);
            }
            
            if (preview) {
                this.showPreview(preview);
                this.showUploadForm();
            }
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please try again.');
        }
    }
    
    async extractPdfFirstPage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    const page = await pdf.getPage(1);
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: 1.5 });
                    
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({ canvasContext: context, viewport }).promise;
                    resolve(canvas.toDataURL());
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    showPreview(imageData) {
        this.elements.previewImage.innerHTML = `<img src="${imageData}" alt="Note preview">`;
    }
    
    showUploadForm() {
        this.elements.uploadArea.style.display = 'none';
        this.elements.uploadForm.style.display = 'block';
    }
    
    resetUploadForm() {
        this.elements.uploadForm.style.display = 'none';
        this.elements.uploadArea.style.display = 'block';
        this.elements.previewImage.innerHTML = '';
        this.currentFiles = [];
        
        // Reset form fields
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteClass').value = '';
        document.getElementById('noteTags').value = '';
        
        // Reset custom thumbnail
        this.removeCustomThumbnail();
        
        this.closeModal('uploadModal');
    }
    
    async saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const noteClass = document.getElementById('noteClass').value;
        const tags = document.getElementById('noteTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!title || !noteClass || this.currentFiles.length === 0) {
            alert('Please fill in all required fields');
            return;
        }
        
        try {
            const file = this.currentFiles[0];
            let thumbnail, fullImage;
            
            // Use custom thumbnail if provided, otherwise extract from file
            if (this.customThumbnailDataUrl) {
                thumbnail = this.customThumbnailDataUrl;
            } else if (file.type === 'application/pdf') {
                thumbnail = await this.extractPdfFirstPage(file);
            } else {
                const dataUrl = await this.readFileAsDataURL(file);
                thumbnail = dataUrl;
            }
            
            if (file.type === 'application/pdf') {
                fullImage = await this.extractPdfFirstPage(file);
            } else {
                fullImage = await this.readFileAsDataURL(file);
            }
            
            const note = {
                id: Date.now().toString(),
                title,
                class: noteClass,
                tags,
                thumbnail,
                fullImage,
                date: new Date().toISOString(),
                fileName: file.name
            };
            
            this.notes.unshift(note);
            this.saveNotesToStorage();
            this.renderNotes();
            this.resetUploadForm();
            
            // Show success feedback
            this.showNotification('Note uploaded successfully!');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note. Please try again.');
        }
    }
    
    // Note management methods
    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotesToStorage();
            this.renderNotes();
            this.showNotification('Note deleted successfully!');
        }
    }
    
    openNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNote = note;
        document.getElementById('noteModalTitle').textContent = note.title;
        this.elements.noteContent.innerHTML = `
            <img src="${note.fullImage}" alt="${note.title}" tabindex="0">
        `;
        
        this.openModal('noteModal');
    }
    
    downloadCurrentNote() {
        if (!this.currentNote) return;
        
        const link = document.createElement('a');
        link.href = this.currentNote.fullImage;
        link.download = `${this.currentNote.title}.${this.currentNote.fileName?.split('.').pop() || 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // UI methods
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    openUploadModal() {
        this.resetUploadForm();
        this.openModal('uploadModal');
    }
    
    // Rendering methods
    renderNotes() {
        const filteredNotes = this.getFilteredNotes();
        const sortedNotes = this.sortNotes(filteredNotes);
        
        if (sortedNotes.length === 0) {
            this.elements.notesGrid.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }
        
        this.elements.notesGrid.style.display = 'grid';
        this.elements.emptyState.style.display = 'none';
        
        this.elements.notesGrid.innerHTML = sortedNotes.map((note, index) => 
            this.createNoteCard(note, index)
        ).join('');
        
        // Add event listeners to note cards
        this.elements.notesGrid.querySelectorAll('.note-card').forEach(card => {
            const noteId = card.dataset.noteId;
            card.addEventListener('click', () => this.openNote(noteId));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openNote(noteId);
                }
            });
        });
        
        // Add tag click listeners
        this.elements.notesGrid.querySelectorAll('.note-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTagFilter(tag.textContent);
            });
        });
    }
    
    createNoteCard(note, index) {
        const animationClass = this.animationVariants[index % this.animationVariants.length];
        const formattedDate = new Date(note.date).toLocaleDateString();
        
        return `
            <div class="note-card ${animationClass}" 
                 data-note-id="${note.id}" 
                 tabindex="0" 
                 role="button"
                 aria-label="View note: ${note.title}">
                <div class="note-thumbnail">
                    <img src="${note.thumbnail}" alt="Thumbnail of ${note.title}">
                    <div class="note-overlay"></div>
                </div>
                <div class="note-content">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-meta">
                        <span class="note-class">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            ${this.getClassDisplayName(note.class)}
                        </span>
                        <span class="note-date">${formattedDate}</span>
                    </div>
                    <div class="note-tags">
                        ${note.tags.map(tag => 
                            `<span class="note-tag" role="button" tabindex="0" aria-label="Filter by tag: ${tag}">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Filtering and sorting
    getFilteredNotes() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const classFilter = this.elements.classFilter.value;
        
        return this.notes.filter(note => {
            const matchesSearch = !searchTerm || 
                note.title.toLowerCase().includes(searchTerm) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                
            const matchesClass = !classFilter || note.class === classFilter;
            
            const matchesTags = this.activeTags.size === 0 ||
                Array.from(this.activeTags).every(tag => 
                    note.tags.some(noteTag => noteTag.toLowerCase().includes(tag.toLowerCase()))
                );
                
            return matchesSearch && matchesClass && matchesTags;
        });
    }
    
    sortNotes(notes) {
        const sortBy = this.elements.sortFilter.value;
        
        return [...notes].sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'name-asc':
                    return a.title.localeCompare(b.title);
                case 'name-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }
    
    filterNotes() {
        this.renderNotes();
    }
    
    sortAndRenderNotes() {
        this.renderNotes();
    }
    
    // Tag management
    toggleTagFilter(tagName) {
        if (this.activeTags.has(tagName)) {
            this.activeTags.delete(tagName);
        } else {
            this.activeTags.add(tagName);
        }
        
        this.renderActiveTagFilters();
        this.filterNotes();
    }
    
    renderActiveTagFilters() {
        if (this.activeTags.size === 0) {
            this.elements.activeTags.innerHTML = '';
            return;
        }
        
        this.elements.activeTags.innerHTML = Array.from(this.activeTags).map(tag => `
            <div class="tag-filter">
                ${tag}
                <button onclick="app.toggleTagFilter('${tag}')" aria-label="Remove ${tag} filter">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }
    
    // Utility methods
    getClassDisplayName(classKey) {
        const classNames = {
            math: 'Mathematics',
            physics: 'Physics',
            chemistry: 'Chemistry',
            biology: 'Biology',
            history: 'History',
            literature: 'Literature'
        };
        return classNames[classKey] || classKey;
    }
    
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    // Keyboard navigation
    handleKeyDown(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            if (this.elements.uploadModal.classList.contains('active')) {
                this.closeModal('uploadModal');
            } else if (this.elements.noteModal.classList.contains('active')) {
                this.closeModal('noteModal');
            }
        }
    }
    
    // Storage methods
    saveNotesToStorage() {
        try {
            localStorage.setItem('studyshare-notes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes to localStorage:', error);
        }
    }
    
    loadNotesFromStorage() {
        try {
            const stored = localStorage.getItem('studyshare-notes');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading notes from localStorage:', error);
            return [];
        }
    }
    
    // Sample data for demonstration
    addSampleNotes() {
        const sampleNotes = [
            {
                id: '1',
                title: 'Calculus - Derivatives and Limits',
                class: 'math',
                tags: ['derivatives', 'limits', 'calculus'],
                thumbnail: 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 86400000).toISOString(),
                fileName: 'calculus-notes.jpg'
            },
            {
                id: '2',
                title: 'Physics - Wave Properties',
                class: 'physics',
                tags: ['waves', 'frequency', 'amplitude'],
                thumbnail: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 172800000).toISOString(),
                fileName: 'physics-waves.jpg'
            },
            {
                id: '3',
                title: 'Chemistry - Organic Compounds',
                class: 'chemistry',
                tags: ['organic', 'molecules', 'structure'],
                thumbnail: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 259200000).toISOString(),
                fileName: 'chemistry-organic.jpg'
            },
            {
                id: '4',
                title: 'Biology - Cell Division',
                class: 'biology',
                tags: ['mitosis', 'cells', 'reproduction'],
                thumbnail: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 345600000).toISOString(),
                fileName: 'biology-cells.jpg'
            },
            {
                id: '5',
                title: 'History - World War II Timeline',
                class: 'history',
                tags: ['wwii', 'timeline', 'events'],
                thumbnail: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 432000000).toISOString(),
                fileName: 'history-wwii.jpg'
            },
            {
                id: '6',
                title: 'Literature - Shakespeare Analysis',
                class: 'literature',
                tags: ['shakespeare', 'analysis', 'hamlet'],
                thumbnail: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
                fullImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                date: new Date(Date.now() - 518400000).toISOString(),
                fileName: 'literature-shakespeare.jpg'
            }
        ];
        
        this.notes = sampleNotes;
        this.saveNotesToStorage();
    }
}

// Initialize PDF.js
if (typeof pdfjsLib === 'undefined') {
    // Create a mock PDF.js for development if not loaded
    window.pdfjsLib = {
        getDocument: () => ({
            promise: Promise.resolve({
                getPage: () => Promise.resolve({
                    getViewport: () => ({ width: 600, height: 800 }),
                    render: () => ({ promise: Promise.resolve() })
                })
            })
        })
    };
}

// Initialize application
const app = new StudyShareApp();

// Export for global access
window.app = app;