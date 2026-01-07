import type { Meta, StoryObj } from '@storybook/angular';
import { KanbanBoardComponent } from './kanban-board.component';
import { KanbanCard, KanbanColumn, KanbanBoardConfig, KanbanTheme } from '../../models';

// Sample data
const sampleColumns: KanbanColumn[] = [
  {
    id: 'col-1',
    title: 'To Do',
    position: 0,
    color: '#0366d6',
    wipLimit: 5
  },
  {
    id: 'col-2',
    title: 'In Progress',
    position: 1,
    color: '#ffd33d',
    wipLimit: 3
  },
  {
    id: 'col-3',
    title: 'Review',
    position: 2,
    color: '#f66a0a',
    wipLimit: 2
  },
  {
    id: 'col-4',
    title: 'Done',
    position: 3,
    color: '#28a745'
  }
];

const sampleCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Design new user interface',
    description: 'Create mockups and wireframes for the new dashboard interface',
    columnId: 'col-1',
    position: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    assignees: ['Alice Johnson', 'Bob Smith'],
    tags: ['design', 'ui/ux'],
    priority: 'high',
    dueDate: new Date('2024-02-01')
  },
  {
    id: 'card-2',
    title: 'Implement authentication system',
    description: 'Set up JWT-based authentication with refresh tokens',
    columnId: 'col-1',
    position: 1,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    createdBy: 'user-2',
    assignees: ['Charlie Brown'],
    tags: ['backend', 'security'],
    priority: 'high'
  },
  {
    id: 'card-3',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for the user service',
    columnId: 'col-2',
    position: 0,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'user-3',
    assignees: ['Diana Prince'],
    tags: ['testing', 'quality'],
    priority: 'medium'
  },
  {
    id: 'card-4',
    title: 'Code review for API endpoints',
    description: 'Review and approve the new REST API implementation',
    columnId: 'col-3',
    position: 0,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    createdBy: 'user-4',
    assignees: ['Eve Wilson'],
    tags: ['review', 'api'],
    priority: 'medium'
  },
  {
    id: 'card-5',
    title: 'Deploy to staging',
    description: 'Deploy the latest version to staging environment for testing',
    columnId: 'col-4',
    position: 0,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'user-5',
    assignees: ['Frank Miller'],
    tags: ['deployment', 'devops'],
    priority: 'low'
  }
];

const defaultConfig: KanbanBoardConfig = {
  allowCardCreation: true,
  allowCardDeletion: true,
  allowCardEditing: true,
  allowColumnReordering: true,
  enableRealTimeSync: false // Disabled for Storybook
};

const lightTheme: KanbanTheme = {
  primaryColor: '#0366d6',
  secondaryColor: '#586069',
  backgroundColor: '#fafbfc',
  cardBackgroundColor: '#ffffff',
  textColor: '#24292e',
  borderColor: '#e1e4e8',
  borderRadius: '6px'
};

const darkTheme: KanbanTheme = {
  primaryColor: '#58a6ff',
  secondaryColor: '#8b949e',
  backgroundColor: '#0d1117',
  cardBackgroundColor: '#21262d',
  textColor: '#f0f6fc',
  borderColor: '#30363d',
  borderRadius: '6px'
};

