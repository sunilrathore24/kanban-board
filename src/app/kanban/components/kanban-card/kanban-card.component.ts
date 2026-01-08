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
import { FormsModule } from '@angular/forms';
import { KanbanCard, UpdateKanbanCardRequest } from '../../models';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './kanban-card.component.html',
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
