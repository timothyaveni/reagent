import { prisma } from '../db/db.js';
import { createUser } from './user.js';

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

export const getLTIConnectionForConsumerKey = async (consumerKey) => {
  const ltiConnection = await prisma.lTIv1p3Connection.findUnique({
    where: {
      consumerKey, // secret is already validated in the passport strategy)
    },
  });

  return ltiConnection;
};

export const handleLTI = async (req, ltiConnection) => {
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
      ltiConnectionId_ltiUserId: {
        ltiConnectionId: ltiConnection.id,
        ltiUserId: req.lti.user_id,
      },
    },
  });

  if (ltiAuth) {
    return {
      id: ltiAuth.userId,
    };
  }

  return null;
};

export const createLTIUser = async (ltiConnectionId, ltiUserId) => {
  const user = await createUser();

  await prisma.lTIv1p3Auth.create({
    data: {
      ltiUserId,
      ltiConnection: {
        connect: {
          id: ltiConnectionId,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return user;
};
