interface AzureCredentials {
    azure_connection_string: string;
    azure_container_name: string;
}

interface AWSCredentials {
    aws_access_key: string;
    aws_secret_key: string;
    aws_bucket_name: string;
}


export type CustomCloudStorage = {
    id: string;
    tenant_id: string;
    created: string;
    updated: string;
} & (
        | { storage_type: 'aws_s3'; credentials: AWSCredentials }
        | { storage_type: 'azure_blob'; credentials: AzureCredentials }
    );
