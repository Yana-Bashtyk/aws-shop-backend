import { Handler } from 'aws-lambda';

export const cognitoTokenExchangeHandler: Handler = async function(event) {
  console.log('cognitoTokenExchangeHandler', JSON.stringify(event, null, 2));
  const code = event.queryStringParameters?.code;
  const refreshToken = event.queryStringParameters?.refresh_token;

  const tokenEndpoint = process.env.COGNITO_ENDPOINT;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri || !tokenEndpoint) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message:
        'Missing environment variables'
      }),
    };
  }

  const credentials = `${clientId}:${clientSecret}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  const basicAuthHeaderValue = `Basic ${base64Credentials}`;

  const requestBody = new URLSearchParams();

  if (code) {
    requestBody.append('grant_type', 'authorization_code');
    requestBody.append('client_id', clientId);
    requestBody.append('code', code);
    requestBody.append('redirect_uri', redirectUri);
  } else if (refreshToken) {
    requestBody.append('grant_type', 'refresh_token');
    requestBody.append('client_id', clientId);
    requestBody.append('refresh_token', refreshToken);
  } else {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Authorization code or refresh token not found in request' }),
    };
  }

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': basicAuthHeaderValue,
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error('Error exchanging authorization code or refresh token for id_token');
    }

    const data = await response.json();
    const idToken = data.id_token;
    const refreshToken = data.refresh_token;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: {
        id_token: idToken,
        refresh_token: refreshToken
      } }),
    };
  } catch(err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({message: 'Error exchanging authorization code or refresh token for id_token'}),
    };
  }
}
