import { Handler } from 'aws-lambda';

const generatePolicy = (principalId: string, effect: string, resource: string) => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

export const basicAuthorizerHandler: Handler = async function(event) {
  console.log('basicAuthorizerHandler', JSON.stringify(event, null, 2));

  try {
    const { authorizationToken, methodArn } = event;

    if (!authorizationToken) {
      return generatePolicy('user', 'Deny', methodArn);
    }

    const encodedCredentials = authorizationToken.split(' ')[1];
    const [username, password] = Buffer.from(encodedCredentials, 'base64').toString().split(':');
    console.log(`username: ${username}, password ${password}`);

    const storedPassword = process.env[username];
    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow';
    return generatePolicy('user', effect, methodArn);

  } catch(err: any) {
    console.error('Error in basicAuthorizer:', err);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
}
