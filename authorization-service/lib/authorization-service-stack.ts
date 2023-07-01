import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';

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
  }
}
