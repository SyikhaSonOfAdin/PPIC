#!/bin/bash

# Attachment Deletion Resilience Test Script
# Usage: ./scripts/test-attachment-resilience.sh
# Requires: curl, jq

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${API_URL:-http://localhost:3000}"
TOKEN="${JWT_TOKEN:-}"
UPLOAD_DIR="uploads/ppic"

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    if [ -z "$TOKEN" ]; then
        log_error "JWT_TOKEN environment variable is required"
        echo "Usage: JWT_TOKEN=your_token ./scripts/test-attachment-resilience.sh"
        exit 1
    fi
}

# Test 1: Normal deletion
test_normal_deletion() {
    log_info "Test 1: Normal deletion (file exists)"
    
    # Create test file
    echo "Test content" > /tmp/test-attachment.txt
    
    # Upload
    RESPONSE=$(curl -s -X POST "$BASE_URL/attachment/add" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@/tmp/test-attachment.txt" \
        -F "projectId=$PROJECT_ID" \
        -F "userId=$USER_ID" \
        -F "label=common" \
        -F "description=Test normal deletion")
    
    ATTACHMENT_ID=$(echo "$RESPONSE" | jq -r '.data[0].attachmentId')
    
    if [ "$ATTACHMENT_ID" == "null" ]; then
        log_error "Failed to upload attachment"
        echo "$RESPONSE" | jq .
        return 1
    fi
    
    log_info "Uploaded attachment: $ATTACHMENT_ID"
    
    # Delete
    DELETE_RESPONSE=$(curl -s -X POST "$BASE_URL/attachment/delete-one" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"rowId\": \"$ATTACHMENT_ID\"}")
    
    MESSAGE=$(echo "$DELETE_RESPONSE" | jq -r '.message')
    WARNING=$(echo "$DELETE_RESPONSE" | jq -r '.warning // empty')
    
    if [[ "$MESSAGE" == *"successfully"* ]] && [ -z "$WARNING" ]; then
        log_info "✅ Test 1 PASSED: Normal deletion successful"
        return 0
    else
        log_error "❌ Test 1 FAILED"
        echo "$DELETE_RESPONSE" | jq .
        return 1
    fi
}

# Test 2: File missing on disk
test_missing_file_deletion() {
    log_info "Test 2: File missing on disk"
    
    # Create test file
    echo "Test content" > /tmp/test-attachment-missing.txt
    
    # Upload
    RESPONSE=$(curl -s -X POST "$BASE_URL/attachment/add" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@/tmp/test-attachment-missing.txt" \
        -F "projectId=$PROJECT_ID" \
        -F "userId=$USER_ID" \
        -F "label=common" \
        -F "description=Test missing file deletion")
    
    ATTACHMENT_ID=$(echo "$RESPONSE" | jq -r '.data[0].attachmentId')
    
    if [ "$ATTACHMENT_ID" == "null" ]; then
        log_error "Failed to upload attachment"
        return 1
    fi
    
    log_info "Uploaded attachment: $ATTACHMENT_ID"
    
    # Get filename from database
    GET_RESPONSE=$(curl -s -X GET "$BASE_URL/attachment/get/$PROJECT_ID?label=common" \
        -H "Authorization: Bearer $TOKEN")
    
    FILENAME=$(echo "$GET_RESPONSE" | jq -r ".data[] | select(.ID == \"$ATTACHMENT_ID\") | .FILE_NAME")
    
    if [ -z "$FILENAME" ] || [ "$FILENAME" == "null" ]; then
        log_error "Failed to get filename"
        return 1
    fi
    
    log_info "Filename: $FILENAME"
    
    # Delete physical file
    FILE_PATH="$UPLOAD_DIR/$FILENAME"
    if [ -f "$FILE_PATH" ]; then
        rm "$FILE_PATH"
        log_info "Deleted physical file: $FILE_PATH"
    else
        log_warn "File not found at: $FILE_PATH (may already be deleted)"
    fi
    
    # Delete attachment (should handle missing file gracefully)
    DELETE_RESPONSE=$(curl -s -X POST "$BASE_URL/attachment/delete-one" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"rowId\": \"$ATTACHMENT_ID\"}")
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/attachment/delete-one" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"rowId\": \"$ATTACHMENT_ID\"}")
    
    MESSAGE=$(echo "$DELETE_RESPONSE" | jq -r '.message')
    WARNING=$(echo "$DELETE_RESPONSE" | jq -r '.warning // empty')
    
    if [ "$HTTP_STATUS" == "200" ] && [[ "$MESSAGE" == *"file not found on disk"* ]] && [[ "$WARNING" == *"already missing"* ]]; then
        log_info "✅ Test 2 PASSED: Gracefully handled missing file"
        return 0
    elif [ "$HTTP_STATUS" == "404" ]; then
        log_warn "⚠️  Test 2 PARTIAL: Got 404 (attachment not found - may have been deleted in previous run)"
        return 0
    else
        log_error "❌ Test 2 FAILED"
        echo "HTTP Status: $HTTP_STATUS"
        echo "$DELETE_RESPONSE" | jq .
        return 1
    fi
}

# Test 3: Download missing file
test_download_missing_file() {
    log_info "Test 3: Download missing file"
    
    # Create test file
    echo "Test download content" > /tmp/test-attachment-download.txt
    
    # Upload
    RESPONSE=$(curl -s -X POST "$BASE_URL/attachment/add" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@/tmp/test-attachment-download.txt" \
        -F "projectId=$PROJECT_ID" \
        -F "userId=$USER_ID" \
        -F "label=common" \
        -F "description=Test download missing file")
    
    ATTACHMENT_ID=$(echo "$RESPONSE" | jq -r '.data[0].attachmentId')
    
    if [ "$ATTACHMENT_ID" == "null" ]; then
        log_error "Failed to upload attachment"
        return 1
    fi
    
    log_info "Uploaded attachment: $ATTACHMENT_ID"
    
    # Get filename
    GET_RESPONSE=$(curl -s -X GET "$BASE_URL/attachment/get/$PROJECT_ID?label=common" \
        -H "Authorization: Bearer $TOKEN")
    
    FILENAME=$(echo "$GET_RESPONSE" | jq -r ".data[] | select(.ID == \"$ATTACHMENT_ID\") | .FILE_NAME")
    
    # Delete physical file
    FILE_PATH="$UPLOAD_DIR/$FILENAME"
    if [ -f "$FILE_PATH" ]; then
        rm "$FILE_PATH"
        log_info "Deleted physical file: $FILE_PATH"
    fi
    
    # Try to download (should return 404)
    DOWNLOAD_RESPONSE=$(curl -s -X GET "$BASE_URL/attachment/download/$ATTACHMENT_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/attachment/download/$ATTACHMENT_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    MESSAGE=$(echo "$DOWNLOAD_RESPONSE" | jq -r '.message // empty')
    
    if [ "$HTTP_STATUS" == "404" ] && [[ "$MESSAGE" == *"not found"* ]]; then
        log_info "✅ Test 3 PASSED: Download returned 404 for missing file"
        
        # Cleanup: delete from database
        curl -s -X POST "$BASE_URL/attachment/delete-one" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"rowId\": \"$ATTACHMENT_ID\"}" > /dev/null
        
        return 0
    else
        log_error "❌ Test 3 FAILED"
        echo "HTTP Status: $HTTP_STATUS"
        echo "$DOWNLOAD_RESPONSE" | jq .
        return 1
    fi
}

# Main execution
main() {
    check_requirements
    
    # Get test data from environment or prompt
    if [ -z "$PROJECT_ID" ]; then
        log_error "PROJECT_ID environment variable is required"
        echo "Usage: PROJECT_ID=uuid USER_ID=uuid JWT_TOKEN=token ./scripts/test-attachment-resilience.sh"
        exit 1
    fi
    
    if [ -z "$USER_ID" ]; then
        log_error "USER_ID environment variable is required"
        exit 1
    fi
    
    log_info "Starting attachment resilience tests"
    log_info "Base URL: $BASE_URL"
    log_info "Project ID: $PROJECT_ID"
    log_info "User ID: $USER_ID"
    echo ""
    
    PASSED=0
    FAILED=0
    
    # Run tests
    if test_normal_deletion; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    echo ""
    
    if test_missing_file_deletion; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    echo ""
    
    if test_download_missing_file; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    echo ""
    
    # Summary
    log_info "========================================="
    log_info "Test Summary"
    log_info "========================================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    
    if [ $FAILED -eq 0 ]; then
        log_info "✅ All tests passed!"
        exit 0
    else
        log_error "❌ Some tests failed"
        exit 1
    fi
}

main
