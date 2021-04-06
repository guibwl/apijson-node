import { UserEntity, User } from './user.entity'
import { CommentEntity, Comment } from './comment.entity'
import { MyRoleEntity, Role } from './role.entity'
import { GameUserEntity, GameUser } from './gameUser.entity'

const config = {
  User,
  Comment,
  Role,
  GameUser,
}

export {
  UserEntity,
  CommentEntity,
  MyRoleEntity,
  GameUserEntity,
  config
}