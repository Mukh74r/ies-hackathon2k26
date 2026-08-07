#!/bin/bash
# DeepHub AI - Manual ECS Deployment Script
# Run this in AWS CloudShell

set -e

echo "=== DeepHub AI Manual Deployment ==="
echo ""

# Variables
AWS_REGION="ap-south-1"
ECR_REPO_URI="278035644348.dkr.ecr.ap-south-1.amazonaws.com/deephub-ai-backend"
ECS_CLUSTER="DeepHub-Neural-Cluster"
ECS_SERVICE="DeepHub-Neural-Service"
TASK_FAMILY="DeepHub-Neural-Core"
CONTAINER_NAME="DeepHub-Backend"

# Clone the repository
echo "Step 1: Cloning repository..."
git clone https://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@github.com/DeepHub-AI-Files/DeepHubAI.git
cd DeepHubAI

# Verify we're on the right commit
echo "Step 2: Verifying maintenance mode is enabled..."
grep "MAINTENANCE_MODE = true" src/App.tsx && echo "✓ Maintenance mode confirmed" || echo "✗ Warning: Maintenance mode not found"

# Login to ECR
echo "Step 3: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI

# Get commit hash
IMAGE_TAG=$(git rev-parse --short HEAD)
IMAGE_URI="$ECR_REPO_URI:$IMAGE_TAG"
LATEST_URI="$ECR_REPO_URI:latest"

echo "Step 4: Installing dependencies..."
npm ci --prefer-offline --legacy-peer-deps

echo "Step 5: Building frontend..."
npm run build

echo "Step 6: Building Docker image..."
docker build -t $IMAGE_URI .
docker tag $IMAGE_URI $LATEST_URI

echo "Step 7: Pushing to ECR..."
docker push $IMAGE_URI
docker push $LATEST_URI

echo "Step 8: Updating ECS task definition..."
aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $AWS_REGION --query taskDefinition > current-task.json

# Update image in task definition
python3 << EOF
import json
with open('current-task.json', 'r') as f:
    task = json.load(f)

# Update container image
for container in task['containerDefinitions']:
    if container['name'] == '$CONTAINER_NAME':
        container['image'] = '$IMAGE_URI'

# Remove fields that can't be used in register-task-definition
for key in ['taskDefinitionArn', 'revision', 'status', 'requiresAttributes', 'compatibilities', 'registeredAt', 'registeredBy']:
    task.pop(key, None)

with open('new-task.json', 'w') as f:
    json.dump(task, f)
EOF

echo "Step 9: Registering new task definition..."
NEW_TASK_ARN=$(aws ecs register-task-definition --cli-input-json file://new-task.json --region $AWS_REGION --query taskDefinition.taskDefinitionArn --output text)
echo "New task ARN: $NEW_TASK_ARN"

echo "Step 10: Updating ECS service..."
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $NEW_TASK_ARN --force-new-deployment --region $AWS_REGION

echo ""
echo "=== Deployment Complete! ==="
echo "ECS will now deploy the new task with maintenance mode enabled."
echo "Check ECS console for deployment progress."
echo "It may take 2-5 minutes for the new task to become healthy and start serving traffic."
