from enum import Enum



class ResponseSignal(Enum):
    FILE_VALIDATED_SUCCESS = "file_validate_successfully"
    FILE_TYPE_NOT_SUPPORTED = "File type not supported"
    FILE_SIZE_EXCEEDED = "File size exceeded"


    FILE_UPLOAD_SUCCESS = "file_upload_success"
    FILE_UPLOAD_FAILED = "file_upload_failed"
    
    PROJECT_CREATED_SUCCESS = "project_created_success"
    PROJECT_NOT_FOUND = "project_not_found"
    PROJECT_DELETED_SUCCESS = "project_deleted_success"
    PROJECT_DELETE_FAILED = "project_delete_failed"
    
    FILE_NOT_FOUND = "file_not_found"
    FILE_DELETED_SUCCESS = "file_deleted_success"
    FILE_DELETE_FAILED = "file_delete_failed"
    FILE_DO_NOT_HAVE_NAME = "file_name_is_too_short"
    NO_FILES_ERROR = "not_found_files"
    FILE_ID_ERROR = "no_file_found_with_this_id"

    PROCESSING_SUCCESS = "processing_success"
    PROCESSING_FAILED = "processing_failed"
    PROJECT_SIZE_EXCEEDED = "project_size_exceeded"