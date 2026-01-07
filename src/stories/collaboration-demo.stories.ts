import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, takeUntil } from 'rxjs';
import { KanbanBoardComponent } from '../app/kanban/components/kanban-board/kanban-board.component';
import { KanbanCard, KanbanColumn } from '../app/kanban/models';
import { ConnectionStatus } from '../app/kanban/types';

// Mock user actions for simulation
interface MockUserAction {
  type: 'move' | 'create' | 'update' | 'delete';
  user: string;
  cardId?: string;
  data?: any;
  delay: number;
}

@Component({
  selector: 'collaboration-demo',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h2>Real-time Collaboration Demo</h2>
        <p>Watch as multiple users collaborate on the same board in real-time!</p>

        <div class="demo-controls">
          <button
            (click)="toggleSimulation()"
            [class.active]="isSimulating"
            class="simulation-btn"
          >
            {{ isSimulating ? 'Stop Simulation' : 'Start Simulation' }}
          </button>
          <button (click)="resetBoard()" class="reset-btn">Reset Board</button>
        </div>

        <div class="connection-status" [class]="'status-' + connectionStatus">
          <span class="status-dot"></span>
          Connection: {{ getConnectionStatusText() }}
        </div>
      </div>

      <div class="users-panel">
        <h3>Active Users</h3>
        <div class="user-list">
          <div
            *ngFor="let user of activeUsers"
            class="user-item"
            [class.active]="user.isActive"
          >
            <div class="user-avatar" [style.background-color]="user.color">
              {{ user.initials }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-action">{{ user.lastAction }}</span>
            </div>
          </div>
        </div>
      </div>

      <app-kanban-board
        [boardId]="'collaboration-demo'"
        [columns]="columns"
        [cards]="cards"
        [config]="config"
        (cardMoved)="onCardMoved($event)"
        (cardCreated)="onCardCreated($event)"
        (cardUpdated)="onCardUpdated($event)"
        (cardDeleted)="onCardDeleted($event)"
        (connectionStatusChanged)="onConnectionStatusChanged($event)"
      ></app-kanban-board>

      <div class="activity-log">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div
            *ngFor="let activity of recentActivity; trackBy: trackActivity"
            class="activity-item"
            [class.highlight]="activity.isNew"
          >
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            <span class="activity-user" [style.color]="activity.userColor">
              {{ activity.user }}
            </span>
            <span class="activity-action">{{ activity.action }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1400px;
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
      margin: 0 0 20px 0;
      color: #586069;
      font-size: 16px;
    }

    .demo-controls {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 15px;
    }

    .simulation-btn, .reset-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .simulation-btn {
      background-color: #28a745;
      color: white;
    }

    .simulation-btn.active {
      background-color: #dc3545;
    }

    .simulation-btn:hover {
      transform: translateY(-1px);
    }

    .reset-btn {
      background-color: #6c757d;
      color: white;
    }

    .reset-btn:hover {
      background-color: #5a6268;
    }

    .connection-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #6c757d;
    }

    .status-connected .status-dot {
      background-color: #28a745;
      animation: pulse 2s infinite;
    }

    .status-connecting .status-dot,
    .status-reconnecting .status-dot {
      background-color: #ffc107;
      animation: pulse 1s infinite;
    }

    .status-error .status-dot,
    .status-disconnected .status-dot {
      background-color: #dc3545;
    }

    .users-panel {
      background: white;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .users-panel h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #24292e;
    }

    .user-list {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f6f8fa;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .user-item.active {
      background: #e6ffed;
      border: 1px solid #28a745;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 12px;
      font-weight: 600;
      color: #24292e;
    }

    .user-action {
      font-size: 10px;
      color: #586069;
    }

    .activity-log {
      background: white;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-log h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #24292e;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .activity-item.highlight {
      background: #fff5b4;
      animation: fadeIn 0.5s ease;
    }

    .activity-time {
      color: #586069;
      font-family: monospace;
      min-width: 60px;
    }

    .activity-user {
      font-weight: 600;
      min-width: 80px;
    }

    .activity-action {
      color: #24292e;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
class CollaborationDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private simulationInterval$ = new Subject<void>();

  isSimulating = false;
  connectionStatus: ConnectionStatus = 'connected';

  activeUsers = [
    {
      id: 'alice',
      name: 'Alice Johnson',
      initials: 'AJ',
      color: '#0366d6',
      isActive: false,
      lastAction: 'Idle'
    },
    {
      id: 'bob',
      name: 'Bob Smith',
      initials: 'BS',
      color: '#28a745',
      isActive: false,
      lastAction: 'Idle'
    },
    {
      id: 'charlie',
      name: 'Charlie Brown',
      initials: 'CB',
      color: '#ffd33d',
      isActive: false,
      lastAction: 'Idle'
    },
    {
      id: 'diana',
      name: 'Diana Prince',
      initials: 'DP',
      color: '#f66a0a',
      isActive: false,
      lastAction: 'Idle'
    }
  ];

  recentActivity: Array<{
    id: string;
    timestamp: Date;
    user: string;
    userColor: string;
    action: string;
    isNew: boolean;
  }> = [];

  columns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'To Do',
      position: 0,
      color: '#0366d6'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      position: 1,
      color: '#ffd33d',
      wipLimit: 3
    },
    {
      id: 'review',
      title: 'Review',
      position: 2,
      color: '#f66a0a'
    },
    {
      id: 'done',
      title: 'Done',
      position: 3,
      color: '#28a745'
    }
  ];

  cards: KanbanCard[] = [
    {
      id: 'card-1',
      title: 'User Authentication',
      description: 'Implement JWT authentication system',
      columnId: 'todo',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'alice',
      assignees: ['Alice Johnson'],
      tags: ['backend'],
      priority: 'high'
    },
    {
      id: 'card-2',
      title: 'Dashboard Design',
      description: 'Create responsive dashboard layout',
      columnId: 'in-progress',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'bob',
      assignees: ['Bob Smith'],
      tags: ['frontend'],
      priority: 'medium'
    },
    {
      id: 'card-3',
      title: 'API Documentation',
      description: 'Document REST API endpoints',
      columnId: 'review',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'charlie',
      assignees: ['Charlie Brown'],
      tags: ['docs'],
      priority: 'low'
    }
  ];

  config = {
    allowCardCreation: true,
    allowCardDeletion: true,
    allowCardEditing: true,
    allowColumnReordering: true,
    enableRealTimeSync: true
  };

  private mockActions: MockUserAction[] = [
    {
      type: 'move',
      user: 'Alice Johnson',
      cardId: 'card-1',
      data: { fromColumn: 'todo', toColumn: 'in-progress' },
      delay: 3000
    },
    {
      type: 'create',
      user: 'Bob Smith',
      data: {
        title: 'New Feature Request',
        columnId: 'todo',
        description: 'Implement dark mode toggle'
      },
      delay: 5000
    },
    {
      type: 'update',
      user: 'Charlie Brown',
      cardId: 'card-3',
      data: { title: 'Updated API Documentation' },
      delay: 7000
    },
    {
      type: 'move',
      user: 'Diana Prince',
      cardId: 'card-2',
      data: { fromColumn: 'in-progress', toColumn: 'review' },
      delay: 9000
    }
  ];

  ngOnInit(): void {
    this.addActivity('System', '#6c757d', 'Demo initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.simulationInterval$.next();
    this.simulationInterval$.complete();
  }

  toggleSimulation(): void {
    this.isSimulating = !this.isSimulating;

    if (this.isSimulating) {
      this.startSimulation();
      this.addActivity('System', '#6c757d', 'Simulation started');
    } else {
      this.stopSimulation();
      this.addActivity('System', '#6c757d', 'Simulation stopped');
    }
  }

  private startSimulation(): void {
    // Simulate connection status changes
    interval(2000)
      .pipe(takeUntil(this.simulationInterval$))
      .subscribe(() => {
        if (Math.random() < 0.1) { // 10% chance of connection change
          this.simulateConnectionChange();
        }
      });

    // Execute mock actions
    this.mockActions.forEach((action, index) => {
      setTimeout(() => {
        if (this.isSimulating) {
          this.executeMockAction(action);
        }
      }, action.delay);
    });

    // Continue with random actions
    setTimeout(() => {
      if (this.isSimulating) {
        this.startRandomActions();
      }
    }, 12000);
  }

  private startRandomActions(): void {
    interval(4000)
      .pipe(takeUntil(this.simulationInterval$))
      .subscribe(() => {
        if (this.isSimulating) {
          this.executeRandomAction();
        }
      });
  }

  private stopSimulation(): void {
    this.simulationInterval$.next();
    this.activeUsers.forEach(user => {
      user.isActive = false;
      user.lastAction = 'Idle';
    });
  }

  private simulateConnectionChange(): void {
    const statuses: ConnectionStatus[] = ['connected', 'connecting', 'reconnecting'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    this.connectionStatus = newStatus;

    if (newStatus !== 'connected') {
      setTimeout(() => {
        this.connectionStatus = 'connected';
      }, 2000);
    }
  }

  private executeMockAction(action: MockUserAction): void {
    const user = this.activeUsers.find(u => u.name === action.user);
    if (user) {
      user.isActive = true;

      switch (action.type) {
        case 'move':
          this.simulateCardMove(action, user);
          break;
        case 'create':
          this.simulateCardCreate(action, user);
          break;
        case 'update':
          this.simulateCardUpdate(action, user);
          break;
      }

      setTimeout(() => {
        user.isActive = false;
        user.lastAction = 'Idle';
      }, 2000);
    }
  }

  private executeRandomAction(): void {
    const actions = ['move', 'create', 'update'];
    const actionType = actions[Math.floor(Math.random() * actions.length)];
    const user = this.activeUsers[Math.floor(Math.random() * this.activeUsers.length)];

    user.isActive = true;

    switch (actionType) {
      case 'move':
        this.simulateRandomMove(user);
        break;
      case 'create':
        this.simulateRandomCreate(user);
        break;
      case 'update':
        this.simulateRandomUpdate(user);
        break;
    }

    setTimeout(() => {
      user.isActive = false;
      user.lastAction = 'Idle';
    }, 2000);
  }

  private simulateCardMove(action: MockUserAction, user: any): void {
    const card = this.cards.find(c => c.id === action.cardId);
    if (card) {
      const fromColumn = this.columns.find(col => col.id === card.columnId)?.title;
      const toColumnId = action.data.toColumn;
      const toColumn = this.columns.find(col => col.id === toColumnId)?.title;

      card.columnId = toColumnId;
      card.updatedAt = new Date();

      user.lastAction = `Moved "${card.title}"`;
      this.addActivity(user.name, user.color, `moved "${card.title}" from ${fromColumn} to ${toColumn}`);
    }
  }

  private simulateCardCreate(action: MockUserAction, user: any): void {
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: action.data.title,
      description: action.data.description,
      columnId: action.data.columnId,
      position: this.cards.filter(c => c.columnId === action.data.columnId).length,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      assignees: [user.name],
      tags: ['new'],
      priority: 'medium'
    };

    this.cards = [...this.cards, newCard];
    user.lastAction = `Created "${newCard.title}"`;
    this.addActivity(user.name, user.color, `created new card "${newCard.title}"`);
  }

  private simulateCardUpdate(action: MockUserAction, user: any): void {
    const card = this.cards.find(c => c.id === action.cardId);
    if (card) {
      const oldTitle = card.title;
      card.title = action.data.title;
      card.updatedAt = new Date();

      user.lastAction = `Updated card`;
      this.addActivity(user.name, user.color, `updated "${oldTitle}" to "${card.title}"`);
    }
  }

  private simulateRandomMove(user: any): void {
    if (this.cards.length === 0) return;

    const card = this.cards[Math.floor(Math.random() * this.cards.length)];
    const availableColumns = this.columns.filter(col => col.id !== card.columnId);

    if (availableColumns.length > 0) {
      const fromColumn = this.columns.find(col => col.id === card.columnId)?.title;
      const targetColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];

      card.columnId = targetColumn.id;
      card.updatedAt = new Date();

      user.lastAction = `Moved "${card.title}"`;
      this.addActivity(user.name, user.color, `moved "${card.title}" from ${fromColumn} to ${targetColumn.title}`);
    }
  }

  private simulateRandomCreate(user: any): void {
    const titles = [
      'Bug Fix: Login Issue',
      'Feature: Dark Mode',
      'Refactor: Code Cleanup',
      'Test: Unit Coverage',
      'Docs: API Guide'
    ];

    const title = titles[Math.floor(Math.random() * titles.length)];
    const column = this.columns[Math.floor(Math.random() * this.columns.length)];

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title,
      description: `Auto-generated task by ${user.name}`,
      columnId: column.id,
      position: this.cards.filter(c => c.columnId === column.id).length,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      assignees: [user.name],
      tags: ['auto'],
      priority: 'medium'
    };

    this.cards = [...this.cards, newCard];
    user.lastAction = `Created "${title}"`;
    this.addActivity(user.name, user.color, `created "${title}"`);
  }

  private simulateRandomUpdate(user: any): void {
    if (this.cards.length === 0) return;

    const card = this.cards[Math.floor(Math.random() * this.cards.length)];
    const updates = [
      'Updated description',
      'Changed priority',
      'Added assignee',
      'Updated tags'
    ];

    card.updatedAt = new Date();
    const updateType = updates[Math.floor(Math.random() * updates.length)];

    user.lastAction = updateType;
    this.addActivity(user.name, user.color, `${updateType.toLowerCase()} for "${card.title}"`);
  }

  private addActivity(user: string, userColor: string, action: string): void {
    const activity = {
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
      user,
      userColor,
      action,
      isNew: true
    };

    this.recentActivity.unshift(activity);

    // Remove highlight after animation
    setTimeout(() => {
      activity.isNew = false;
    }, 500);

    // Keep only last 20 activities
    if (this.recentActivity.length > 20) {
      this.recentActivity = this.recentActivity.slice(0, 20);
    }
  }

  resetBoard(): void {
    this.stopSimulation();
    this.isSimulating = false;
    this.connectionStatus = 'connected';
    this.recentActivity = [];

    // Reset to initial state
    this.cards = [
      {
        id: 'card-1',
        title: 'User Authentication',
        description: 'Implement JWT authentication system',
        columnId: 'todo',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'alice',
        assignees: ['Alice Johnson'],
        tags: ['backend'],
        priority: 'high'
      },
      {
        id: 'card-2',
        title: 'Dashboard Design',
        description: 'Create responsive dashboard layout',
        columnId: 'in-progress',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'bob',
        assignees: ['Bob Smith'],
        tags: ['frontend'],
        priority: 'medium'
      },
      {
        id: 'card-3',
        title: 'API Documentation',
        description: 'Document REST API endpoints',
        columnId: 'review',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'charlie',
        assignees: ['Charlie Brown'],
        tags: ['docs'],
        priority: 'low'
      }
    ];

    this.activeUsers.forEach(user => {
      user.isActive = false;
      user.lastAction = 'Idle';
    });

    this.addActivity('System', '#6c757d', 'Board reset to initial state');
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  trackActivity(index: number, activity: any): string {
    return activity.id;
  }

  // Event handlers (these would normally interact with real services)
  onCardMoved(event: any): void {
    // In a real app, this would be handled by the service
  }

  onCardCreated(card: KanbanCard): void {
    // In a real app, this would be handled by the service
  }

  onCardUpdated(card: KanbanCard): void {
    // In a real app, this would be handled by the service
  }

  onCardDeleted(cardId: string): void {
    // In a real app, this would be handled by the service
  }

  onConnectionStatusChanged(status: ConnectionStatus): void {
    this.connectionStatus = status;
  }
}

const meta: Meta<CollaborationDemoComponent> = {
  title: 'Kanban/Real-time Collaboration',
  component: CollaborationDemoComponent,
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
# Real-time Collaboration Demo

This demo simulates multiple users working on the same Kanban board simultaneously, showcasing real-time collaboration features.

## Features Demonstrated

- **Multi-user Activity**: See multiple users working on the board
- **Real-time Updates**: Watch changes appear instantly
- **Connection Status**: Monitor WebSocket connection health
- **Activity Log**: Track all user actions in real-time
- **User Presence**: See who's currently active
- **Conflict Resolution**: CRDT-based automatic conflict handling

## How It Works

1. **Start Simulation**: Click the button to begin simulating user activity
2. **Watch Users**: See user avatars light up when they're active
3. **Monitor Activity**: Follow the real-time activity log
4. **Connection Status**: Observe connection status changes
5. **Reset**: Clear the board and start fresh

The simulation includes realistic user behaviors like moving cards, creating new tasks, and updating existing ones.

## Real-world Usage

In a real application, this would connect to:
- WebSocket server for real-time updates
- CRDT service for conflict resolution
- User authentication for presence tracking
- Backend API for data persistence
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<CollaborationDemoComponent>;

export const LiveDemo: Story = {};

export const QuickStart: Story = {
  play: async ({ canvasElement }) => {
    // Auto-start the simulation for this story
    const canvas = canvasElement;
    const startButton = canvas.querySelector('.simulation-btn') as HTMLButtonElement;
    if (startButton && !startButton.classList.contains('active')) {
      startButton.click();
    }
  }
};
