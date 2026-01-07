import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KanbanBoardComponent } from '../app/kanban/components/kanban-board/kanban-board.component';
import { KanbanCard, KanbanColumn, KanbanBoardConfig, KanbanTheme } from '../app/kanban/models';

// Comprehensive playground for testing all component properties
const meta: Meta<KanbanBoardComponent> = {
  title: 'Kanban/Playground',
  component: KanbanBoardComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()]
    })
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Kanban Board Playground

Interactive playground for testing all component properties and configurations.
Use the controls panel to experiment with different settings and see how they affect the board.

## Available Controls

### Board Configuration
- **Allow Card Creation**: Enable/disable adding new cards
- **Allow Card Deletion**: Enable/disable deleting cards
- **Allow Card Editing**: Enable/disable editing card content
- **Allow Column Reordering**: Enable/disable column management
- **Enable Real-time Sync**: Toggle real-time collaboration features

### Theme Customization
- **Primary Color**: Main accent color for buttons and highlights
- **Secondary Color**: Secondary text and element colors
- **Background Color**: Board background color
- **Card Background**: Individual card background color
- **Text Color**: Main text color throughout the board
- **Border Color**: Border colors for cards and elements
- **Border Radius**: Roundness of corners for cards and buttons

### Sample Data
- **Columns**: Predefined column configurations
- **Cards**: Sample cards with various properties
- **Board ID**: Unique identifier for the board

