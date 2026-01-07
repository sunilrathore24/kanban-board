import { KanbanCard } from './kanban-card.interface';
import { KanbanColumn } from './kanban-column.interface';

export interface KanbanBoardState {
  id: string;
  title: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  lastModified: Date;
  version: number;
}

export interface KanbanBoardConfig {
  allowCardCreation?: boolean;
  allowCardDeletion?: boolean;
  allowCardEditing?: boolean;
  allowColumnReordering?: boolean;
  maxCardsPerColumn?: number;
  enableRealTimeSync?: boolean;
  theme?: KanbanTheme;
}

export interface KanbanTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  spacing?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}
