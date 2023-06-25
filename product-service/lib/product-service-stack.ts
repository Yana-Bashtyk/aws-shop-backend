import * as cdk from 'aws-cdk-lib';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

import * as path from 'path';
import { config as dotenvConfig }  from 'dotenv';

dotenvConfig();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeJsFunctionShared = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        RDS_HOST: process.env.RDS_HOST!,
        RDS_PORT: process.env.RDS_PORT!,
        RDS_USER: process.env.RDS_USER!,
        RDS_PASSWORD: process.env.RDS_PASSWORD!,
        RDS_DATABASE: process.env.RDS_DATABASE!
      },
      bundling: {
        externalModules: [
          'better-sqlite3',
          'mysql2',
          'mysql',
          'tedious',
          'sqlite3',
          'pg-query-stream',
          'oracledb',
        ],
      },
    }

    const getProductsList = new NodejsFunction(this, 'getProductsList', {
      ...nodeJsFunctionShared,
      entry: path.join(__dirname,'../lambda/getProductsList.ts'),
      functionName: 'getProductsList',
      handler: 'productsListHandler'
    });

    const getProductsById = new NodejsFunction(this, 'getProductsById', {
      ...nodeJsFunctionShared,
      entry: path.join(__dirname,'../lambda/getProductsById.ts'),
      functionName: 'getProductsById',
      handler: 'productsIdHandler'
    });

    const createProduct = new NodejsFunction(this, 'createProduct', {
      ...nodeJsFunctionShared,
      entry: path.join(__dirname,'../lambda/createProduct.ts'),
      functionName: 'createProduct',
      handler: 'createProductHandler'
    });

    const httpApi = new apiGateway.HttpApi(this, 'ProductsHttpApi', {
      apiName: 'Products Http Api',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY]
      }
    });

    const getProductsListIntegration = new HttpLambdaIntegration('productsIntegration', getProductsList);
    httpApi.addRoutes({
      path: '/products',
      methods: [apiGateway.HttpMethod.GET],
      integration: getProductsListIntegration,
    });

    const getProductsByIdIntegration = new HttpLambdaIntegration('productsByIdIntegration', getProductsById);
    httpApi.addRoutes(
      {
        path: '/products/{productId}',
        methods: [apiGateway.HttpMethod.GET],
        integration: getProductsByIdIntegration,
      }
    )

    const createProductIntegration = new HttpLambdaIntegration('createProductIntegration', createProduct);
    httpApi.addRoutes({
      path: '/products',
      methods: [apiGateway.HttpMethod.POST],
      integration: createProductIntegration,
    });

    const createProductTopic = new sns.Topic(this, 'createProductTopic', {
      topicName: 'createProductTopic',
    });

    createProductTopic.addSubscription(new subscriptions.EmailSubscription(process.env.EMAIL_ADDRESS!));

    const catalogBatchProcess = new NodejsFunction(this, 'catalogBatchProcess', {
      ...nodeJsFunctionShared,
      entry: path.join(__dirname,'../lambda/catalogBatchProcess.ts'),
      functionName: 'catalogBatchProcess',
      handler: 'catalogBatchProcessHandler',
      timeout: cdk.Duration.seconds(30),
      environment: {
        ...nodeJsFunctionShared.environment,
        CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn
      }
    });

    createProductTopic.grantPublish(catalogBatchProcess);

    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: cdk.Duration.seconds(30)
    });

    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
      batchSize: 5,
    }));
  }
}
