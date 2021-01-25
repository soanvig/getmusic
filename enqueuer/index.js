const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub({
  keyFilename: process.env.ENV === 'development' ? './service_account.json' : undefined, 
  projectId: process.env.ENV === 'development' ? 'getmusic-302718' : undefined,
});

const topics = {
  youtube: 'projects/getmusic-302718/topics/youtube',
}

exports.enqueuer = async (req, res) => {
  const url = req.body.url;
  const dataBuffer = Buffer.from(url);

  await pubSubClient.topic(topics.youtube).publish(dataBuffer);

  res.status(202).send();
};
