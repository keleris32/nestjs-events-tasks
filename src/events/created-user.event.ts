export class CreatedUserEvent {
  constructor(public readonly userId: string, public readonly email: string) {}
}
