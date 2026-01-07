import type { Meta, StoryObj } from '@storybook/angular';
import { KanbanColumnComponent } from './kanban-column.component';
import { KanbanCard, KanbanColumn } from '../../models';

// Sample data
const sampleColumn: KanbanColumn = {
  id: 'col-1',
  title: 'To Do',
  description: 'Tasks that need to be started',
  position: 0,
  color: '#0366d6',
  wipLimit: 5
};

const sampleCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Design new user interface',
    description: 'Create mockups and wireframes for the new dashboard',
    columnId: 'col-1',
    position: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    assignees: ['Alice Johnson'],
    tags: ['design', 'ui/ux'],
    priority: 'high'
  },
  {
    id: 'card-2',
    title: 'Implement authentication',
    description: 'Set up JWT-based authentication system',
    columnId: 'col-1',
    position: 1,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    createdBy: 'user-2',
    assignees: ['Bob Smith'],
    tags: ['backend', 'security'],
    priority: 'medium'
  },
  {
    id: 'card-3',
    title: 'Write documentation',
    description: 'Document the API endpoints',
    columnId: 'col-1',
    position: 2,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    createdBy: 'user-3',
    tags: ['documentation'],
    priority: 'low'
  }
];

const manyCards: KanbanCard[] = Array.from({ length: 10 }, (_, i) => ({
  id: `card-${i + 1}`,
  title: `Task ${i + 1}`,
  description: `Description for task ${i + 1}`,
  columnId: 'col-1',
  position: i,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: `user-${(i % 3) + 1}`,
  assignees: [`User ${i + 1}`],
  tags: ['task'],
  priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high'
}));

const meta: Meta<KanbanColumnComponent> = {
  title: 'Kanban/KanbanColumn',
  component: KanbanColumnComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Kanban Column Component

Column component that contains and manages cards with drag-and-drop functionality.

## Features

- **Drag & Drop**: Cards can be dragged within and between columns
- **Card Management**: Add, edit, and delete cards
- **WIP Limits**: Work-in-progress limits with visual indicators
- **Column Customization**: Editable titles and colors
- **Empty States**: Helpful prompts when columns are empty

## Usage

\`\`\`typescript
<app-kanban-column
  [column]="column"
  [cards]="cards"
  [allowDrop]="true"
  [allowDrag]="true"
  [editable]="true"
  [connectedDropLists]="connectedLists"
  [selectedCardId]="selectedCardId"
  (cardDropped)="onCardDropped($event)"
  (cardAdded)="onCardAdded($event)"
  (cardUpdated)="onCardUpdated($event)"
  (cardDeleted)="onCardDeleted($event)"
  (cardSelected)="onCardSelected($event)"
  (columnUpdated)="onColumnUpdated($event)"
></app-kanban-column>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    column: {
      control: 'object',
      description: 'Column configuration'
    },
    cards: {
      control: 'object',
      description: 'Array of cards in this column'
    },
    allowDrop: {
      control: 'boolean',
      description: 'Whether cards can be dropped into this column'
    },
    allowDrag: {
      control: 'boolean',
      description: 'Whether cards can be dragged from this column'
    },
    editable: {
      control: 'boolean',
      description: 'Whether the column and its cards can be edited'
    },
    selectedCardId: {
      control: 'text',
      description: 'ID of the currently selected card'
    },
    cardDropped: { action: 'cardDropped' },
    cardAdded: { action: 'cardAdded' },
    cardUpdated: { action: 'cardUpdated' },
    cardDeleted: { action: 'cardDeleted' },
    cardSelected: { action: 'cardSelected' },
    columnUpdated: { action: 'columnUpdated' }
  }
};

export default meta;
type Story = StoryObj<KanbanColumnComponent>;

// Basic column with cards
export const Default: Story = {
  args: {
    column: sampleColumn,
    cards: sampleCards,
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// Empty column
export const Empty: Story = {
  args: {
    column: sampleColumn,
    cards: [],
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// Column with selected card
export const WithSelectedCard: Story = {
  args: {
    column: sampleColumn,
    cards: sampleCards,
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: 'card-2'
  }
};

// Read-only column
export const ReadOnly: Story = {
  args: {
    column: sampleColumn,
    cards: sampleCards,
    allowDrop: false,
    allowDrag: false,
    editable: false,
    connectedDropLists: [],
    selectedCardId: null
  }
};

// Column with WIP limit exceeded
export const WipLimitExceeded: Story = {
  args: {
    column: {
      ...sampleColumn,
      wipLimit: 2
    },
    cards: sampleCards, // 3 cards, limit is 2
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// Column with many cards
export const ManyCards: Story = {
  args: {
    column: {
      ...sampleColumn,
      title: 'Busy Column',
      wipLimit: 15
    },
    cards: manyCards,
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// In Progress column
export const InProgress: Story = {
  args: {
    column: {
      id: 'col-2',
      title: 'In Progress',
      description: 'Tasks currently being worked on',
      position: 1,
      color: '#ffd33d',
      wipLimit: 3
    },
    cards: [
      {
        ...sampleCards[0],
        id: 'card-ip-1',
        columnId: 'col-2',
        title: 'Developing feature X',
        priority: 'high'
      },
      {
        ...sampleCards[1],
        id: 'card-ip-2',
        columnId: 'col-2',
        title: 'Testing integration',
        priority: 'medium'
      }
    ],
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2', 'column-col-3'],
    selectedCardId: null
  }
};

// Done column
export const Done: Story = {
  args: {
    column: {
      id: 'col-4',
      title: 'Done',
      description: 'Completed tasks',
      position: 3,
      color: '#28a745'
    },
    cards: [
      {
        ...sampleCards[0],
        id: 'card-done-1',
        columnId: 'col-4',
        title: 'Completed feature Y',
        priority: 'high'
      }
    ],
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2', 'column-col-3', 'column-col-4'],
    selectedCardId: null
  }
};

// Column with custom color
export const CustomColor: Story = {
  args: {
    column: {
      ...sampleColumn,
      title: 'Custom Column',
      color: '#e91e63'
    },
    cards: sampleCards,
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// Column without description
export const NoDescription: Story = {
  args: {
    column: {
      ...sampleColumn,
      description: undefined
    },
    cards: sampleCards,
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};

// Column with card limit
export const WithCardLimit: Story = {
  args: {
    column: {
      ...sampleColumn,
      cardLimit: 3,
      wipLimit: 5
    },
    cards: sampleCards, // Exactly at the limit
    allowDrop: true,
    allowDrag: true,
    editable: true,
    connectedDropLists: ['column-col-1', 'column-col-2'],
    selectedCardId: null
  }
};
