import { Injectable} from '@nestjs/common'

interface Cat {
  [key: string]: any;
}

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
    return "Successfully add."
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
