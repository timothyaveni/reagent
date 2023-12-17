import { prisma } from '../db/db.js';

export const getSecretForConsumerKey = async (consumerKey) => {
  const ltiConnection = await prisma.lTIv1p3Connection.findUnique({
    where: {
      consumerKey,
    },
    select: {
      consumerSecret: true,
    },
  });

  if (!ltiConnection) {
    throw new Error('LTI connection not found');
  }

  return ltiConnection.consumerSecret;
};

export const handleLTI = async (req) => {
  const ltiConnection = await prisma.lTIv1p3Connection.findUnique({
    where: {
      consumerKey: req.body.oauth_consumer_key, // secret is already validated in the passport strategy
    },
    select: {
      id: true,
      lastSeenConsumerName: true,
    },
  });

  if (!ltiConnection) {
    throw new Error('LTI connection not found');
  }

  console.log(ltiConnection);

  const launchConsumerName = req.lti.tool_consumer_instance_name;

  if (
    launchConsumerName &&
    launchConsumerName !== ltiConnection.lastSeenConsumerName
  ) {
    await prisma.lTIv1p3Connection.update({
      where: {
        id: ltiConnection.id,
      },
      data: {
        lastSeenConsumerName: req.lti.tool_consumer_instance_name || '',
      },
    });
  }

  // we're going to find THROUGH the connection
  const ltiAuth = await prisma.lTIv1p3Auth.findUnique({
    where: {
      ltiConnection: ltiConnection,
      ltiUserId: req.lti.user_id,
    },
  });

  if (ltiAuth) {
    return {
      id: ltiAuth.userId,
    };
  }

  return null;
};
