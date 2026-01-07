import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanCard, UpdateKanbanCardRequest } from '../../models';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="kanban-card"
      [class.selected]="isSelected"
      [class.editing]="isEditing"
      [class.dragging]="isDragging"
      (click)="onCardClick()"
      (dblclick)="startEditing()"
    >
      <!-- Card Header -->
      <div class="card-header">
        <div class="card-title-section">
          <input
            #titleInput
            *ngIf="isEditing; else titleDisplay"
            [(ngModel)]="editableCard.title"
            class="title-input"
            (keydown.enter)="saveChanges()"
            (keydown.escape)="cancelEditing()"
            maxlength="100"
          />
          <ng-template #titleDisplay>
            <h3 class="card-title">{{ card.title }}</h3>
          </ng-template>
        </div>

        <div class="card-actions" *ngIf="editable">
          <button
            class="edit-btn"
            (click)="startEditing(); $event.stopPropagation()"
            [disabled]="isEditing"
            title="Edit card"
          >
            ✏️
          </button>
          <button
            class="delete-btn"
            (click)="onDelete(); $event.stopPropagation()"
            title="Delete card"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Card Description -->
      <div class="card-description" *ngIf="card.description || isEditing">
        <textarea
          *ngIf="isEditing; else descriptionDisplay"
          [(ngModel)]="editableCard.description"
          class="description-input"
          placeholder="Add a description..."
          (keydown.escape)="cancelEditing()"
          (keydown.enter)="saveChanges()"
          rows="3"
          maxlength="500"
        ></textarea>
        <ng-template #descriptionDisplay>
          <p class="description-text">{{ card.description }}</p>
        </ng-template>
      </div>

      <!-- Edit Actions -->
      <div class="edit-actions" *ngIf="isEditing">
        <button class="save-btn" (click)="saveChanges()">Save</button>
        <button class="cancel-btn" (click)="cancelEditing()">Cancel</button>
      </div>

      <!-- Card Metadata -->
      <div class="card-metadata" *ngIf="hasMetadata()">
        <!-- Priority -->
        <div class="priority-badge" *ngIf="card.priority" [class]="'priority-' + card.priority">
          {{ card.priority.toUpperCase() }}
        </div>

        <!-- Tags -->
        <div class="tags" *ngIf="card.tags && card.tags.length > 0">
          <span class="tag" *ngFor="let tag of card.tags">{{ tag }}</span>
        </div>

        <!-- Due Date -->
        <div class="due-date" *ngIf="card.dueDate" [class.overdue]="isOverdue()">
          📅 {{ formatDate(card.dueDate) }}
        </div>

        <!-- Assignees -->
        <div class="assignees" *ngIf="card.assignees && card.assignees.length > 0">
          <span class="assignee" *ngFor="let assignee of card.assignees">
            {{ getInitials(assignee) }}
          </span>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <div class="card-timestamps">
          <small class="created-date">Created: {{ formatDate(card.createdAt) }}</small>
          <small class="updated-date" *ngIf="card.updatedAt !== card.createdAt">
            Updated: {{ formatDate(card.updatedAt) }}
          </small>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./kanban-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanCardComponent implements OnInit, OnDestroy {
  @Input() card!: KanbanCard;
  @Input() editable = true;
  @Input() isSelected = false;
  @Input() isDragging = false;

  @Output() cardUpdated = new EventEmitter<UpdateKanbanCardRequest>();
  @Output() cardDeleted = new EventEmitter<string>();
  @Output() editModeChanged = new EventEmitter<boolean>();
  @Output() cardSelected = new EventEmitter<string>();

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  isEditing = false;
  editableCard: Partial<KanbanCard> = {};

  ngOnInit(): void {
    this.resetEditableCard();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onCardClick(): void {
    if (!this.isEditing) {
      this.cardSelected.emit(this.card.id);
    }
  }

  startEditing(): void {
    if (!this.editable) return;

    this.isEditing = true;
    this.resetEditableCard();
    this.editModeChanged.emit(true);

    // Focus title input after view update
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    });
  }

  saveChanges(): void {
    if (!this.isEditing) return;

    const changes: UpdateKanbanCardRequest = {};
    let hasChanges = false;

    // Check for title changes
    if (this.editableCard.title !== this.card.title) {
      if (this.editableCard.title?.trim()) {
        changes.title = this.editableCard.title.trim();
        hasChanges = true;
      }
    }

    // Check for description changes
    if (this.editableCard.description !== this.card.description) {
      changes.description = this.editableCard.description?.trim() || undefined;
      hasChanges = true;
    }

    if (hasChanges) {
      this.cardUpdated.emit(changes);
    }

    this.cancelEditing();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetEditableCard();
    this.editModeChanged.emit(false);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this card?')) {
      this.cardDeleted.emit(this.card.id);
    }
  }

  hasMetadata(): boolean {
    return !!(
      this.card.priority ||
      (this.card.tags && this.card.tags.length > 0) ||
      this.card.dueDate ||
      (this.card.assignees && this.card.assignees.length > 0)
    );
  }

  isOverdue(): boolean {
    if (!this.card.dueDate) return false;
    return new Date(this.card.dueDate) < new Date();
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  private resetEditableCard(): void {
    this.editableCard = {
      title: this.card.title,
      description: this.card.description
    };
  }
}