const meta: Meta<KanbanBoardComponent> = {
  title: 'Kanban/KanbanBoard',
  component: KanbanBoardComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Kanban Board Component

A full-featured Kanban board component with drag-and-drop functionality, real-time collaboration, and CRDT-based conflict resolution.

## Features

- **Drag & Drop**: Move cards between columns and reorder within columns
- **Real-time Collaboration**: See changes from other users instantly
- **Conflict Resolution**: CRDT-based automatic conflict resolution
- **Customizable**: Themes, colors, and configuration options
- **Responsive**: Works on desktop and mobile devices
- **Accessible**: Keyboard navigation and screen reader support

## Usage

\`\`\`typescript
import { KanbanBoardComponent } from './kanban-board.component';

@Component({
  template: \`
    <app-kanban-board
      [boardId]="'my-board'"
      [columns]="columns"
      [cards]="cards"
      [config]="config"
      [theme]="theme"
      (cardMoved)="onCardMoved($event)"
      (cardCreated)="onCardCreated($event)"
      (cardUpdated)="onCardUpdated($event)"
      (cardDeleted)="onCardDeleted($event)"
    ></app-kanban-board>
  \`
})
export class MyComponent {
  // Component implementation
}
\`\`\`
        `
      }
    }
  },
  argTypes: {
    boardId: {
      control: 'text',
      description: 'Unique identifier for the board'
    },
    config: {
      control: 'object',
      description: 'Board configuration options'
    },
    theme: {
      control: 'object',
      description: 'Visual theme configuration'
    },
    cardMoved: { action: 'cardMoved' },
    cardCreated: { action: 'cardCreated' },
    cardUpdated: { action: 'cardUpdated' },
    cardDeleted: { action: 'cardDeleted' },
    connectionStatusChanged: { action: 'connectionStatusChanged' }
  }
};

export default meta;
type Story = StoryObj<KanbanBoardComponent>;

// Basic usage story
export const Default: Story = {
  args: {
    boardId: 'sample-board',
    columns: sampleColumns,
    cards: sampleCards,
    config: defaultConfig,
    theme: lightTheme
  }
};

// Empty board story
export const EmptyBoard: Story = {
  args: {
    boardId: 'empty-board',
    columns: [],
    cards: [],
    config: defaultConfig,
    theme: lightTheme
  }
};

// Board with columns but no cards
export const EmptyColumns: Story = {
  args: {
    boardId: 'empty-columns-board',
    columns: sampleColumns,
    cards: [],
    config: defaultConfig,
    theme: lightTheme
  }
};

// Dark theme story
export const DarkTheme: Story = {
  args: {
    boardId: 'dark-board',
    columns: sampleColumns,
    cards: sampleCards,
    config: defaultConfig,
    theme: darkTheme
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

// Read-only board
export const ReadOnly: Story = {
  args: {
    boardId: 'readonly-board',
    columns: sampleColumns,
    cards: sampleCards,
    config: {
      allowCardCreation: false,
      allowCardDeletion: false,
      allowCardEditing: false,
      allowColumnReordering: false,
      enableRealTimeSync: false
    },
    theme: lightTheme
  }
};

// Large board with many cards
export const LargeBoard: Story = {
  args: {
    boardId: 'large-board',
    columns: [
      ...sampleColumns,
      {
        id: 'col-5',
        title: 'Testing',
        position: 4,
        color: '#6f42c1'
      },
      {
        id: 'col-6',
        title: 'Deployment',
        position: 5,
        color: '#d73a49'
      }
    ],
    cards: [
      ...sampleCards,
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `card-${i + 6}`,
        title: `Task ${i + 6}`,
        description: `Description for task ${i + 6}`,
        columnId: sampleColumns[i % sampleColumns.length].id,
        position: Math.floor(i / sampleColumns.length) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: `user-${(i % 3) + 1}`,
        assignees: [`User ${i + 1}`],
        tags: ['task'],
        priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high'
      }))
    ],
    config: defaultConfig,
    theme: lightTheme
  }
};

// Board with WIP limits exceeded
export const WipLimitsExceeded: Story = {
  args: {
    boardId: 'wip-exceeded-board',
    columns: sampleColumns.map(col => ({ ...col, wipLimit: 1 })),
    cards: sampleCards,
    config: defaultConfig,
    theme: lightTheme
  }
};

// Custom theme story
export const CustomTheme: Story = {
  args: {
    boardId: 'custom-theme-board',
    columns: sampleColumns,
    cards: sampleCards,
    config: defaultConfig,
    theme: {
      primaryColor: '#e91e63',
      secondaryColor: '#9c27b0',
      backgroundColor: '#f3e5f5',
      cardBackgroundColor: '#ffffff',
      textColor: '#2e2e2e',
      borderColor: '#ce93d8',
      borderRadius: '12px'
    }
  }
};
