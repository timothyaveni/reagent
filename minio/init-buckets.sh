#!/bin/bash

mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

mc mb -p myminio/noggin-run-outputs
mc anonymous set-json /minio-cfg/noggin-run-outputs-read-policy.json myminio/noggin-run-outputs


mc admin user add myminio $OBJECT_STORAGE_ACCESS_KEY $OBJECT_STORAGE_SECRET_KEY
mc admin policy attach myminio readwrite --user=$OBJECT_STORAGE_ACCESS_KEY
