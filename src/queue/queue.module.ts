import { BullModule } from '@nestjs/bullmq';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsConsumer } from './consumers/notifications.consumer';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Parse "redis://localhost:6379" -> host 'localhost' port '6379'
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          return { connection: { host: 'localhost', port: 6379 } };
        }
        const url = new URL(redisUrl);
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port, 10),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationsConsumer],
  exports: [BullModule],
})
export class QueueModule {}
