import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');
  private sessionViewers: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) { this.logger.log(`Connected: ${client.id}`); }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
    this.sessionViewers.forEach((viewers, sessionId) => {
      if (viewers.has(client.id)) {
        viewers.delete(client.id);
        this.server.to(`live:${sessionId}`).emit('viewer-count', { sessionId, count: viewers.size });
      }
    });
  }

  @SubscribeMessage('join-session')
  handleJoinSession(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; username: string }) {
    const room = `live:${data.sessionId}`;
    client.join(room);
    if (!this.sessionViewers.has(data.sessionId)) this.sessionViewers.set(data.sessionId, new Set());
    this.sessionViewers.get(data.sessionId).add(client.id);
    const count = this.sessionViewers.get(data.sessionId).size;
    this.server.to(room).emit('viewer-count', { sessionId: data.sessionId, count });
    this.server.to(room).emit('user-joined', { username: data.username });
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; username: string }) {
    const room = `live:${data.sessionId}`;
    client.leave(room);
    if (this.sessionViewers.has(data.sessionId)) {
      this.sessionViewers.get(data.sessionId).delete(client.id);
      this.server.to(room).emit('viewer-count', { sessionId: data.sessionId, count: this.sessionViewers.get(data.sessionId).size });
    }
    this.server.to(room).emit('user-left', { username: data.username });
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; userId: string; username: string; message: string }) {
    this.server.to(`live:${data.sessionId}`).emit('chat-message', { ...data, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; offer: any }) {
    client.to(`live:${data.sessionId}`).emit('webrtc-offer', { offer: data.offer, from: client.id });
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; answer: any; to: string }) {
    this.server.to(data.to).emit('webrtc-answer', { answer: data.answer, from: client.id });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleICE(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; candidate: any; to?: string }) {
    if (data.to) this.server.to(data.to).emit('webrtc-ice-candidate', { candidate: data.candidate, from: client.id });
    else client.to(`live:${data.sessionId}`).emit('webrtc-ice-candidate', { candidate: data.candidate, from: client.id });
  }

  @SubscribeMessage('start-broadcast')
  handleBroadcast(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    client.to(`live:${data.sessionId}`).emit('broadcast-started', { broadcasterId: client.id });
  }
}
