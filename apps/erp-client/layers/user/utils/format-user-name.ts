interface NamedUser {
  firstName: string;
  lastName: string;
}

export function formatUserName(user: NamedUser | null | undefined): string {
  if (!user) {
    return '';
  }

  return `${user.firstName} ${user.lastName}`.trim();
}
