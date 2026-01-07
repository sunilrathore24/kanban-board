export interface KanbanColumn {
  id: string;
  title: string;
  description?: string;
  position: number;
  color?: string;
  cardLimit?: number;
  wipLimit?: number;
  isCollapsed?: boolean;
}

export interface CreateKanbanColumnRequest {
  title: string;
  description?: string;
  position: number;
  color?: string;
  cardLimit?: number;
  wipLimit?: number;
}

export interface UpdateKanbanColumnRequest {
  title?: string;
  description?: string;
  color?: string;
  cardLimit?: number;
  wipLimit?: number;
  isCollapsed?: boolean;
}
