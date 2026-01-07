import type { Meta, StoryObj } from '@storybook/angular';
import { KanbanCardComponent } from './kanban-card.component';
import { KanbanCard } from '../../models';

// Sample cards
const basicCard: KanbanCard = {
  id: 'card-1',
  title: 'Basic Task',
  description: 'This is a simple task with basic information',
  columnId: 'col-1',
  position: 0,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  createdBy: 'user-1'
};

const detailedCard: KanbanCard = {
  id: 'card-2',
  title: 'Detailed Task with All Features',
  description: 'This task demonstrates all available features including assignees, tags, priority, and due date. It shows how the card looks when fully populated with metadata.',
  columnId: 'col-1',
  position: 0,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  createdBy: 'user-1',
  assignees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown'],
  tags: ['frontend', 'urgent', 'bug-fix'],
  priority: 'high',
  dueDate: new Date('2024-02-01'),
  metadata: {
    storyPoints: 8,
    epic: 'User Authentication'
  }
};

const overdueCard: KanbanCard = {
  id: 'card-3',
  title: 'Overdue Task',
  description: 'This task is past its due date',
  columnId: 'col-1',
  position: 0,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  createdBy: 'user-2',
  assignees: ['Diana Prince'],
  tags: ['backend'],
  priority: 'medium',
  dueDate: new Date('2024-01-20') // Past date
};

const longTitleCard: KanbanCard = {
  id: 'card-4',
  title: 'This is a very long task title that should wrap properly and demonstrate how the card handles lengthy text content',
  description: 'This card has an extremely long title to test text wrapping and layout behavior. The description is also quite lengthy to show how the card adapts to different content sizes. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  columnId: 'col-1',
  position: 0,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  createdBy: 'user-3',
  assignees: ['Eve Wilson'],
  tags: ['documentation', 'content'],
  priority: 'low'
};

const meta: Meta<KanbanCardComponent> = {
  title: 'Kanban/KanbanCard',
  component: KanbanCardComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Kanban Card Component

Individual card component that displays task information with editing capabilities.

## Features

- **Inline Editing**: Double-click to edit title and description
- **Rich Metadata**: Priority, tags, assignees, due dates
- **Visual Indicators**: Priority badges, overdue warnings
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## Usage

\`\`\`typescript
<app-kanban-card
  [card]="card"
  [editable]="true"
  [isSelected]="false"
  [isDragging]="false"
  (cardUpdated)="onCardUpdated($event)"
  (cardDeleted)="onCardDeleted($event)"
  (cardSelected)="onCardSelected($event)"
></app-kanban-card>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    card: {
      control: 'object',
      description: 'Card data to display'
    },
    editable: {
      control: 'boolean',
      description: 'Whether the card can be edited'
    },
    isSelected: {
      control: 'boolean',
      description: 'Whether the card is currently selected'
    },
    isDragging: {
      control: 'boolean',
      description: 'Whether the card is being dragged'
    },
    cardUpdated: { action: 'cardUpdated' },
    cardDeleted: { action: 'cardDeleted' },
    cardSelected: { action: 'cardSelected' },
    editModeChanged: { action: 'editModeChanged' }
  }
};

export default meta;
type Story = StoryObj<KanbanCardComponent>;

// Basic card
export const Basic: Story = {
  args: {
    card: basicCard,
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Detailed card with all features
export const Detailed: Story = {
  args: {
    card: detailedCard,
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Selected card
export const Selected: Story = {
  args: {
    card: detailedCard,
    editable: true,
    isSelected: true,
    isDragging: false
  }
};

// Dragging card
export const Dragging: Story = {
  args: {
    card: detailedCard,
    editable: true,
    isSelected: false,
    isDragging: true
  }
};

// Read-only card
export const ReadOnly: Story = {
  args: {
    card: detailedCard,
    editable: false,
    isSelected: false,
    isDragging: false
  }
};

// Overdue card
export const Overdue: Story = {
  args: {
    card: overdueCard,
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// High priority card
export const HighPriority: Story = {
  args: {
    card: {
      ...basicCard,
      priority: 'high',
      tags: ['urgent', 'critical']
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Medium priority card
export const MediumPriority: Story = {
  args: {
    card: {
      ...basicCard,
      priority: 'medium',
      tags: ['important']
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Low priority card
export const LowPriority: Story = {
  args: {
    card: {
      ...basicCard,
      priority: 'low',
      tags: ['nice-to-have']
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Card with long content
export const LongContent: Story = {
  args: {
    card: longTitleCard,
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Card with many assignees
export const ManyAssignees: Story = {
  args: {
    card: {
      ...basicCard,
      assignees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Wilson', 'Frank Miller']
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Card with many tags
export const ManyTags: Story = {
  args: {
    card: {
      ...basicCard,
      tags: ['frontend', 'backend', 'database', 'api', 'testing', 'documentation', 'deployment', 'security']
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};

// Minimal card (title only)
export const Minimal: Story = {
  args: {
    card: {
      id: 'card-minimal',
      title: 'Minimal Task',
      columnId: 'col-1',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1'
    },
    editable: true,
    isSelected: false,
    isDragging: false
  }
};
