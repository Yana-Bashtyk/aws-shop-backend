import * as cdk from 'aws-cdk-lib';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeJsFunctionShared = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
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
  }
}
