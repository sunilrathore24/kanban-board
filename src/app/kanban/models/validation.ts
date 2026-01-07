import { KanbanCard, CreateKanbanCardRequest, UpdateKanbanCardRequest } from './kanban-card.interface';
import { KanbanColumn, CreateKanbanColumnRequest, UpdateKanbanColumnRequest } from './kanban-column.interface';
import { KanbanBoardState } from './kanban-board-state.interface';

export class KanbanValidation {
  static validateCard(card: Partial<KanbanCard>): string[] {
    const errors: string[] = [];

    if (!card.id || typeof card.id !== 'string' || card.id.trim() === '') {
      errors.push('Card ID is required and must be a non-empty string');
    }

    if (!card.title || typeof card.title !== 'string' || card.title.trim() === '') {
      errors.push('Card title is required and must be a non-empty string');
    }

    if (!card.columnId || typeof card.columnId !== 'string' || card.columnId.trim() === '') {
      errors.push('Card columnId is required and must be a non-empty string');
    }

    if (card.position !== undefined && (typeof card.position !== 'number' || card.position < 0)) {
      errors.push('Card position must be a non-negative number');
    }

    if (card.priority && !['low', 'medium', 'high'].includes(card.priority)) {
      errors.push('Card priority must be one of: low, medium, high');
    }

    if (card.createdAt && !(card.createdAt instanceof Date)) {
      errors.push('Card createdAt must be a valid Date');
    }

    if (card.updatedAt && !(card.updatedAt instanceof Date)) {
      errors.push('Card updatedAt must be a valid Date');
    }

    if (card.dueDate && !(card.dueDate instanceof Date)) {
      errors.push('Card dueDate must be a valid Date');
    }

    return errors;
  }

  static validateCreateCardRequest(request: CreateKanbanCardRequest): string[] {
    const errors: string[] = [];

    if (!request.title || typeof request.title !== 'string' || request.title.trim() === '') {
      errors.push('Title is required and must be a non-empty string');
    }

    if (!request.columnId || typeof request.columnId !== 'string' || request.columnId.trim() === '') {
      errors.push('Column ID is required and must be a non-empty string');
    }

    if (request.priority && !['low', 'medium', 'high'].includes(request.priority)) {
      errors.push('Priority must be one of: low, medium, high');
    }

    if (request.dueDate && !(request.dueDate instanceof Date)) {
      errors.push('Due date must be a valid Date');
    }

    return errors;
  }

  static validateColumn(column: Partial<KanbanColumn>): string[] {
    const errors: string[] = [];

    if (!column.id || typeof column.id !== 'string' || column.id.trim() === '') {
      errors.push('Column ID is required and must be a non-empty string');
    }

    if (!column.title || typeof column.title !== 'string' || column.title.trim() === '') {
      errors.push('Column title is required and must be a non-empty string');
    }

    if (column.position !== undefined && (typeof column.position !== 'number' || column.position < 0)) {
      errors.push('Column position must be a non-negative number');
    }

    if (column.cardLimit !== undefined && (typeof column.cardLimit !== 'number' || column.cardLimit < 0)) {
      errors.push('Column card limit must be a non-negative number');
    }

    if (column.wipLimit !== undefined && (typeof column.wipLimit !== 'number' || column.wipLimit < 0)) {
      errors.push('Column WIP limit must be a non-negative number');
    }

    return errors;
  }

  static validateBoardState(boardState: Partial<KanbanBoardState>): string[] {
    const errors: string[] = [];

    if (!boardState.id || typeof boardState.id !== 'string' || boardState.id.trim() === '') {
      errors.push('Board ID is required and must be a non-empty string');
    }

    if (!boardState.title || typeof boardState.title !== 'string' || boardState.title.trim() === '') {
      errors.push('Board title is required and must be a non-empty string');
    }

    if (!Array.isArray(boardState.columns)) {
      errors.push('Board columns must be an array');
    } else {
      boardState.columns.forEach((column, index) => {
        const columnErrors = this.validateColumn(column);
        columnErrors.forEach(error => errors.push(`Column ${index}: ${error}`));
      });
    }

    if (!Array.isArray(boardState.cards)) {
      errors.push('Board cards must be an array');
    } else {
      boardState.cards.forEach((card, index) => {
        const cardErrors = this.validateCard(card);
        cardErrors.forEach(error => errors.push(`Card ${index}: ${error}`));
      });
    }

    if (boardState.version !== undefined && (typeof boardState.version !== 'number' || boardState.version < 0)) {
      errors.push('Board version must be a non-negative number');
    }

    if (boardState.lastModified && !(boardState.lastModified instanceof Date)) {
      errors.push('Board lastModified must be a valid Date');
    }

    return errors;
  }

  static isValidCard(card: any): card is KanbanCard {
    return this.validateCard(card).length === 0;
  }

  static isValidColumn(column: any): column is KanbanColumn {
    return this.validateColumn(column).length === 0;
  }

  static isValidBoardState(boardState: any): boardState is KanbanBoardState {
    return this.validateBoardState(boardState).length === 0;
  }
}
