import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { UserService } from "./user.service";
import { createUserDto } from "./dto/createUser.dto";
import { UserResponseInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/loginUser.dto";
import { User } from "./decorators/user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { BackendValidationPipe } from "../shared/pipes/backendValidation.pipe";

@Controller()
export class UserController {

  constructor(private userService: UserService) {}

  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(@Body('user') createUserDto: createUserDto):Promise<UserResponseInterface> {
    const user = await  this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto)
    return this.userService.buildUserResponse(user)
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity):Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user)
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(@Body('user') updateUserDto: UpdateUserDto, @User('id') id:number)
    : Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(updateUserDto, id)
    return this.userService.buildUserResponse(user)
  }
}
