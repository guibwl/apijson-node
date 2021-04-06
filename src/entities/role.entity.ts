import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('role')
export class MyRoleEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  type: string

  @Column()
  role: string
}

export const Role = {
  column: [{
    key: 'id',
    desc: 'ID'
  }, {
    key: 'name',
    desc: '用户名'
  }, {
    key: 'type',
    desc: '昵称'
  }, {
    key: 'role',
    desc: '角色'
  }],
  primary: 'id',
  desc: '角色表'
}
