ENV_FILE=prod.env
S3_BUCKET=quarkle-env-files
S3_PATH=backend.env

aws s3 cp ${ENV_FILE} s3://${S3_BUCKET}/${S3_PATH}