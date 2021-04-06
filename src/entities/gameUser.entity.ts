import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('user_order')
export class GameUserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_name: string

  @Column()
  integral_package_name: string

  @Column()
  user_address: string

  @Column()
  user_phone_no: string
}

export const GameUser = {
  column: [{
    key: 'id',
    desc: 'ID'
  }, {
    key: 'user_name',
    desc: '用户名'
  }, {
    key: 'integral_package_name',
    desc: '礼包名称'
  },  {
    key: 'user_address',
    desc: '用户地址'
  }, {
    key: 'user_phone_no',
    desc: '手机号'
  }],
  primary: 'id',
  desc: '用户信息'
}
