import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { createUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {sign} from 'jsonwebtoken'
import { JWT_SECRET } from "../../config";
import { UserResponseInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/loginUser.dto";
import {compare} from 'bcrypt'
import { UpdateUserDto } from "./dto/updateUser.dto";

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {}

  async createUser(createUserDto: createUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {}
    }
    const userByEmail = await this.userRepository.findOne({where: {email: createUserDto.email}})
    const userByUsername = await this.userRepository.findOne({where: {username: createUserDto.username}})

    if(userByEmail) errorResponse.errors['email'] = 'has already been taken'
    if(userByUsername) errorResponse.errors['username'] = 'has already been taken'
    if(userByEmail || userByUsername){
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto)
    return await this.userRepository.save(newUser);
  }


  async login(loginUserDto: LoginUserDto):Promise<UserEntity> {
    const errorResponse = {
      errors: {}
    }
    const user = await this.userRepository.findOne({where: {email: loginUserDto.email}, select: ['id','username', 'bio', 'email', 'img', 'password']})

    if(!user) errorResponse.errors['email'] = 'User with such email does not exist'
    const isPasswordCorrect = await compare(loginUserDto.password, user.password)
    if(!isPasswordCorrect) errorResponse.errors['password'] = 'password does not match'
    if(!user || !isPasswordCorrect){
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
    }
    delete user.password
    return user
  }
  async findUserById(id:number): Promise<UserEntity> {
    return await this.userRepository.findOne({where: {id}})
  }


  async updateUser(updateUserDto: UpdateUserDto, id:number): Promise<UserEntity> {
    const user = await this.findUserById(id)
    Object.assign(user, updateUserDto)
    return await this.userRepository.save(user)
  }

  buildUserResponse(user: UserEntity):UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user)
      }
    }
  }

  generateJwt(user: UserEntity) {
    return sign({
      id:user.id,
      username: user.username,
      email:user.email
    },JWT_SECRET)
  }

}
