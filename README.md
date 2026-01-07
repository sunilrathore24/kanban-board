# 🚀 Real-time Kanban Board

A modern, feature-rich Kanban board built with Angular, featuring real-time collaboration, drag-and-drop functionality, and CRDT-based conflict resolution stretegy.

## ✨ Features

- **🎯 Drag & Drop**: Seamlessly move cards between columns
- **⚡ Real-time Collaboration**: See changes from other users instantly
- **🔄 Conflict Resolution**: CRDT-based automatic conflict resolution
- **🎨 Customizable Themes**: Light, dark, and custom theme support
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **♿ Accessible**: Full keyboard navigation and screen reader support
- **📚 Storybook Integration**: Comprehensive component documentation

## 🛠️ Tech Stack

- **Frontend**: Angular 18+ with TypeScript
- **UI Components**: Angular CDK for drag-and-drop
- **Styling**: SCSS with CSS custom properties
- **Real-time**: WebSocket integration
- **State Management**: RxJS Observables
- **Documentation**: Storybook
- **Testing**: Vitest
- **Build Tool**: Angular CLI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kanban-board

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

```bash
# Development server
npm start                 # Runs on http://localhost:4200

# Storybook (Component Documentation)
npm run storybook        # Runs on http://localhost:6006

# Build for production
npm run build

# Run tests
npm test

# Build Storybook for deployment
npm run build-storybook
```

## 📖 Storybook Documentation

This project includes comprehensive Storybook documentation with interactive examples:

- **Default Board**: Sample Kanban board with cards
- **Empty Board**: Starting state for new boards
- **Theme Variations**: Light, dark, and custom themes
- **Interactive Demos**: Drag-drop and collaboration examples
- **Component Library**: Individual component documentation

Visit the [live Storybook documentation](https://sunilrathore24.github.io/kanban-board/) to explore all features.

## 🏗️ Architecture

### Component Structure
```
KanbanBoardComponent (Smart Container)
├── KanbanColumnComponent (Feature Component)
│   └── KanbanCardComponent (Presentational)
└── Services
    ├── KanbanService (Main Business Logic)
    ├── CRDTService (Conflict Resolution)
    ├── WebSocketService (Real-time Communication)
    └── MockKanbanService (Development/Testing)
```

### Key Features Implementation

- **Drag & Drop**: Angular CDK with custom drop zones
- **Real-time Sync**: WebSocket + CRDT for conflict-free updates
- **State Management**: Hybrid local/service state approach
- **Performance**: OnPush change detection + manual optimization
- **Testing**: Comprehensive Storybook stories + unit tests

## 🎨 Customization

### Themes
The Kanban board supports extensive theming:

```typescript
const customTheme: KanbanTheme = {
  primaryColor: '#e91e63',
  backgroundColor: '#f3e5f5',
  cardBackgroundColor: '#ffffff',
  textColor: '#2e2e2e',
  borderColor: '#ce93d8',
  borderRadius: '12px'
};
```

### Configuration
```typescript
const config: KanbanBoardConfig = {
  allowCardCreation: true,
  allowCardDeletion: true,
  allowCardEditing: true,
  allowColumnReordering: true,
  enableRealTimeSync: true,
  maxCardsPerColumn: 10
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Angular CDK for drag-and-drop functionality
- Storybook team for component documentation tools
- Open source community for inspiration and tools

---

**Live Demo**: [View Storybook Documentation](https://sunilrathore24.github.io/kanban-board/)

**Built with ❤️ using Angular and TypeScript**
