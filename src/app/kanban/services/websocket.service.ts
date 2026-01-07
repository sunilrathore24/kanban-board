import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, timer, NEVER } from 'rxjs';
import {
  retryWhen,
  delay,
  take,
  switchMap,
  catchError,
  tap,
  filter,
  map
} from 'rxjs/operators';
import {
  WebSocketMessage,
  ConnectionStatus,
  SyncRequest,
  SyncResponse
} from '../types';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');
  private clientId: string;
  private currentBoardId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: any;
  private heartbeatIntervalMs = 30000; // 30 seconds

  constructor() {
    this.clientId = this.generateClientId();
  }

  connect(boardId: string, wsUrl?: string): Observable<ConnectionStatus> {
    this.currentBoardId = boardId;
    const url = wsUrl || `ws://localhost:8080/kanban/${boardId}`;

    return new Observable<ConnectionStatus>(observer => {
      this.connectionStatusSubject.subscribe(status => observer.next(status));

      this.establishConnection(url);

      return () => {
        this.disconnect();
      };
    });
  }

  private establishConnection(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionStatusSubject.next('connecting');

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatusSubject.next('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();

        // Send initial connection message
        this.sendConnectionMessage();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.connectionStatusSubject.next('disconnected');
        this.stopHeartbeat();

        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(url);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatusSubject.next('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatusSubject.next('error');
    }
  }

  private scheduleReconnect(url: string): void {
    this.connectionStatusSubject.next('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.establishConnection(url);
    }, delay);
  }

  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.connectionStatusSubject.next('disconnected');
    this.currentBoardId = null;
  }

  send(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return;
    }

    try {
      const messageWithMetadata = {
        ...message,
        clientId: this.clientId,
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      };

      this.socket.send(JSON.stringify(messageWithMetadata));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  onMessage(): Observable<WebSocketMessage> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  reconnect(): Observable<ConnectionStatus> {
    if (!this.currentBoardId) {
      throw new Error('No board ID set for reconnection');
    }

    this.disconnect();
    return this.connect(this.currentBoardId);
  }

  // Specific message types
  sendUpdate(boardId: string, payload: any): void {
    this.send({
      type: 'update',
      boardId,
      payload,
      timestamp: Date.now(),
      clientId: this.clientId
    });
  }

  sendSyncRequest(boardId: string, lastKnownVersion: number): void {
    const syncRequest: SyncRequest = {
      boardId,
      lastKnownVersion,
      clientId: this.clientId
    };

    this.send({
      type: 'sync',
      boardId,
      payload: syncRequest,
      timestamp: Date.now(),
      clientId: this.clientId
    });
  }

  private sendConnectionMessage(): void {
    if (!this.currentBoardId) return;

    this.send({
      type: 'connect',
      boardId: this.currentBoardId,
      payload: {
        clientId: this.clientId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      clientId: this.clientId
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    // Don't process messages from ourselves
    if (message.clientId === this.clientId) {
      return;
    }

    switch (message.type) {
      case 'heartbeat':
        this.handleHeartbeat(message);
        break;
      case 'sync':
        this.handleSyncResponse(message);
        break;
      case 'update':
        this.messageSubject.next(message);
        break;
      case 'error':
        this.handleError(message);
        break;
      default:
        this.messageSubject.next(message);
    }
  }

  private handleHeartbeat(message: WebSocketMessage): void {
    // Respond to server heartbeat
    this.send({
      type: 'heartbeat',
      boardId: message.boardId,
      payload: { response: true },
      timestamp: Date.now(),
      clientId: this.clientId
    });
  }

  private handleSyncResponse(message: WebSocketMessage): void {
    const syncResponse = message.payload as SyncResponse;
    console.log('Received sync response:', syncResponse);
    this.messageSubject.next(message);
  }

  private handleError(message: WebSocketMessage): void {
    console.error('WebSocket error message:', message.payload);
    this.connectionStatusSubject.next('error');
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentBoardId) {
        this.send({
          type: 'heartbeat',
          boardId: this.currentBoardId,
          payload: { ping: true },
          timestamp: Date.now(),
          clientId: this.clientId
        });
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getClientId(): string {
    return this.clientId;
  }

  getCurrentBoardId(): string | null {
    return this.currentBoardId;
  }
}
