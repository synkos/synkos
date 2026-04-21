export interface RequestDeletionDto {
  /** Required for users with a local (email/password) provider. */
  password?: string;
}
