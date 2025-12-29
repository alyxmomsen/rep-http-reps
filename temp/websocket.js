import { createServer } from 'http';
import { createHash } from 'crypto';
import { parse } from 'url';
import net from 'net';

const PORT = 8080;
const clients = new Set();

// Генерация ключа Accept для рукопожатия
function generateAcceptKey(key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return createHash('sha1').update(key + GUID).digest('base64');
}

// Парсинг кадра WebSocket
function parseFrame(buffer) {
  const firstByte = buffer[0];
  const opcode = firstByte & 0x0F;
  if (opcode === 0x08) return { close: true };

  const secondByte = buffer[1];
  const isMasked = !!(secondByte & 0x80);
  let offset = 2;
  let payloadLength = secondByte & 0x7F;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(2);
    offset += 2;
  } else if (payloadLength === 127) {
    payloadLength = buffer.readBigUInt64BE(2);
    offset += 8;
  }

  let mask;
  if (isMasked) {
    mask = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  const payload = buffer.slice(offset, offset + Number(payloadLength));
  if (isMasked && mask) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }
  }

  return { data: payload.toString('utf8') };
}

// Создание кадра для отправки
function createFrame(message) {
  const data = Buffer.from(message, 'utf8');
  const length = data.length;
  let frame;

  if (length < 126) {
    frame = Buffer.allocUnsafe(2 + length);
    frame[0] = 0x81; // FIN + text frame
    frame[1] = length;
    data.copy(frame, 2);
  } else if (length < 65536) {
    frame = Buffer.allocUnsafe(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    data.copy(frame, 4);
  } else {
    frame = Buffer.allocUnsafe(10 + length);
    frame[0] = 0x81;
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(length), 2);
    data.copy(frame, 10);
  }

  return frame;
}

// HTTP-сервер для раздачи HTML и обработки Upgrade
const httpServer = createServer((req, res) => {
  const path = parse(req.url).pathname;
  if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      `<!doctype html>
      <title>WebSocket Test</title>
      <h1>WebSocket на чистом Node.js</h1>
      <input id="msg" placeholder="Введите сообщение" />
      <button onclick="send()">Отправить</button>
      <pre id="log"></pre>
      <script>
        const ws = new WebSocket('ws://localhost:8080');
        const log = (text) => document.getElementById('log').textContent += text + '\\n';
        ws.onopen = () => log('Подключено');
        ws.onmessage = (e) => log('Сервер: ' + e.data);
        ws.onclose = () => log('Отключено');
        function send() {
          const input = document.getElementById('msg');
          ws.send(input.value);
          log('Вы: ' + input.value);
          input.value = '';
        }
      </script>`
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Обработка Upgrade на WebSocket
httpServer.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = generateAcceptKey(key);
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
    '\r\n'
  );

  clients.add(socket);

  socket.on('data', (buf) => {
    const frame = parseFrame(buf);
    if (frame.close) {
      socket.destroy();
      clients.delete(socket);
      return;
    }
    if (frame.data) {
      const reply = createFrame(frame.data);
      for (const client of clients) {
        if (client.readyState === 1) client.write(reply);
      }
    }
  });

  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
});

httpServer.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost: ${PORT}`);
  }
);