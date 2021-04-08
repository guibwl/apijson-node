import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import axios from 'axios';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: any) {
    return this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<any[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: any) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }

  @Post('proxy')
  async proxy() {
    return await axios.post('http://apijson.cn:8080/get', {"User":{"id": 82001}})
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  }
}
