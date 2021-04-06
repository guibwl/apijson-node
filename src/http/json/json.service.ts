import { Injectable} from '@nestjs/common'
import { Repository, getRepository } from 'typeorm'
import * as EntityList from '../../entities'

function getCurrentRepository(entityName:string) {
  const entityNameKey = `${ entityName }Entity`
  return getRepository(EntityList[entityNameKey]) as Repository<any>
}
@Injectable()
export class JsonService {

  async insert(entityName: string, payload: any = {}): Promise<any> {
    const currentRepository = getCurrentRepository(entityName);

    return currentRepository && currentRepository.insert(payload)
  }

  async update(id: any, entityName: string, payload: any = {}): Promise<any> {
    const currentRepository = getCurrentRepository(entityName);

    return currentRepository && currentRepository.update(id, payload)
  }

  async findOne(entityName: string, options: any = {}): Promise<any> {
    const currentRepository = getCurrentRepository(entityName);

    return currentRepository && currentRepository.findOne(options)
  }

  async find(entityName: string, options: any = {}, listOptions: any = {
    page: 1, count: 10
  }): Promise<any[]> {
    const currentRepository = getCurrentRepository(entityName);
    
    const { select, ...restOptions} = options
    return currentRepository && currentRepository.find({
      where: {
        ...restOptions
      },
      select,
      skip: (listOptions.page - 1) * listOptions.count,
      take: listOptions.count
    })
  }
}
