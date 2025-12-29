// websocket-server.js
const http = require('http');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const { readFileSync } = require('fs');

// КОНСТАНТЫ WEBSOCKET - ИСПРАВЛЕННАЯ ВЕРСИЯ
const WS_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // ← ВОТ ЭТУ СТРОКУ НУЖНО ИСПРАВИТЬ
const OPCODE = {
  CONTINUATION: 0x0,
  TEXT: 0x1,
  BINARY: 0x2,
  CLOSE: 0x8,
  PING: 0x9,
  PONG: 0xA
};

class WebSocketServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 8080;
    this.clients = new Set();
  }

  start() {

    // this.server

    this.server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });

        const htmlfile = readFileSync('./ref/deepseek/index.html' , 'utf-8');

      res.end(htmlfile);
    });

    this.server.on('upgrade', (req, socket, head) => {
      this.handleUpgrade(req, socket, head);
    });

    

    this.server.listen(this.port, () => {
      console.log(`WebSocket server listening on port ${this.port}`);
      console.log(`Test via: ws://localhost:${this.port}`);
    });
  }

  handleUpgrade(req, socket, head) {
    // Проверяем, что это WebSocket запрос
    if (req.headers['upgrade'] !== 'websocket') {
      socket.destroy();
      return;
    }

    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }

    // Вычисляем accept ключ
    const acceptKey = this.generateAcceptKey(key);

    // Отправляем handshake ответ
    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`
    ];

    socket.write(headers.join('\r\n') + '\r\n\r\n');

    // Создаем WebSocket клиент
    const client = {
      socket,
      id: crypto.randomBytes(8).toString('hex'),
      buffer: Buffer.alloc(0)
    };

    this.clients.add(client);
    
    // Обработка данных от клиента
    socket.on('data', (data) => {
      this.handleData(client, data);
    });

    socket.on('close', () => {
      this.handleClose(client);
    });

    socket.on('error', (err) => {
      this.handleError(client, err);
    });

    this.emit('connection', client);
    
    console.log(`Client ${client.id} connected. Total clients: ${this.clients.size}`);
  }

  generateAcceptKey(key) {
    const hash = crypto.createHash('sha1');
    hash.update(key + WS_MAGIC_STRING);
    return hash.digest('base64');
  }

  handleData(client, data) {
    // Добавляем данные в буфер
    client.buffer = Buffer.concat([client.buffer, data]);

    while (client.buffer.length >= 2) {
      const byte1 = client.buffer[0];
      const byte2 = client.buffer[1];

      const fin = (byte1 & 0x80) !== 0;
      const opcode = byte1 & 0x0F;
      const masked = (byte2 & 0x80) !== 0;
      let payloadLength = byte2 & 0x7F;

      let offset = 2;

      // Определяем длину payload
      if (payloadLength === 126) {
        if (client.buffer.length < 4) return;
        payloadLength = client.buffer.readUInt16BE(2);
        offset += 2;
      } else if (payloadLength === 127) {
        if (client.buffer.length < 10) return;
        payloadLength = Number(client.buffer.readBigUInt64BE(2));
        offset += 8;
      }

      // Проверяем маску
      if (!masked) {
        this.sendClose(client, 1002, 'Protocol error: Client must mask data');
        return;
      }

      // Проверяем, есть ли полный фрейм
      const maskKeyLength = 4;
      const totalLength = offset + maskKeyLength + payloadLength;
      
      if (client.buffer.length < totalLength) {
        return; // Ждем больше данных
      }

      // Извлекаем маску и данные
      const mask = client.buffer.slice(offset, offset + maskKeyLength);
      offset += maskKeyLength;

      const payload = client.buffer.slice(offset, offset + payloadLength);

      // Демасскируем данные
      const decoded = this.unmaskPayload(payload, mask);

      // Удаляем обработанные данные из буфера
      client.buffer = client.buffer.slice(totalLength);

      // Обрабатываем фрейм
      this.handleFrame(client, opcode, decoded, fin);
    }
  }
unmaskPayload(payload, mask) {
    const result = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) {
      result[i] = payload[i] ^ mask[i % 4];
    }
    return result;
  }

  handleFrame(client, opcode, data, fin) {
    switch (opcode) {
      case OPCODE.TEXT:
        if (fin) {
          const message = data.toString('utf8');
          this.emit('message', client, message);
          console.log(`Message from ${client.id}: ${message}`);
        }
        break;

      case OPCODE.BINARY:
        this.emit('binary', client, data);
        break;

      case OPCODE.CLOSE:
        const code = data.length >= 2 ? data.readUInt16BE(0) : 1000;
        const reason = data.length > 2 ? data.slice(2).toString('utf8') : '';
        this.handleClose(client, code, reason);
        break;

      case OPCODE.PING:
        this.sendPong(client, data);
        break;

      case OPCODE.PONG:
        this.emit('pong', client, data);
        break;

      default:
        console.warn(`Unknown opcode: ${opcode}`);
    }
  }

  sendText(client, message) {
    this.sendFrame(client, OPCODE.TEXT, Buffer.from(message, 'utf8'));
  }

  sendBinary(client, data) {
    this.sendFrame(client, OPCODE.BINARY, data);
  }

  sendFrame(client, opcode, payload) {
    const frame = this.createFrame(opcode, payload);
    client.socket.write(frame);
  }

  createFrame(opcode, payload) {
    const payloadLength = payload.length;
    let frame;
    
    // Первый байт: FIN=1, opcode
    const byte1 = 0x80 | opcode;
    
    if (payloadLength <= 125) {
      frame = Buffer.alloc(2 + payloadLength);
      frame[0] = byte1;
      frame[1] = payloadLength;
      payload.copy(frame, 2);
    } else if (payloadLength <= 65535) {
      frame = Buffer.alloc(4 + payloadLength);
      frame[0] = byte1;
      frame[1] = 126;
      frame.writeUInt16BE(payloadLength, 2);
      payload.copy(frame, 4);
    } else {
      frame = Buffer.alloc(10 + payloadLength);
      frame[0] = byte1;
      frame[1] = 127;
      frame.writeBigUInt64BE(BigInt(payloadLength), 2);
      payload.copy(frame, 10);
    }
    
    return frame;
  }

  sendPong(client, data) {
    this.sendFrame(client, OPCODE.PONG, data);
  }

  sendClose(client, code = 1000, reason = '') {
    const payload = Buffer.alloc(2 + Buffer.byteLength(reason, 'utf8'));
    payload.writeUInt16BE(code, 0);
    if (reason) {
      payload.write(reason, 2, 'utf8');
    }
    this.sendFrame(client, OPCODE.CLOSE, payload);
    
    // Закрываем соединение после отправки CLOSE фрейма
    setTimeout(() => {
      client.socket.end();
    }, 100);
  }

  handleClose(client, code = 1000, reason = '') {
    console.log(`Client ${client.id} disconnected. Code: ${code}, Reason: ${reason}`);
    this.clients.delete(client);
    this.emit('close', client, code, reason);
  }

  handleError(client, error) {
    console.error(`Error with client ${client.id}:, error.message`);
    this.emit('error', client, error);
  }

  broadcast(message, excludeClient = null) {
    const data = Buffer.from(message, 'utf8');
    for (const client of this.clients) {
      if (client !== excludeClient) {
        this.sendText(client, message);
      }
    }
  }
}

// Пример использования
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (client) => {
  console.log(`New client connected: ${client.id}`);
  
  // Отправляем приветственное сообщение
  wss.sendText(client, `Welcome! Your ID: ${client.id}`);
  
  // Уведомляем всех о новом пользователе
  wss.broadcast(`User ${client.id} joined the chat, client`);
});

wss.on('message', (client, message) => {
  console.log(`[${client.id}]: ${message}`);
  
  // Рассылаем сообщение всем клиентам
  wss.broadcast(`[${client.id}]: ${message}`);
});

wss.on('close', (client, code, reason) => {
  wss.broadcast(`User ${client.id} left the chat`);
});

wss.on('error', (client, error) => {
  console.error('WebSocket error:', error);
});

wss.start();