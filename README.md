# Page Replacement Algorithm Visualizer

Interactive tool for visualizing memory management algorithms in operating systems.

> **🚀 NEW: Project Reorganized!** Check [START_HERE.md](START_HERE.md) for navigation guide.

## 🚀 Quick Start

1. Open `index.html` in a web browser
2. Or serve with a local server: `cd` to this directory and run your preferred server

**📚 Documentation**: See [START_HERE.md](START_HERE.md) or [INDEX.md](INDEX.md) for complete navigation.

## 📁 Project Structure

```
Prototype/
├── index.html                       # Main entry point
├── manifest.json                    # PWA manifest
├── .gitignore                      # Git ignore rules
│
├── assets/                         # Static assets
│   ├── style.css                  # Main stylesheet (8000+ lines)
│   └── favicon.svg                # Site favicon
│
├── script/                         # JavaScript modules (NEW!)
│   ├── main.js                    # App initialization
│   │
│   ├── algorithms/                # Algorithm implementations
│   │   └── pageReplacement.js    # FIFO & LRU logic
│   │
│   ├── core/                      # Core business logic
│   │   └── simulationController.js # Simulation orchestration
│   │
│   ├── display/                   # Result visualization
│   │   └── displayResult.js      # Tables & charts
│   │
│   ├── ui/                        # User interface modules
│   │   ├── download.js           # Download functionality
│   │   ├── formHandlers.js       # Form interactions
│   │   ├── scrollEffects.js      # Animations
│   │   └── theme.js              # Theme switching
│   │
│   ├── ocr/                       # Image processing
│   │   └── imageProcessor.js     # OCR text extraction
│   │
│   ├── effects/                   # Visual effects
│   │   └── particleSystem.js     # Particle background
│   │
│   ├── utils/                     # Utilities
│   │   ├── helpers.js            # General helpers
│   │   └── validation.js         # Input validation
│   │
│   └── README.md                  # Module documentation
│
└── Documentation/                  # Project docs
    ├── PROJECT_STRUCTURE.md       # Structure overview
    ├── QUICK_START.md             # Quick reference
    ├── REORGANIZATION_SUMMARY.md  # What changed
    └── *.md                       # Additional docs
```

**✨ NEW: Modular Architecture v2.0!**
- 🎯 12 well-organized modules (was 5 messy files)
- 🔍 Easy to find and debug code
- 🚀 Simple to extend features
- 📚 Clear separation of concerns

**Quick Links:**
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed structure guide
- [QUICK_START.md](QUICK_START.md) - Developer quick reference
- [script/README.md](script/README.md) - Module documentation

## ✨ Features

- **FIFO & LRU Algorithms**: Visualize First-In-First-Out and Least Recently Used page replacement
- **Interactive Simulation**: Real-time visualization with step-by-step explanations
- **Multiple Themes**: Glass (default), Dark, and Light mode
- **Performance Metrics**: Page faults, hit rate, and detailed statistics
- **Image Upload**: OCR support for extracting reference strings from images
- **Download Results**: Export simulation results as images

## 🎨 Themes

- **Dark Mode** (Default): Professional dark theme
- **Light Mode**: Clean light theme
- **Glass Mode**: Beautiful glassmorphism with frosted glass effects

Toggle themes using the button in the navigation bar.

## 🛠️ Technologies

- Vanilla JavaScript (ES6 Modules)
- CSS3 with Glassmorphism effects
- HTML5 Canvas for particle effects
- html2canvas for screenshot functionality
- Tesseract.js for OCR support

## 📝 License

Educational project for Operating Systems coursework.

## 👥 Authors

- Viron C. Bacani
- Nathalie B. Birao
- John Henry P. Labarento
- Christian A. Magin
- Kennmor M. Regua
