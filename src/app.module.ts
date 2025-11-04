import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { VacasModule } from './cows/cows.module';
import { TagsModule } from './tags/tags.module';
import { ZoneModule } from './zone/zone.module';
import { DispositivosModule } from './device_esp32/device_esp32.module';
import { DeteccionesModule } from './detection/detection.module';
import { PreferenciasModule } from './preference/preference.module';
import { EventosModule } from './event/event.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver, // 👈 esta línea es la nueva parte obligatoria
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'bqmyd2aitky02ev8ghsh-mysql.services.clever-cloud.com',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'uqahhwk3gqelypw3',
      password: process.env.DB_PASS || 'UJkegRedpjpIjldsDMsu',
      database: process.env.DB_NAME || 'bqmyd2aitky02ev8ghsh',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      timezone: '-06:00',
    }),
    UsersModule,
    VacasModule,
  TagsModule,
  ZoneModule,
    DispositivosModule,
    DeteccionesModule,
  PreferenciasModule,
  EventosModule,
  ],
})
export class AppModule {}
