import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform, ValidationError } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export class BackendValidationPipe implements PipeTransform{
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const object = plainToInstance(metadata.metatype, value)
    const errors = await validate(object)

    if(errors.length === 0) return value

    throw new HttpException({errors: this.formatErrors(errors)}, HttpStatus.UNPROCESSABLE_ENTITY)
  }

  private formatErrors(errors: ValidationError[])  {
    return errors.reduce((acc, error) => {
      acc[error.property] = Object.values(error.constraints)
      return acc
    }, {})
  }
}