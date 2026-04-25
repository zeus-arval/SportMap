namespace SportMap.AL.Constants
{
    public static class ResultConstants
    {
        public const string NotFound = "The requested resource {0} was not found.";
        public const string Created = "The requested resource {0} was created as a result.";
        public const string Forbidden = "Access to resource {0} is forbidden.";
        public const string InvalidMimeType = "File {0} has an unsupported type. Only JPEG and PNG are accepted.";
        public const string FileTooLarge = "File {0} exceeds the maximum allowed size.";
        public const string StorageUnavailable = "The image storage is currently unavailable.";
        public const string InternalError = "An internal error occurred. Please try again.";
        public const string OperationCanceled = "Operation was canceled.";
        public const string NoPictureSet = "No profile picture is currently set.";
        public const string UsernameTaken = "Username '{0}' is already taken.";
        public const string InvalidPrivacyValue = "Privacy value '{0}' is invalid. Use 'public' or 'private'.";
    }
}
