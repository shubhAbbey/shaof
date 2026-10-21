/**
 * OpenAPI 3.1.0 Type Definitions
 * Typed interfaces for building authoritative, schema-compliant OpenAPI 3.1 documents.
 */

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenApiServer {
  url: string;
  description?: string;
  variables?: Record<string, { default: string; enum?: string[]; description?: string }>;
}

export interface OpenApiTag {
  name: string;
  description?: string;
  externalDocs?: { description?: string; url: string };
}

export interface OpenApiSchema {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: any[];
  const?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  items?: OpenApiSchema | { $ref: string };
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  properties?: Record<string, OpenApiSchema | { $ref: string }>;
  required?: string[];
  additionalProperties?: boolean | OpenApiSchema | { $ref: string };
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: any;
  examples?: any[];
  deprecated?: boolean;
  $ref?: string;
  allOf?: Array<OpenApiSchema | { $ref: string }>;
  oneOf?: Array<OpenApiSchema | { $ref: string }>;
  anyOf?: Array<OpenApiSchema | { $ref: string }>;
  not?: OpenApiSchema | { $ref: string };
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  schema?: OpenApiSchema | { $ref: string };
  example?: any;
  examples?: Record<string, { summary?: string; description?: string; value: any }>;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema | { $ref: string };
  example?: any;
  examples?: Record<string, { summary?: string; description?: string; value: any }>;
}

export interface OpenApiRequestBody {
  description?: string;
  content: Record<string, OpenApiMediaType>;
  required?: boolean;
}

export interface OpenApiResponse {
  description: string;
  headers?: Record<string, { description?: string; schema?: OpenApiSchema | { $ref: string } }>;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
  deprecated?: boolean;
  security?: Array<Record<string, string[]>>;
  servers?: OpenApiServer[];
}

export interface OpenApiPathItem {
  summary?: string;
  description?: string;
  get?: OpenApiOperation;
  put?: OpenApiOperation;
  post?: OpenApiOperation;
  delete?: OpenApiOperation;
  options?: OpenApiOperation;
  head?: OpenApiOperation;
  patch?: OpenApiOperation;
  trace?: OpenApiOperation;
  servers?: OpenApiServer[];
  parameters?: OpenApiParameter[];
}

export interface OpenApiSecurityScheme {
  type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: Record<string, any>;
  openIdConnectUrl?: string;
}

export interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema>;
  responses?: Record<string, OpenApiResponse>;
  parameters?: Record<string, OpenApiParameter>;
  examples?: Record<string, any>;
  requestBodies?: Record<string, OpenApiRequestBody>;
  headers?: Record<string, any>;
  securitySchemes?: Record<string, OpenApiSecurityScheme>;
  links?: Record<string, any>;
  callbacks?: Record<string, any>;
}

export interface OpenApiDocument {
  openapi: string; // '3.1.0'
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths: Record<string, OpenApiPathItem>;
  components?: OpenApiComponents;
  security?: Array<Record<string, string[]>>;
  tags?: OpenApiTag[];
  externalDocs?: { description?: string; url: string };
}
