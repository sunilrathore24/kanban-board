import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanBoardComponent } from '../app/kanban/components/kanban-board/kanban-board.component';
import { KanbanCard, KanbanColumn } from '../app/kanban/models';
import { CardMoveEvent } from '../app/kanban/types';

// Demo component that shows drag-and-drop in action
@Component({
  selector: 'drag-drop-demo',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h2>Drag & Drop Demo</h2>
        <p>Try dragging cards between columns to see the drag-and-drop functionality in action!</p>
        <div class="demo-stats">
          <span>Total Moves: {{ moveCount }}</span>
          <span>Last Move: {{ lastMove }}</span>
        </div>
      </div>

      <app-kanban-board
        [boardId]="'drag-drop-demo'"
        [columns]="columns"
        [cards]="cards"
        [config]="config"
        (cardMoved)="onCardMoved($event)"
        (cardCreated)="onCardCreated($event)"
        (cardUpdated)="onCardUpdated($event)"
        (cardDeleted)="onCardDeleted($event)"
      ></app-kanban-board>

      <div class="demo-instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Click and drag any card to move it</li>
          <li>Drop cards in different columns to change their status</li>
          <li>Reorder cards within the same column</li>
          <li>Watch the move counter update with each action</li>
          <li>Try adding new cards using the + button</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .demo-header h2 {
      margin: 0 0 10px 0;
      color: #24292e;
    }

    .demo-header p {
      margin: 0 0 15px 0;
      color: #586069;
      font-size: 16px;
    }

    .demo-stats {
      display: flex;
      justify-content: center;
      gap: 20px;
      font-size: 14px;
      color: #0366d6;
      font-weight: 500;
    }

    .demo-instructions {
      margin-top: 30px;
      padding: 20px;
      background: #fff5b4;
      border-radius: 8px;
      border-left: 4px solid #ffd33d;
    }

    .demo-instructions h3 {
      margin: 0 0 15px 0;
      color: #24292e;
    }

    .demo-instructions ul {
      margin: 0;
      padding-left: 20px;
    }

    .demo-instructions li {
      margin-bottom: 8px;
      color: #24292e;
    }
  `]
})
class DragDropDemoComponent {
  moveCount = 0;
  lastMove = 'None';

  columns: KanbanColumn[] = [
    {
      id: 'backlog',
      title: 'Backlog',
      position: 0,
      color: '#6f42c1',
      description: 'Items waiting to be started'
    },
    {
      id: 'todo',
      title: 'To Do',
      position: 1,
      color: '#0366d6',
      description: 'Ready to start'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      position: 2,
      color: '#ffd33d',
      description: 'Currently being worked on',
      wipLimit: 3
    },
    {
      id: 'review',
      title: 'Review',
      position: 3,
      color: '#f66a0a',
      description: 'Awaiting review',
      wipLimit: 2
    },
    {
      id: 'done',
      title: 'Done',
      position: 4,
      color: '#28a745',
      description: 'Completed items'
    }
  ];

  cards: KanbanCard[] = [
    {
      id: 'card-1',
      title: 'User Authentication System',
      description: 'Implement JWT-based authentication with refresh tokens',
      columnId: 'backlog',
      position: 0,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'alice',
      assignees: ['Alice Johnson'],
      tags: ['backend', 'security'],
      priority: 'high'
    },
    {
      id: 'card-2',
      title: 'Dashboard UI Design',
      description: 'Create responsive dashboard with charts and widgets',
      columnId: 'todo',
      position: 0,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      createdBy: 'bob',
      assignees: ['Bob Smith'],
      tags: ['frontend', 'design'],
      priority: 'medium'
    },
    {
      id: 'card-3',
      title: 'API Documentation',
      description: 'Document all REST API endpoints with examples',
      columnId: 'todo',
      position: 1,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
      createdBy: 'charlie',
      assignees: ['Charlie Brown'],
      tags: ['documentation'],
      priority: 'low'
    },
    {
      id: 'card-4',
      title: 'Database Migration',
      description: 'Migrate from MySQL to PostgreSQL',
      columnId: 'in-progress',
      position: 0,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-19'),
      createdBy: 'diana',
      assignees: ['Diana Prince'],
      tags: ['database', 'migration'],
      priority: 'high'
    },
    {
      id: 'card-5',
      title: 'Unit Tests for User Service',
      description: 'Add comprehensive test coverage',
      columnId: 'review',
      position: 0,
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'eve',
      assignees: ['Eve Wilson'],
      tags: ['testing', 'quality'],
      priority: 'medium'
    },
    {
      id: 'card-6',
      title: 'Setup CI/CD Pipeline',
      description: 'Configure automated deployment pipeline',
      columnId: 'done',
      position: 0,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-14'),
      createdBy: 'frank',
      assignees: ['Frank Miller'],
      tags: ['devops', 'automation'],
      priority: 'medium'
    }
  ];

  config = {
    allowCardCreation: true,
    allowCardDeletion: true,
    allowCardEditing: true,
    allowColumnReordering: true,
    enableRealTimeSync: false
  };

  onCardMoved(event: CardMoveEvent): void {
    this.moveCount++;
    const sourceColumn = this.columns.find(col => col.id === event.sourceColumnId)?.title;
    const targetColumn = this.columns.find(col => col.id === event.targetColumnId)?.title;
    this.lastMove = `"${event.card.title}" from ${sourceColumn} to ${targetColumn}`;

    // Update the card in our local array
    const cardIndex = this.cards.findIndex(card => card.id === event.cardId);
    if (cardIndex !== -1) {
      this.cards[cardIndex] = { ...event.card };
    }
  }

  onCardCreated(card: KanbanCard): void {
    this.cards = [...this.cards, card];
  }

  onCardUpdated(card: KanbanCard): void {
    const cardIndex = this.cards.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      this.cards[cardIndex] = card;
    }
  }

  onCardDeleted(cardId: string): void {
    this.cards = this.cards.filter(card => card.id !== cardId);
  }
}

const meta: Meta<DragDropDemoComponent> = {
  title: 'Kanban/Drag & Drop Demo',
  component: DragDropDemoComponent,
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
# Drag & Drop Demo

This interactive demo showcases the drag-and-drop functionality of the Kanban board.

## Features Demonstrated

- **Card Movement**: Drag cards between different columns
- **Reordering**: Change card order within the same column
- **Visual Feedback**: See drag previews and drop zones
- **WIP Limits**: Observe work-in-progress limit indicators
- **Real-time Updates**: Watch the move counter update
- **Card Creation**: Add new cards to any column

## Try It Out

1. Click and hold any card to start dragging
2. Move it to a different column or position
3. Release to drop the card
4. Watch the statistics update
5. Try adding new cards with the + buttons

The demo tracks all your moves and shows which card was moved where!
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<DragDropDemoComponent>;

export const Interactive: Story = {};

// Demo with fewer cards for cleaner testing
export const Minimal: Story = {
  render: () => ({
    template: `
      <div style="padding: 20px;">
        <h2>Minimal Drag & Drop Demo</h2>
        <p>A simplified version with fewer cards for focused testing.</p>
        <drag-drop-demo></drag-drop-demo>
      </div>
    `,
    moduleMetadata: {
      imports: [DragDropDemoComponent]
    }
  })
};

// Demo focused on WIP limits
export const WipLimitsDemo: Story = {
  render: () => ({
    template: `
      <div style="padding: 20px;">
        <h2>WIP Limits Demo</h2>
        <p>Try moving cards to the "In Progress" column - it has a limit of 3 cards!</p>
        <drag-drop-demo></drag-drop-demo>
      </div>
    `,
    moduleMetadata: {
      imports: [DragDropDemoComponent]
    }
  })
};