Use these controls to test different scenarios and configurations!
        `
      }
    }
  },
  argTypes: {
    // Board Configuration
    boardId: {
      control: { type: 'text' },
      description: 'Unique identifier for the board',
      table: { category: 'Board Settings' }
    },

    // Configuration Object
    config: {
      control: { type: 'object' },
      description: 'Board configuration options',
      table: { category: 'Configuration' }
    },

    // Theme Object
    theme: {
      control: { type: 'object' },
      description: 'Visual theme configuration',
      table: { category: 'Theme' }
    },

    // Data Arrays
    columns: {
      control: { type: 'object' },
      description: 'Array of column definitions',
      table: { category: 'Data' }
    },

    cards: {
      control: { type: 'object' },
      description: 'Array of card data',
      table: { category: 'Data' }
    },

    // Event Handlers
    cardMoved: {
      action: 'cardMoved',
      description: 'Fired when a card is moved between columns or positions',
      table: { category: 'Events' }
    },
    cardCreated: {
      action: 'cardCreated',
      description: 'Fired when a new card is created',
      table: { category: 'Events' }
    },
    cardUpdated: {
      action: 'cardUpdated',
      description: 'Fired when a card is modified',
      table: { category: 'Events' }
    },
    cardDeleted: {
      action: 'cardDeleted',
      description: 'Fired when a card is deleted',
      table: { category: 'Events' }
    },
    connectionStatusChanged: {
      action: 'connectionStatusChanged',
      description: 'Fired when WebSocket connection status changes',
      table: { category: 'Events' }
    }
  }
};

export default meta;
type Story = StoryObj<KanbanBoardComponent>;

// Default playground story with full controls
export const Playground: Story = {
  args: {
    boardId: 'playground-board',
    columns: [
      {
        id: 'backlog',
        title: 'Backlog',
        description: 'Items waiting to be prioritized',
        position: 0,
        color: '#6f42c1',
        wipLimit: 10
      },
      {
        id: 'todo',
        title: 'To Do',
        description: 'Ready to start',
        position: 1,
        color: '#0366d6',
        wipLimit: 5
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        description: 'Currently being worked on',
        position: 2,
        color: '#ffd33d',
        wipLimit: 3
      },
      {
        id: 'review',
        title: 'Review',
        description: 'Awaiting review and approval',
        position: 3,
        color: '#f66a0a',
        wipLimit: 2
      },
      {
        id: 'done',
        title: 'Done',
        description: 'Completed items',
        position: 4,
        color: '#28a745'
      }
    ],
    cards: [
      {
        id: 'card-1',
        title: 'High Priority Bug Fix',
        description: 'Critical bug affecting user login functionality. Needs immediate attention.',
        columnId: 'todo',
        position: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        createdBy: 'alice-johnson',
        assignees: ['Alice Johnson', 'Bob Smith'],
        tags: ['bug', 'critical', 'backend'],
        priority: 'high',
        dueDate: new Date('2024-02-01T23:59:59Z'),
        metadata: {
          storyPoints: 8,
          epic: 'User Authentication',
          severity: 'critical'
        }
      },
      {
        id: 'card-2',
        title: 'Dashboard Redesign',
        description: 'Modernize the main dashboard with new UI components and improved user experience.',
        columnId: 'in-progress',
        position: 0,
        createdAt: new Date('2024-01-16T09:30:00Z'),
        updatedAt: new Date('2024-01-18T14:20:00Z'),
        createdBy: 'charlie-brown',
        assignees: ['Charlie Brown'],
        tags: ['frontend', 'design', 'ui/ux'],
        priority: 'medium',
        dueDate: new Date('2024-02-15T23:59:59Z'),
        metadata: {
          storyPoints: 13,
          epic: 'Dashboard Improvements'
        }
      },
      {
        id: 'card-3',
        title: 'API Documentation Update',
        description: 'Update REST API documentation with new endpoints and examples.',
        columnId: 'review',
        position: 0,
        createdAt: new Date('2024-01-17T11:15:00Z'),
        updatedAt: new Date('2024-01-19T16:45:00Z'),
        createdBy: 'diana-prince',
        assignees: ['Diana Prince'],
        tags: ['documentation', 'api'],
        priority: 'low',
        metadata: {
          storyPoints: 3,
          epic: 'Developer Experience'
        }
      },
      {
        id: 'card-4',
        title: 'Database Migration Script',
        description: 'Create migration script for moving from MySQL to PostgreSQL.',
        columnId: 'backlog',
        position: 0,
        createdAt: new Date('2024-01-18T08:00:00Z'),
        updatedAt: new Date('2024-01-18T08:00:00Z'),
        createdBy: 'eve-wilson',
        assignees: ['Eve Wilson'],
        tags: ['database', 'migration', 'devops'],
        priority: 'medium',
        dueDate: new Date('2024-03-01T23:59:59Z'),
        metadata: {
          storyPoints: 21,
          epic: 'Infrastructure Upgrade'
        }
      },
      {
        id: 'card-5',
        title: 'Unit Test Coverage',
        description: 'Increase unit test coverage to 90% for the user service module.',
        columnId: 'todo',
        position: 1,
        createdAt: new Date('2024-01-19T13:20:00Z'),
        updatedAt: new Date('2024-01-19T13:20:00Z'),
        createdBy: 'frank-miller',
        assignees: ['Frank Miller'],
        tags: ['testing', 'quality', 'backend'],
        priority: 'medium',
        metadata: {
          storyPoints: 5,
          epic: 'Code Quality'
        }
      },
      {
        id: 'card-6',
        title: 'Mobile App Release',
        description: 'Final preparations and deployment of mobile application v2.0.',
        columnId: 'done',
        position: 0,
        createdAt: new Date('2024-01-10T07:00:00Z'),
        updatedAt: new Date('2024-01-20T18:30:00Z'),
        createdBy: 'grace-hopper',
        assignees: ['Grace Hopper', 'Henry Ford'],
        tags: ['mobile', 'release', 'deployment'],
        priority: 'high',
        metadata: {
          storyPoints: 34,
          epic: 'Mobile Platform',
          releaseVersion: '2.0.0'
        }
      }
    ],
    config: {
      allowCardCreation: true,
      allowCardDeletion: true,
      allowCardEditing: true,
      allowColumnReordering: true,
      maxCardsPerColumn: 10,
      enableRealTimeSync: false
    },
    theme: {
      primaryColor: '#0366d6',
      secondaryColor: '#586069',
      backgroundColor: '#fafbfc',
      cardBackgroundColor: '#ffffff',
      textColor: '#24292e',
      borderColor: '#e1e4e8',
      borderRadius: '6px',
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px'
      }
    }
  }
};

// Minimal configuration for testing
export const MinimalSetup: Story = {
  args: {
    boardId: 'minimal-board',
    columns: [
      { id: 'todo', title: 'To Do', position: 0, color: '#0366d6' },
      { id: 'done', title: 'Done', position: 1, color: '#28a745' }
    ],
    cards: [
      {
        id: 'simple-card',
        title: 'Simple Task',
        columnId: 'todo',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user'
      }
    ],
    config: {
      allowCardCreation: true,
      allowCardDeletion: true,
      allowCardEditing: true,
      enableRealTimeSync: false
    },
    theme: {}
  }
};

// Configuration testing different limits
export const WithLimits: Story = {
  args: {
    ...Playground.args,
    columns: Playground.args!.columns!.map(col => ({
      ...col,
      wipLimit: col.id === 'in-progress' ? 1 : col.wipLimit, // Very restrictive limit
      cardLimit: 3 // Limit all columns to 3 cards
    })),
    config: {
      ...Playground.args!.config,
      maxCardsPerColumn: 3
    }
  }
};

// Read-only configuration
export const ReadOnlyMode: Story = {
  args: {
    ...Playground.args,
    config: {
      allowCardCreation: false,
      allowCardDeletion: false,
      allowCardEditing: false,
      allowColumnReordering: false,
      enableRealTimeSync: false
    }
  }
};

// Dark theme configuration
export const DarkTheme: Story = {
  args: {
    ...Playground.args,
    theme: {
      primaryColor: '#58a6ff',
      secondaryColor: '#8b949e',
      backgroundColor: '#0d1117',
      cardBackgroundColor: '#21262d',
      textColor: '#f0f6fc',
      borderColor: '#30363d',
      borderRadius: '8px'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

// Custom color scheme
export const CustomColors: Story = {
  args: {
    ...Playground.args,
    columns: [
      { id: 'col1', title: 'Purple', position: 0, color: '#8b5cf6' },
      { id: 'col2', title: 'Pink', position: 1, color: '#ec4899' },
      { id: 'col3', title: 'Orange', position: 2, color: '#f97316' },
      { id: 'col4', title: 'Green', position: 3, color: '#10b981' }
    ],
    cards: Playground.args!.cards!.map((card, index) => ({
      ...card,
      columnId: ['col1', 'col2', 'col3', 'col4'][index % 4]
    })),
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#6b7280',
      backgroundColor: '#f8fafc',
      cardBackgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      borderRadius: '12px'
    }
  }
};
