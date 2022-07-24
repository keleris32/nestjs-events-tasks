import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatedUserEvent } from './events/created-user.event';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: CreateUserDto) {
    this.logger.log('Creating user >> ', body);

    const userId = '16532';
    this.eventEmitter.emit(
      'created.user',
      new CreatedUserEvent(userId, body.email),
    );

    const establishWsTimeout = setTimeout(
      () => this.establishWsConnection(userId),
      5000,
    );
    this.schedulerRegistry.addTimeout(
      `${userId}_establish_ws`,
      establishWsTimeout,
    );

    return 'User Created Successfully';
  }

  private establishWsConnection(userId: string) {
    this.logger.log('Establishing Web Socket connection...', userId);
  }

  // React to event on a separate thread to avoid blocking response to client
  @OnEvent('created.user')
  welcomeNewUser(payload: CreatedUserEvent) {
    this.logger.log('Welcoming new user >>', payload.email);
  }

  @OnEvent('created.user', { async: true })
  async sendWelcomeGift(payload: CreatedUserEvent) {
    this.logger.log('Sending welcome gift >>', payload.email);

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    this.logger.log('Welcome gift sent!');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_users' })
  deleteExpiredUser() {
    this.logger.log('Deleting expired user...');
  }
}
