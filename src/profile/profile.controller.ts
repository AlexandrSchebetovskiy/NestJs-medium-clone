import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { User } from "../user/decorators/user.decorator";
import { ProfileResponseInterface } from "./types/profileResponse.interface";
import { AuthGuard } from "../user/guards/auth.guard";

@Controller('profiles')
export class ProfileController {

  constructor(private profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') userId: number,
    @Param('username') profileUsername: string
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(userId,profileUsername )
    return this.profileService.buildProfileResponse(profile)
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId:number,
    @Param('username') profileUsername: string
    ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(currentUserId,profileUsername )
    return this.profileService.buildProfileResponse(profile)
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @User('id') currentUserId:number,
    @Param('username') profileUsername: string
  ) :Promise<ProfileResponseInterface>{
    const profile = await this.profileService.unfollowProfile(currentUserId,profileUsername )
    return this.profileService.buildProfileResponse(profile)
  }

}