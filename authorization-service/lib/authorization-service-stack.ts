import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as path from 'path';
import { config as dotenvConfig }  from 'dotenv';

dotenvConfig();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new NodejsFunction(this, 'basicAuthorizer', {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        yana_bashtyk: process.env.yana_bashtyk!,
      },
      entry: path.join(__dirname,'../lambda/basicAuthorizer.ts'),
      functionName: 'basicAuthorizer',
      handler: 'basicAuthorizerHandler'
    });

    const cognitoTokenExchange = new NodejsFunction(this, 'cognitoTokenExchange', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'cognitoTokenExchange',
      handler: 'cognitoTokenExchangeHandler',
      entry: path.join(__dirname,'../lambda/cognitoTokenExchange.ts'),
      environment: {
        COGNITO_ENDPOINT: process.env.COGNITO_ENDPOINT!,
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID!,
        COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET!,
        REDIRECT_URI: process.env.REDIRECT_URI!,
      },
    });

    const httpApi = new apiGateway.HttpApi(this, 'ProductsHttpApi', {
      apiName: 'Token Exchange Api',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY]
      }
    });

    const cognitoTokenExchangeIntegration = new HttpLambdaIntegration('cognitoTokenExchangeIntegration', cognitoTokenExchange);
    httpApi.addRoutes({
      path: '/token-exchange',
      methods: [apiGateway.HttpMethod.GET],
      integration: cognitoTokenExchangeIntegration
    });
  }
}
