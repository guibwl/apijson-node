import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { JsonModule } from './json/json.module'
import { AppController } from './app.controller'
import { CatsModule } from './cats/cats.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    JsonModule,
    CatsModule,
  ],
  controllers: [
    AppController
  ],
  providers: []
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
