const fastify = require('fastify')({ logger: true });
const { spawn } = require('child_process');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: process.env.ENV === 'development' ? './service_account.json' : undefined, 
  projectId: process.env.ENV === 'development' ? 'getmusic-302718' : undefined,
});

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          properties: {
            attributes: { type: 'object' },
            data: { type: 'string' },
            messageId: { type: 'string' },
          },
        },
        subscription: { type: 'string' }
      }
    }
  }
};

const getFilename = async (url) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('youtube-dl', [url, '-x', '--audio-format', 'opus', '-o', '%(title)s.opus', '--get-filename'], {
      timeout: 30 * 1000
    });

    proc.stdout.on('data', (data) => resolve(Buffer.from(data).toString('utf8').trim()));

    proc.stderr.on('data', (data) => {
      reject(Buffer.from(data).toString('utf8').trim());
    })

    proc.on('error', (err) => {
      reject(err);
    });

    proc.on('close', (code) => {
      console.log('Process closed with exit code', code)
    })
  });
}

const download = async (url) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('youtube-dl', [url, '-x', '--audio-format', 'opus', '-o', '%(title)s.opus']);

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stderr.on('data', (data) => {
      reject(Buffer.from(data).toString('utf8').trim());
    })

    proc.on('error', (err) => {
      reject(err);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    })
  });
}

fastify.get('/health', async () => {
  return 'OK';
});

fastify.post('/youtube', opts, async (request, reply) => {
  const url = Buffer.from(request.body.message.data, 'base64').toString().trim();

  console.log(`Received request for ${url}`);

  const filename = await getFilename(url);

  const uploadingTimeLabel = `Uploading time ${filename} ${url}`;
  const processingTimeLabel = `Processing time: ${filename} ${url}`;

  console.log(`Processing: ${filename} ${url}`);
  console.time(processingTimeLabel);

  await download(url);

  console.timeEnd(processingTimeLabel);

  console.log(`Uploading ${filename} (${url})`);
  console.time(uploadingTimeLabel);

  await storage.bucket('mortmortis-music').upload(`./${filename}`, {
    destination: filename,
  });

  console.timeEnd(uploadingTimeLabel);

  return true;
});

const start = async () => {
  try {
    console.log('Starting server on 3000 port');
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', () => {
  process.exit(1);
});

process.on('SIGINT', () => {
  process.exit(1);
});

