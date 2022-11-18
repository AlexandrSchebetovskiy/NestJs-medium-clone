import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ProfileType } from "./types/profile.type";
import { ProfileResponseInterface } from "./types/profileResponse.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { FollowEntity } from "./follow.entity";

@Injectable()
export class ProfileService {

  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
  ){}


  async getProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({where: {username: profileUsername}})
    if(!user) throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND)
    const following = await this.followRepository.findOne({where: {followerId: currentUserId, followingId: user.id}})
    return {...user, following: !!following}
  }

  async followProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({where: {username: profileUsername}})
    if(!user) throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND)
    if(currentUserId === user.id) throw new HttpException('Follower and follower cant be equal', HttpStatus.BAD_REQUEST)

    const follow = await this.followRepository.findOne({
      where: {followerId: currentUserId, followingId: user.id}
    })
    if(!follow) {
      const followToCreate = new FollowEntity()
      followToCreate.followerId = currentUserId
      followToCreate.followingId = user.id
      await this.followRepository.save(followToCreate)
    }
    return {...user, following: true}
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email
    return { profile }
  }

  async unfollowProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({where: {username: profileUsername}})
    if(!user) throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND)
    if(currentUserId === user.id) throw new HttpException('Follower and follower cant be equal', HttpStatus.BAD_REQUEST)

    await this.followRepository.delete({followingId: user.id, followerId: currentUserId})
    return {...user, following:false}
  }
}
