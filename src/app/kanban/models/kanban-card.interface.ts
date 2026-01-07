export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignees?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface CreateKanbanCardRequest {
  title: string;
  description?: string;
  columnId: string;
  assignees?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateKanbanCardRequest {
  title?: string;
  description?: string;
  assignees?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  metadata?: Record<string, any>;
}
